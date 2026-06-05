import asyncio
from sqlalchemy import select
from app.core.database import async_session_factory
from app.models.shop import Shop
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.cart import Cart, CartItem

async def test():
    async with async_session_factory() as db:
        # Check if a kirana shop exists
        query = select(Shop)
        result = await db.execute(query)
        shops = result.scalars().all()
        
        has_kirana = any("kirana" in (s.categories or []) for s in shops)
        if not has_kirana:
            print("No kirana shops found! Let's create a test one.")
            new_shop = Shop(
                name="Test Kirana Store",
                description="A test store added automatically.",
                area="Test Area",
                city="Test City",
                address="123 Test Street",
                pincode="123456",
                lat=22.3039,
                lng=70.8022,
                phone="1234567890",
                email="testkirana@example.com",
                categories=["kirana", "snacks"],
                rating=4.5,
                is_open=True
            )
            db.add(new_shop)
            await db.commit()
            print("Successfully added Test Kirana Store to the database!")
        else:
            print("A kirana shop already exists in the database!")

if __name__ == "__main__":
    asyncio.run(test())
