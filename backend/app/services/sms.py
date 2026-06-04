from app.core.config import settings


async def send_sms(phone: str, message: str) -> bool:
    if settings.ENVIRONMENT == "dev":
        return True
    return False


async def send_otp_sms(phone: str, otp_code: str) -> bool:
    message = f"Your CartWise OTP is: {otp_code}. It expires in 10 minutes."
    return await send_sms(phone, message)
