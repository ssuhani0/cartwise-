from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr, field_validator
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, verify_token
from app.core.redis import cache_get, cache_set, cache_delete, check_rate_limit
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.otp import OTPVerification, OTPType
from app.services.email import send_otp_email
from app.services.sms import send_otp_sms
from app.utils.helpers import generate_otp, format_phone, validate_indian_phone

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


class SignupRequest(BaseModel):
    email: str | None = None
    phone: str | None = None
    full_name: str
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str | None) -> str | None:
        if v is not None and v.strip() == "":
            return None
        return v


class VerifyOTPRequest(BaseModel):
    email: str | None = None
    phone: str | None = None
    otp_code: str


class LoginRequest(BaseModel):
    email: str | None = None
    phone: str | None = None
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: str | None = None
    phone: str | None = None


class ResetPasswordRequest(BaseModel):
    email: str | None = None
    phone: str | None = None
    otp_code: str
    new_password: str


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    avatar_url: str | None = None
    location_area: str | None = None


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: dict


class ResendOTPRequest(BaseModel):
    email: str | None = None
    phone: str | None = None


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(req: SignupRequest, request: Request, db: AsyncSession = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    allowed, _ = await check_rate_limit(f"signup:{client_ip}", 5, 300)
    if not allowed:
        raise HTTPException(status_code=429, detail="Too many signup attempts. Try later.")

    if not req.email and not req.phone:
        raise HTTPException(status_code=400, detail="Email or phone required")

    identifier = req.email or req.phone

    if req.email:
        result = await db.execute(select(User).where(User.email == req.email))
    else:
        phone = format_phone(req.phone)
        result = await db.execute(select(User).where(User.phone == phone))

    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Account already exists")

    otp_code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    otp_type = OTPType.email if req.email else OTPType.phone
    otp = OTPVerification(
        otp_code=otp_code,
        type=otp_type,
        expires_at=expires_at,
    )
    db.add(otp)
    await db.commit()

    await cache_set(f"signup_data:{identifier}", {
        "email": req.email,
        "phone": req.phone,
        "full_name": req.full_name,
        "password_hash": hash_password(req.password),
    }, ttl=600)

    if req.email:
        await send_otp_email(req.email, otp_code)
    else:
        await send_otp_sms(format_phone(req.phone), otp_code)

    return {"message": "OTP sent", "otp_id": str(otp.id)}


@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    identifier = req.email or req.phone
    if not identifier:
        raise HTTPException(status_code=400, detail="Email or phone required")

    otp_type = OTPType.email if req.email else OTPType.phone
    result = await db.execute(
        select(OTPVerification)
        .where(OTPVerification.otp_code == req.otp_code)
        .where(OTPVerification.type == otp_type)
        .where(OTPVerification.is_used == False)
        .order_by(OTPVerification.created_at.desc())
    )
    otp_record = result.scalar_one_or_none()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if otp_record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired")

    signup_data = await cache_get(f"signup_data:{identifier}")
    if not signup_data:
        raise HTTPException(status_code=400, detail="Signup data expired. Please signup again.")

    import json
    data = json.loads(signup_data)

    user = User(
        email=data.get("email"),
        phone=data.get("phone"),
        full_name=data["full_name"],
        password_hash=data["password_hash"],
        is_verified=True,
    )
    db.add(user)
    await db.flush()

    otp_record.is_used = True
    await db.commit()
    await cache_delete(f"signup_data:{identifier}")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "role": user.role.value,
        },
    )


@router.post("/resend-otp")
async def resend_otp(req: ResendOTPRequest, request: Request, db: AsyncSession = Depends(get_db)):
    identifier = req.email or req.phone
    if not identifier:
        raise HTTPException(status_code=400, detail="Email or phone required")

    client_ip = request.client.host if request.client else "unknown"
    allowed, _ = await check_rate_limit(f"resend_otp:{identifier}", 3, 300)
    if not allowed:
        raise HTTPException(status_code=429, detail="Too many resend attempts. Try later.")

    otp_code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    otp_type = OTPType.email if req.email else OTPType.phone

    otp = OTPVerification(otp_code=otp_code, type=otp_type, expires_at=expires_at)
    db.add(otp)
    await db.commit()

    if req.email:
        await send_otp_email(req.email, otp_code)
    else:
        await send_otp_sms(format_phone(req.phone), otp_code)

    return {"message": "OTP resent"}


@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    if not req.email and not req.phone:
        raise HTTPException(status_code=400, detail="Email or phone required")

    if req.email:
        result = await db.execute(select(User).where(User.email == req.email))
    else:
        result = await db.execute(select(User).where(User.phone == format_phone(req.phone)))

    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "role": user.role.value,
            "avatar_url": user.avatar_url,
        },
    )


@router.post("/refresh")
async def refresh(req: RefreshRequest):
    payload = verify_token(req.refresh_token, expected_type="refresh")
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user_id = payload.get("sub")
    access_token = create_access_token({"sub": user_id})
    refresh_token = create_refresh_token({"sub": user_id})

    return {"access_token": access_token, "refresh_token": refresh_token}


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, request: Request, db: AsyncSession = Depends(get_db)):
    identifier = req.email or req.phone
    if not identifier:
        raise HTTPException(status_code=400, detail="Email or phone required")

    client_ip = request.client.host if request.client else "unknown"
    allowed, _ = await check_rate_limit(f"forgot_pwd:{identifier}", 3, 600)
    if not allowed:
        raise HTTPException(status_code=429, detail="Too many attempts")

    if req.email:
        result = await db.execute(select(User).where(User.email == req.email))
    else:
        result = await db.execute(select(User).where(User.phone == format_phone(req.phone)))

    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")

    otp_code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    otp_type = OTPType.email if req.email else OTPType.phone

    otp = OTPVerification(user_id=user.id, otp_code=otp_code, type=otp_type, expires_at=expires_at)
    db.add(otp)
    await db.commit()

    if req.email:
        await send_otp_email(req.email, otp_code)
    else:
        await send_otp_sms(format_phone(req.phone), otp_code)

    return {"message": "OTP sent for password reset"}


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    identifier = req.email or req.phone
    if not identifier:
        raise HTTPException(status_code=400, detail="Email or phone required")

    if req.email:
        result = await db.execute(select(User).where(User.email == req.email))
    else:
        result = await db.execute(select(User).where(User.phone == format_phone(req.phone)))

    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")

    otp_type = OTPType.email if req.email else OTPType.phone
    otp_result = await db.execute(
        select(OTPVerification)
        .where(OTPVerification.user_id == user.id)
        .where(OTPVerification.otp_code == req.otp_code)
        .where(OTPVerification.type == otp_type)
        .where(OTPVerification.is_used == False)
        .order_by(OTPVerification.created_at.desc())
    )
    otp_record = otp_result.scalar_one_or_none()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if otp_record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired")

    user.password_hash = hash_password(req.new_password)
    otp_record.is_used = True
    await db.commit()

    return {"message": "Password reset successful"}


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "id": str(user.id),
        "email": user.email,
        "phone": user.phone,
        "full_name": user.full_name,
        "role": user.role.value,
        "is_verified": user.is_verified,
        "avatar_url": user.avatar_url,
        "location_area": user.location_area,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@router.put("/me")
async def update_me(req: UpdateProfileRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if req.full_name is not None:
        user.full_name = req.full_name
    if req.avatar_url is not None:
        user.avatar_url = req.avatar_url
    if req.location_area is not None:
        user.location_area = req.location_area
    await db.commit()
    return {"message": "Profile updated"}
