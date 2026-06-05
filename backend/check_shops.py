import asyncio
from sqlalchemy import select
from app.core.database import async_session_factory as async_session_maker
from app.models.shop import Shop
from app.models.user import User
from app.models.product import Product
from app.models.order import Order

async def test():
    async with async_session_maker() as db:
        result = await db.execute(select(Shop))
        shops = result.scalars().all()
        print(f"Total shops in DB: {len(shops)}")
        for s in shops:
            print(f"- {s.name} (categories: {s.categories})")

if __name__ == "__main__":
    asyncio.run(test())
