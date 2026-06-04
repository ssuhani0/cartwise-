import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.redis import cache_get, cache_set
from app.models.user import User
from app.models.order import Order
from app.models.payment import Payment
from app.core.config import settings
from app.services.razorpay import create_order as rz_create_order, verify_payment as rz_verify

router = APIRouter(prefix="/api/v1/payments", tags=["Payments"])


class CreateOrderRequest(BaseModel):
    order_id: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/create-order")
async def create_payment_order(
    req: CreateOrderRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order).where(Order.id == req.order_id, Order.user_id == user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    rz_order = await rz_create_order(order.total_amount, receipt=str(order.id))
    if not rz_order:
        raise HTTPException(status_code=500, detail="Payment provider unavailable")

    payment = Payment(
        order_id=order.id,
        razorpay_order_id=rz_order["id"],
        amount=order.total_amount,
        currency="INR",
        status="created",
    )
    db.add(payment)
    await db.commit()

    return {
        "razorpay_order_id": rz_order["id"],
        "amount": rz_order["amount"],
        "currency": rz_order["currency"],
        "key_id": settings.RAZORPAY_KEY_ID,
    }


@router.post("/verify")
async def verify_payment_endpoint(
    req: VerifyPaymentRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_valid = rz_verify(req.razorpay_order_id, req.razorpay_payment_id, req.razorpay_signature)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Payment verification failed")

    result = await db.execute(
        select(Payment).where(Payment.razorpay_order_id == req.razorpay_order_id)
    )
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    payment.razorpay_payment_id = req.razorpay_payment_id
    payment.razorpay_signature = req.razorpay_signature
    payment.status = "paid"

    order_result = await db.execute(select(Order).where(Order.id == payment.order_id))
    order = order_result.scalar_one_or_none()
    if order:
        from app.models.order import PaymentStatus, OrderStatus
        order.payment_status = PaymentStatus.paid
        order.status = OrderStatus.confirmed

    await db.commit()

    return {"message": "Payment verified successfully", "status": "paid"}


@router.get("/status/{order_id}")
async def get_payment_status(
    order_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Payment).join(Order).where(
            Payment.order_id == order_id,
            Order.user_id == user.id,
        )
    )
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    return {
        "order_id": order_id,
        "razorpay_order_id": payment.razorpay_order_id,
        "razorpay_payment_id": payment.razorpay_payment_id,
        "amount": payment.amount,
        "currency": payment.currency,
        "status": payment.status,
        "method": payment.method,
    }
