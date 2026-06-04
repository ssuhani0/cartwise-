from math import ceil
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.core.database import get_db
from app.models.product import Product
from app.models.category import Category

router = APIRouter(prefix="/api/v1/products", tags=["Products"])


@router.get("")
async def list_products(
    category_id: str | None = None,
    category_slug: str | None = None,
    shop_id: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    sort: str | None = Query(None, regex="^(price_asc|price_desc|rating|name)$"),
    search: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Product).where(Product.is_available == True)

    if category_slug:
        cat_result = await db.execute(select(Category).where(Category.slug == category_slug))
        cat = cat_result.scalar_one_or_none()
        if cat:
            query = query.where(Product.category_id == cat.id)
    elif category_id:
        query = query.where(Product.category_id == category_id)

    if shop_id:
        query = query.where(Product.shop_id == shop_id)
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)
    if search:
        query = query.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%"),
            )
        )

    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort == "rating":
        query = query.order_by(Product.rating.desc())
    elif sort == "name":
        query = query.order_by(Product.name.asc())

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
                "shop_id": str(p.shop_id),
                "category_id": str(p.category_id) if p.category_id else None,
            }
            for p in products
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": ceil(total / page_size),
    }


@router.get("/{product_id}")
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return {
        "id": str(product.id),
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "discounted_price": product.discounted_price,
        "unit": product.unit,
        "image_url": product.image_url,
        "stock_quantity": product.stock_quantity,
        "rating": product.rating,
        "is_available": product.is_available,
        "shop_id": str(product.shop_id),
        "category_id": str(product.category_id) if product.category_id else None,
        "category_name": product.category.name if product.category else None,
        "shop_name": product.shop.name if product.shop else None,
    }


@router.get("/category/{category_slug}")
async def get_products_by_category(
    category_slug: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    cat_result = await db.execute(select(Category).where(Category.slug == category_slug))
    cat = cat_result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    query = select(Product).where(Product.category_id == cat.id, Product.is_available == True)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    products = result.scalars().all()

    return {
        "category": {"id": str(cat.id), "name": cat.name, "slug": cat.slug},
        "products": [
            {
                "id": str(p.id),
                "name": p.name,
                "price": p.price,
                "discounted_price": p.discounted_price,
                "unit": p.unit,
                "image_url": p.image_url,
                "rating": p.rating,
                "shop_id": str(p.shop_id),
            }
            for p in products
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }
