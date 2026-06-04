from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.cart import Cart, CartItem
from app.models.product import Product

router = APIRouter(prefix="/api/v1/cart", tags=["Cart"])


class AddItemRequest(BaseModel):
    product_id: str
    quantity: int = 1


class UpdateItemRequest(BaseModel):
    quantity: int


class ApplyCouponRequest(BaseModel):
    coupon_code: str


async def get_or_create_cart(user: User, db: AsyncSession) -> Cart:
    result = await db.execute(select(Cart).where(Cart.user_id == user.id))
    cart = result.scalar_one_or_none()
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        await db.commit()
        await db.refresh(cart)
    return cart


@router.get("")
async def get_cart(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    cart = await get_or_create_cart(user, db)
    items = []
    subtotal = 0.0
    for item in cart.items:
        product = item.product
        price = product.discounted_price or product.price
        item_total = price * item.quantity
        subtotal += item_total
        items.append({
            "id": str(item.id),
            "product_id": str(product.id),
            "name": product.name,
            "image_url": product.image_url,
            "unit": product.unit,
            "quantity": item.quantity,
            "unit_price": price,
            "total_price": item_total,
        })

    return {
        "cart_id": str(cart.id),
        "items": items,
        "subtotal": round(subtotal, 2),
        "item_count": len(items),
    }


@router.post("/add")
async def add_to_cart(req: AddItemRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    product_result = await db.execute(select(Product).where(Product.id == req.product_id))
    product = product_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if not product.is_available or product.stock_quantity < 1:
        raise HTTPException(status_code=400, detail="Product is out of stock")

    cart = await get_or_create_cart(user, db)
    price = product.discounted_price or product.price

    existing_result = await db.execute(
        select(CartItem).where(CartItem.cart_id == cart.id, CartItem.product_id == product.id)
    )
    existing = existing_result.scalar_one_or_none()

    if existing:
        existing.quantity += req.quantity
        existing.total_price = existing.quantity * price
    else:
        item = CartItem(
            cart_id=cart.id,
            product_id=product.id,
            quantity=req.quantity,
            unit_price=price,
            total_price=price * req.quantity,
        )
        db.add(item)

    await db.commit()
    return {"message": "Item added to cart"}


@router.put("/item/{item_id}")
async def update_cart_item(
    item_id: str,
    req: UpdateItemRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if req.quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    result = await db.execute(
        select(CartItem)
        .join(Cart)
        .where(CartItem.id == item_id, Cart.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    item.quantity = req.quantity
    item.total_price = item.unit_price * req.quantity
    await db.commit()

    return {"message": "Cart item updated"}


@router.delete("/item/{item_id}")
async def remove_cart_item(
    item_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CartItem)
        .join(Cart)
        .where(CartItem.id == item_id, Cart.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    await db.delete(item)
    await db.commit()

    return {"message": "Item removed from cart"}


@router.delete("/clear")
async def clear_cart(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cart).where(Cart.user_id == user.id))
    cart = result.scalar_one_or_none()
    if cart:
        for item in cart.items:
            await db.delete(item)
        await db.commit()

    return {"message": "Cart cleared"}


@router.post("/apply-coupon")
async def apply_coupon(req: ApplyCouponRequest, user: User = Depends(get_current_user)):
    return {"message": "Coupon applied", "discount": 0, "coupon_code": req.coupon_code}
