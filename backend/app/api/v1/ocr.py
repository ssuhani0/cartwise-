import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.ai.ocr import extract_text_from_image
from app.ai.llm import structure_grocery_items

router = APIRouter(prefix="/api/v1/ocr", tags=["OCR"])


class AddToCartRequest(BaseModel):
    items: list[dict]
    shop_id: str | None = None


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    text = await extract_text_from_image(contents)

    return {"text": text, "char_count": len(text)}


@router.post("/extract")
async def extract_items(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    text = await extract_text_from_image(contents)
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from the image")

    structured = await structure_grocery_items(text)

    return {"text": text, "items": structured, "item_count": len(structured)}


@router.post("/add-to-cart")
async def add_ocr_to_cart(
    req: AddToCartRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cart_result = await db.execute(select(Cart).where(Cart.user_id == user.id))
    cart = cart_result.scalar_one_or_none()
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        await db.flush()

    added = []
    not_found = []

    for item in req.items:
        name = item.get("name", "").strip().lower()
        quantity = item.get("quantity", 1)

        product_query = select(Product).where(Product.name.ilike(f"%{name}%"), Product.is_available == True)
        if req.shop_id:
            product_query = product_query.where(Product.shop_id == req.shop_id)

        product_result = await db.execute(product_query.limit(1))
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

            added.append({
                "name": product.name,
                "product_id": str(product.id),
                "quantity": quantity,
                "price": price,
            })
        else:
            not_found.append(name)

    await db.commit()

    return {
        "message": f"Added {len(added)} items to cart",
        "added": added,
        "not_found": not_found,
    }
