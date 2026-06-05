import math
from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.models.shop import Shop


def calculate_distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


async def find_nearby_shops(
    db: AsyncSession,
    lat: float,
    lng: float,
    radius_km: float = 5.0,
    area: Optional[str] = None,
    category: Optional[str] = None,
    open_only: bool = False,
) -> List[Shop]:
    query = select(Shop)

    if open_only:
        query = query.where(Shop.is_open == True)

    if area:
        query = query.where(Shop.area.ilike(f"%{area}%"))

    if category:
        from sqlalchemy import String
        query = query.where(func.cast(Shop.categories, String).ilike(f'%"{category}"%'))

    result = await db.execute(query)
    shops = result.scalars().all()

    filtered = []
    for shop in shops:
        if shop.lat is not None and shop.lng is not None:
            dist = calculate_distance_km(lat, lng, shop.lat, shop.lng)
            if dist <= radius_km:
                filtered.append((shop, dist))

    filtered.sort(key=lambda x: x[1])
    return [s[0] for s in filtered]


async def geocode_address(address: str) -> Optional[tuple[float, float]]:
    return None


async def get_address_coords(address_id: str) -> Optional[tuple[float, float]]:
    return None
