from math import ceil
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.shop import Shop
from app.models.product import Product
from app.services.maps import find_nearby_shops

router = APIRouter(prefix="/api/v1/shops", tags=["Shops"])


@router.get("/nearby")
async def get_nearby_shops(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius: float = Query(5.0, ge=0.5, le=50),
    area: str | None = None,
    category: str | None = None,
    open_only: bool = False,
    db: AsyncSession = Depends(get_db),
):
    shops = await find_nearby_shops(db, lat, lng, radius, area, category, open_only)
    result = []
    for shop in shops:
        result.append({
            "id": str(shop.id),
            "name": shop.name,
            "area": shop.area,
            "city": shop.city,
            "rating": shop.rating,
            "total_ratings": shop.total_ratings,
            "is_open": shop.is_open,
            "image_url": shop.image_url,
            "delivery_fee": shop.delivery_fee,
            "min_order_amount": shop.min_order_amount,
            "estimated_delivery_time": shop.estimated_delivery_time,
            "categories": shop.categories,
        })
    return {"shops": result, "total": len(result)}


@router.get("")
async def list_shops(
    area: str | None = None,
    category: str | None = None,
    min_rating: float | None = None,
    open_only: bool = False,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Shop)

    if area:
        query = query.where(Shop.area.ilike(f"%{area}%"))
    if category:
        query = query.where(Shop.categories.contains([category]))
    if min_rating:
        query = query.where(Shop.rating >= min_rating)
    if open_only:
        query = query.where(Shop.is_open == True)

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
                "area": s.area,
                "city": s.city,
                "rating": s.rating,
                "total_ratings": s.total_ratings,
                "is_open": s.is_open,
                "image_url": s.image_url,
                "delivery_fee": s.delivery_fee,
                "min_order_amount": s.min_order_amount,
                "estimated_delivery_time": s.estimated_delivery_time,
                "categories": s.categories,
            }
            for s in shops
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": ceil(total / page_size),
    }


@router.get("/{shop_id}")
async def get_shop(shop_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Shop).where(Shop.id == shop_id))
    shop = result.scalar_one_or_none()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    return {
        "id": str(shop.id),
        "name": shop.name,
        "address": shop.address,
        "area": shop.area,
        "city": shop.city,
        "pincode": shop.pincode,
        "rating": shop.rating,
        "total_ratings": shop.total_ratings,
        "is_open": shop.is_open,
        "image_url": shop.image_url,
        "delivery_fee": shop.delivery_fee,
        "min_order_amount": shop.min_order_amount,
        "estimated_delivery_time": shop.estimated_delivery_time,
        "categories": shop.categories,
    }


@router.get("/{shop_id}/products")
async def get_shop_products(
    shop_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: str | None = None,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    shop_result = await db.execute(select(Shop).where(Shop.id == shop_id))
    shop = shop_result.scalar_one_or_none()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    query = select(Product).where(Product.shop_id == shop_id, Product.is_available == True)

    if category_id:
        query = query.where(Product.category_id == category_id)
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))

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
                "description": p.description,
                "price": p.price,
                "discounted_price": p.discounted_price,
                "unit": p.unit,
                "image_url": p.image_url,
                "stock_quantity": p.stock_quantity,
                "rating": p.rating,
                "category_id": str(p.category_id) if p.category_id else None,
            }
            for p in products
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }
