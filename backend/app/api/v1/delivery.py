from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.core.dependencies import get_current_user, role_required
from app.models.user import User, UserRole
from app.models.order import Order, OrderStatus
from app.models.delivery import DeliveryAgent

router = APIRouter(prefix="/api/v1/delivery", tags=["Delivery"])


@router.get("/assigned-orders")
async def get_assigned_orders(
    user: User = Depends(role_required(["delivery_agent", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    if user.role == UserRole.admin:
        result = await db.execute(
            select(Order).where(
                Order.status.in_([
                    OrderStatus.confirmed,
                    OrderStatus.preparing,
                    OrderStatus.out_for_delivery,
                ])
            ).order_by(Order.created_at.desc())
        )
    else:
        result = await db.execute(
            select(Order).where(
                Order.delivery_agent_id == user.id,
                Order.status.in_([
                    OrderStatus.confirmed,
                    OrderStatus.preparing,
                    OrderStatus.out_for_delivery,
                ]),
            ).order_by(Order.created_at.desc())
        )

    orders = result.scalars().all()

    return {
        "orders": [
            {
                "id": str(o.id),
                "status": o.status.value,
                "total_amount": o.total_amount,
                "delivery_fee": o.delivery_fee,
                "delivery_otp": o.delivery_otp,
                "notes": o.notes,
                "created_at": o.created_at.isoformat() if o.created_at else None,
                "shop_name": o.shop.name if o.shop else None,
                "shop_address": o.shop.address if o.shop else None,
                "delivery_address": o.delivery_address.full_address if o.delivery_address else None,
                "customer_name": o.user.full_name if o.user else None,
                "customer_phone": o.user.phone if o.user else None,
                "item_count": len(o.items),
            }
            for o in orders
        ],
        "total": len(orders),
    }


@router.put("/order/{order_id}/status")
async def update_delivery_status(
    order_id: str,
    status: str = Query(..., regex="^(confirmed|preparing|out_for_delivery|delivered)$"),
    user: User = Depends(role_required(["delivery_agent", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if user.role == UserRole.delivery_agent and order.delivery_agent_id and order.delivery_agent_id != user.id:
        raise HTTPException(status_code=403, detail="This order is not assigned to you")

    order.status = OrderStatus(status)
    await db.commit()

    return {"message": f"Order status updated to {status}"}


@router.post("/order/{order_id}/verify-otp")
async def verify_delivery_otp(
    order_id: str,
    otp: str = Query(...),
    user: User = Depends(role_required(["delivery_agent"])),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order).where(
            Order.id == order_id,
            Order.delivery_agent_id == user.id,
            Order.status == OrderStatus.out_for_delivery,
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found or not out for delivery")

    if order.delivery_otp != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    order.status = OrderStatus.delivered
    from app.models.order import PaymentStatus
    order.payment_status = PaymentStatus.paid
    await db.commit()

    agent_result = await db.execute(select(DeliveryAgent).where(DeliveryAgent.user_id == user.id))
    agent = agent_result.scalar_one_or_none()
    if agent:
        agent.total_deliveries += 1

    await db.commit()

    return {"message": "Delivery confirmed. Order completed."}


@router.put("/availability")
async def update_availability(
    is_available: bool = Query(...),
    user: User = Depends(role_required(["delivery_agent"])),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(DeliveryAgent).where(DeliveryAgent.user_id == user.id))
    agent = result.scalar_one_or_none()

    if not agent:
        agent = DeliveryAgent(
            user_id=user.id,
            is_available=is_available,
        )
        db.add(agent)
    else:
        agent.is_available = is_available

    await db.commit()
    return {"message": f"Availability set to {is_available}"}
