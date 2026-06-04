from math import ceil
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.cart import Cart
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus
from app.models.payment import Payment
from app.models.shop import Shop
from app.models.cart import CartItem
from app.models.address import Address
from app.utils.helpers import generate_otp

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_order(
    delivery_address_id: str,
    payment_method: str = "razorpay",
    notes: str | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cart_result = await db.execute(select(Cart).where(Cart.user_id == user.id))
    cart = cart_result.scalar_one_or_none()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    address_result = await db.execute(select(Address).where(Address.id == delivery_address_id, Address.user_id == user.id))
    address = address_result.scalar_one_or_none()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    first_item = cart.items[0]
    shop = first_item.product.shop

    total_amount = sum(item.total_price for item in cart.items)
    delivery_fee = shop.delivery_fee if shop else 0.0

    delivery_otp = generate_otp()

    order = Order(
        user_id=user.id,
        shop_id=shop.id if shop else None,
        status=OrderStatus.pending,
        total_amount=round(total_amount + delivery_fee, 2),
        delivery_fee=delivery_fee,
        delivery_address_id=address.id,
        delivery_otp=delivery_otp,
        notes=notes,
        payment_method=payment_method,
        payment_status=PaymentStatus.pending,
    )
    db.add(order)
    await db.flush()

    for cart_item in cart.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            unit_price=cart_item.unit_price,
            total_price=cart_item.total_price,
        )
        db.add(order_item)

    for item in cart.items:
        await db.delete(item)

    await db.commit()
    await db.refresh(order)

    return {
        "order_id": str(order.id),
        "total_amount": order.total_amount,
        "delivery_fee": order.delivery_fee,
        "status": order.status.value,
    }


@router.get("")
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    orders = result.scalars().all()

    return {
        "orders": [
            {
                "id": str(o.id),
                "status": o.status.value,
                "total_amount": o.total_amount,
                "delivery_fee": o.delivery_fee,
                "payment_status": o.payment_status.value if o.payment_status else None,
                "item_count": len(o.items),
                "created_at": o.created_at.isoformat() if o.created_at else None,
                "shop_name": o.shop.name if o.shop else None,
            }
            for o in orders
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": ceil(total / page_size),
    }


@router.get("/{order_id}")
async def get_order(order_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.user_id == user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "id": str(order.id),
        "status": order.status.value,
        "total_amount": order.total_amount,
        "delivery_fee": order.delivery_fee,
        "discount_amount": order.discount_amount,
        "coupon_code": order.coupon_code,
        "payment_status": order.payment_status.value if order.payment_status else None,
        "payment_method": order.payment_method,
        "delivery_otp": order.delivery_otp,
        "notes": order.notes,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None,
        "shop": {
            "id": str(order.shop.id) if order.shop else None,
            "name": order.shop.name if order.shop else None,
        } if order.shop else None,
        "items": [
            {
                "id": str(i.id),
                "product_id": str(i.product_id),
                "product_name": i.product.name if i.product else None,
                "quantity": i.quantity,
                "unit_price": i.unit_price,
                "total_price": i.total_price,
                "image_url": i.product.image_url if i.product else None,
            }
            for i in order.items
        ],
        "delivery_address": {
            "full_address": order.delivery_address.full_address if order.delivery_address else None,
            "area": order.delivery_address.area if order.delivery_address else None,
            "city": order.delivery_address.city if order.delivery_address else None,
            "pincode": order.delivery_address.pincode if order.delivery_address else None,
        } if order.delivery_address else None,
    }


@router.put("/{order_id}/cancel")
async def cancel_order(order_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.user_id == user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status in (OrderStatus.delivered, OrderStatus.cancelled):
        raise HTTPException(status_code=400, detail="Order cannot be cancelled")

    order.status = OrderStatus.cancelled
    await db.commit()

    return {"message": "Order cancelled successfully"}


@router.post("/repeat")
async def repeat_order(order_id: str = Query(...), user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.user_id == user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    cart_result = await db.execute(select(Cart).where(Cart.user_id == user.id))
    cart = cart_result.scalar_one_or_none()
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        await db.flush()

    for item in order.items:
        price = item.unit_price
        existing_item = await db.execute(
            select(CartItem).where(CartItem.cart_id == cart.id, CartItem.product_id == item.product_id)
        )
        ci = existing_item.scalar_one_or_none()
        if ci:
            ci.quantity += item.quantity
            ci.total_price = ci.quantity * price
        else:
            new_item = CartItem(
                cart_id=cart.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=price,
                total_price=price * item.quantity,
            )
            db.add(new_item)

    await db.commit()
    return {"message": "Items added to cart"}
