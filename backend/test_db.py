import asyncio
from sqlalchemy import select, func
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import async_session_factory as async_session_maker
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.models.shop import Shop

async def test():
    async with async_session_maker() as db:
        try:
            query = select(Shop).where(func.cast(Shop.categories, String).ilike('%"kirana"%'))
            result = await db.execute(query)
            print("Successfully executed String ilike query!")
            print("Results:", result.scalars().all())
        except Exception as e:
            print("Error:", str(e))

        try:
            query = select(Shop).where(Shop.categories.cast(JSONB).contains(["kirana"]))
            result = await db.execute(query)
            print("Successfully executed .cast JSONB query!")
        except Exception as e:
            print("Error executing .cast query:", str(e))

if __name__ == "__main__":
    asyncio.run(test())
