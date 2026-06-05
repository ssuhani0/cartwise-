from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_optional_user
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.recommendation import Recommendation
from app.ai.llm import (
    get_recommendations,
    get_budget_alternatives,
    suggest_combos,
    recommend_based_on_recipe,
    predict_monthly_groceries,
)

router = APIRouter(prefix="/api/v1/recommendations", tags=["Recommendations"])


class RecipeRequest(BaseModel):
    recipe_name: str


@router.get("")
async def get_personalized_recommendations(
    query: Optional[str] = Query(None),
    user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    user_history = []

    if user:
        order_results = await db.execute(
            select(Order).where(Order.user_id == user.id).order_by(desc(Order.created_at)).limit(10)
        )
        orders = order_results.scalars().all()
        for order in orders:
            for item in order.items:
                user_history.append({
                    "product_name": item.product.name if item.product else "Unknown",
                    "quantity": item.quantity,
                    "price": item.unit_price,
                })

    product_result = await db.execute(select(Product).where(Product.is_available == True).limit(100))
    products = product_result.scalars().all()
    available = []
    for p in products:
        try:
            cat_name = p.category.name if p.category else None
        except Exception:
            cat_name = None
        available.append({"id": str(p.id), "name": p.name, "price": p.price, "category": cat_name})

    # If query provided, use it as context for LLM
    if query:
        user_history.append({"query": query})

    recommendations = await get_recommendations(user_history, available)

    return {"recommendations": recommendations, "based_on": "purchase_history" if user else "general"}


@router.get("/trending")
async def get_trending(db: AsyncSession = Depends(get_db)):
    product_result = await db.execute(
        select(Product).where(Product.is_available == True).order_by(desc(Product.rating)).limit(20)
    )
    products = product_result.scalars().all()

    return {
        "trending": [
            {
                "id": str(p.id),
                "name": p.name,
                "price": p.price,
                "discounted_price": p.discounted_price,
                "rating": p.rating,
                "image_url": p.image_url,
                "category": p.category.name if p.category else None,
            }
            for p in products
        ]
    }


@router.get("/budget-optimization")
async def get_budget_options(
    budget: float = Query(..., ge=100),
    user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    cart_items = []
    if user and user.cart:
        for item in user.cart.items:
            cart_items.append({
                "name": item.product.name if item.product else "Unknown",
                "price": item.unit_price,
                "quantity": item.quantity,
            })

    if not cart_items:
        product_result = await db.execute(
            select(Product).where(Product.is_available == True).limit(20)
        )
        products = product_result.scalars().all()
        cart_items = [
            {"name": p.name, "price": p.price, "quantity": 1, "id": str(p.id)}
            for p in products[:5]
        ]

    alternatives = await get_budget_alternatives({"items": cart_items}, budget)

    return {"budget": budget, "alternatives": alternatives, "current_cart": cart_items}


@router.post("/recipe")
async def get_recipe_recommendations(
    req: RecipeRequest,
    user: Optional[User] = Depends(get_optional_user),
):
    recipe_data = await recommend_based_on_recipe(req.recipe_name)

    return {
        "recipe_name": req.recipe_name,
        "ingredients": recipe_data.get("ingredients", []),
        "estimated_cost": recipe_data.get("estimated_cost", 0),
    }


@router.post("/recipe/add-to-cart")
async def add_recipe_to_cart(
    req: RecipeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    recipe_data = await recommend_based_on_recipe(req.recipe_name)
    ingredients = recipe_data.get("ingredients", [])

    from app.models.cart import Cart, CartItem
    cart_result = await db.execute(select(Cart).where(Cart.user_id == user.id))
    cart = cart_result.scalar_one_or_none()
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        await db.flush()

    added = []
    for ing in ingredients:
        name = ing.get("name", "")
        quantity = ing.get("quantity", 1)
        unit = ing.get("unit", "piece")

        product_result = await db.execute(
            select(Product).where(Product.name.ilike(f"%{name}%"), Product.is_available == True).limit(1)
        )
        product = product_result.scalar_one_or_none()

        if product:
            price = product.discounted_price or product.price
            existing = await db.execute(
                select(CartItem).where(CartItem.cart_id == cart.id, CartItem.product_id == product.id)
            )
            existing_item = existing.scalar_one_or_none()

            if existing_item:
                existing_item.quantity += quantity
                existing_item.total_price = existing_item.quantity * price
            else:
                cart_item = CartItem(
                    cart_id=cart.id,
                    product_id=product.id,
                    quantity=quantity,
                    unit_price=price,
                    total_price=price * quantity,
                )
                db.add(cart_item)
            added.append({"name": product.name, "quantity": quantity})

    await db.commit()

    return {
        "recipe_name": req.recipe_name,
        "ingredients_from_recipe": ingredients,
        "added_to_cart": added,
        "total_ingredients": len(ingredients),
        "matched": len(added),
    }


@router.get("/monthly-prediction")
async def get_monthly_prediction(
    user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    user_history = []
    orders = []

    if user:
        order_results = await db.execute(
            select(Order).where(Order.user_id == user.id).order_by(desc(Order.created_at)).limit(20)
        )
        orders = order_results.scalars().all()
        for order in orders:
            for item in order.items:
                user_history.append({
                    "product_name": item.product.name if item.product else "Unknown",
                    "quantity": item.quantity,
                    "price": item.unit_price,
                    "date": order.created_at.isoformat() if order.created_at else None,
                })

    prediction = await predict_monthly_groceries(user_history)

    return {
        "prediction": prediction,
        "based_on_months": len(set(
            o.created_at.strftime("%Y-%m") for o in orders if o.created_at
        )) if orders else 0,
    }
