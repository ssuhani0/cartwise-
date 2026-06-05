import httpx
from app.core.config import settings


async def send_brevo_email(to_email: str, subject: str, html_content: str) -> bool:
    if not settings.BREVO_API_KEY:
        print("\n[DEBUG] BREVO_API_KEY is MISSING! Skipping Brevo API call.\n", flush=True)
        return False
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": settings.BREVO_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "sender": {"email": settings.BREVO_SENDER_EMAIL or "noreply@cartwise.app"},
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html_content,
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload, headers=headers)
        if not resp.is_success:
            print(f"\n[Brevo Error] Failed to send email to {to_email}. Status: {resp.status_code}, Body: {resp.text}\n", flush=True)
        else:
            print(f"\n[Brevo Success] Email accepted by Brevo! Status: {resp.status_code}, Body: {resp.text}\n", flush=True)
        return resp.is_success


async def send_otp_email(recipient: str, otp_code: str) -> bool:
    subject = "Your CartWise OTP Code"
    print(f"\n--- MOCK EMAIL: OTP for {recipient} is {otp_code} ---\n", flush=True)
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>CartWise OTP Verification</h2>
        <p>Your OTP code is: <strong style="font-size: 24px; color: #4CAF50;">{otp_code}</strong></p>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
    </body>
    </html>
    """
    return await send_brevo_email(recipient, subject, html)


async def send_order_confirmation(recipient: str, order_id: str, total_amount: float) -> bool:
    subject = f"Order Confirmed - #{order_id[:8].upper()}"
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Order Confirmed!</h2>
        <p>Your order <strong>#{order_id[:8].upper()}</strong> has been confirmed.</p>
        <p>Total Amount: <strong>₹{total_amount:.2f}</strong></p>
        <p>Thank you for shopping with CartWise!</p>
    </body>
    </html>
    """
    return await send_brevo_email(recipient, subject, html)


async def send_delivery_update(recipient: str, order_id: str, status: str) -> bool:
    subject = f"Delivery Update - #{order_id[:8].upper()}"
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Delivery Update</h2>
        <p>Your order <strong>#{order_id[:8].upper()}</strong> is now: <strong>{status.replace('_', ' ').title()}</strong></p>
        <p>Track your order in the CartWise app.</p>
    </body>
    </html>
    """
    return await send_brevo_email(recipient, subject, html)
