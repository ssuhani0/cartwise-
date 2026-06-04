import hashlib
import hmac
import json
from typing import Optional
import razorpay
from app.core.config import settings

client: Optional[razorpay.Client] = None


def get_razorpay_client() -> razorpay.Client:
    global client
    if client is None and settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
    return client


async def create_order(amount: float, currency: str = "INR", receipt: Optional[str] = None) -> Optional[dict]:
    rz_client = get_razorpay_client()
    if rz_client is None:
        return None
    data = {
        "amount": int(amount * 100),
        "currency": currency,
        "receipt": receipt or "",
        "payment_capture": 1,
    }
    return rz_client.order.create(data)


def verify_payment(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    if not settings.RAZORPAY_KEY_SECRET:
        return False
    msg = f"{razorpay_order_id}|{razorpay_payment_id}"
    expected_sig = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        msg.encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected_sig, razorpay_signature)


async def process_refund(payment_id: str, amount: Optional[float] = None) -> Optional[dict]:
    rz_client = get_razorpay_client()
    if rz_client is None:
        return None
    data = {"payment_id": payment_id}
    if amount:
        data["amount"] = int(amount * 100)
    return rz_client.payment.refund(payment_id, data)
