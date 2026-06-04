from datetime import datetime, timedelta, timezone
from math import ceil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, cast, Date
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_user, role_required
from app.models.user import User, UserRole
from app.models.shop import Shop
from app.models.product import Product
from app.models.category import Category
from app.models.order import Order, OrderItem, OrderStatus
from app.models.delivery import DeliveryAgent
from app.utils.helpers import generate_otp

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])

admin_dep = Depends(role_required(["admin"]))


# --- Users ---

@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: str | None = None,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
    _=admin_dep,
):
    query = select(User)
    if role:
        query = query.where(User.role == role)
    if search:
        query = query.where(User.full_name.ilike(f"%{search}%"))

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size).order_by(User.created_at.desc())
    result = await db.execute(query)
    users = result.scalars().all()

    return {
        "users": [
            {
                "id": str(u.id),
                "email": u.email,
                "phone": u.phone,
                "full_name": u.full_name,
                "role": u.role.value,
                "is_verified": u.is_verified,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


# --- Shops ---

@router.get("/shops")
async def list_shops(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _=admin_dep,
):
    query = select(Shop).order_by(Shop.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    shops = result.scalars().all()

    return {
        "shops": [
            {
                "id": str(s.id),
                "name": s.name,
                "owner_id": str(s.owner_id),
                "area": s.area,
                "city": s.city,
                "rating": s.rating,
                "is_open": s.is_open,
            }
            for s in shops
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


# --- Products ---

@router.get("/products")
async def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _=admin_dep,
):
    query = select(Product).order_by(Product.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    products = result.scalars().all()

    return {
        "products": [
            {
                "id": str(p.id),
                "name": p.name,
                "price": p.price,
                "shop_id": str(p.shop_id),
                "stock_quantity": p.stock_quantity,
                "is_available": p.is_available,
            }
            for p in products
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


# --- Analytics ---

@router.get("/analytics/daily-orders")
async def daily_orders(
    days: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
    _=admin_dep,
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    query = select(
        cast(Order.created_at, Date).label("date"),
        func.count(Order.id).label("count"),
        func.sum(Order.total_amount).label("revenue"),
    ).where(Order.created_at >= since).group_by(cast(Order.created_at, Date)).order_by(cast(Order.created_at, Date))

    result = await db.execute(query)
    rows = result.all()

    return {
        "daily_orders": [
            {"date": str(row.date), "count": row.count, "revenue": float(row.revenue or 0)}
            for row in rows
        ],
        "total_days": days,
    }


@router.get("/analytics/revenue")
async def total_revenue(
    period: str = Query("month", regex="^(week|month|year)$"),
    db: AsyncSession = Depends(get_db),
    _=admin_dep,
):
    if period == "week":
        since = datetime.now(timezone.utc) - timedelta(days=7)
    elif period == "month":
        since = datetime.now(timezone.utc) - timedelta(days=30)
    else:
        since = datetime.now(timezone.utc) - timedelta(days=365)

    result = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0))
        .where(Order.created_at >= since, Order.payment_status == "paid")
    )
    revenue = result.scalar() or 0

    count_result = await db.execute(
        select(func.count(Order.id))
        .where(Order.created_at >= since)
    )
    order_count = count_result.scalar() or 0

    return {
        "period": period,
        "revenue": round(float(revenue), 2),
        "order_count": order_count,
        "average_order_value": round(float(revenue) / order_count, 2) if order_count > 0 else 0,
    }


@router.get("/analytics/popular-items")
async def popular_items(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _=admin_dep,
):
    result = await db.execute(
        select(
            Product.id,
            Product.name,
            Product.image_url,
            func.count(OrderItem.id).label("order_count"),
            func.sum(OrderItem.quantity).label("total_sold"),
        )
        .join(OrderItem, Product.id == OrderItem.product_id)
        .group_by(Product.id)
        .order_by(desc("total_sold"))
        .limit(limit)
    )
    rows = result.all()

    return {
        "popular_items": [
            {
                "id": str(row.id),
                "name": row.name,
                "image_url": row.image_url,
                "order_count": row.order_count,
                "total_sold": row.total_sold,
            }
            for row in rows
        ],
    }


# --- Delivery Agent Assignment ---

class AssignAgentRequest(BaseModel):
    agent_user_id: str


@router.put("/delivery-agents/{agent_id}/assign")
async def assign_agent_to_shop(
    agent_id: str,
    req: AssignAgentRequest,
    db: AsyncSession = Depends(get_db),
    _=admin_dep,
):
    agent_result = await db.execute(select(DeliveryAgent).where(DeliveryAgent.user_id == agent_id))
    agent = agent_result.scalar_one_or_none()

    if not agent:
        raise HTTPException(status_code=404, detail="Delivery agent not found")

    user_result = await db.execute(select(User).where(User.id == req.agent_user_id))
    agent_user = user_result.scalar_one_or_none()
    if not agent_user or agent_user.role != UserRole.delivery_agent:
        raise HTTPException(status_code=400, detail="Invalid delivery agent user")

    return {"message": f"Agent {agent_user.full_name} assigned successfully"}
