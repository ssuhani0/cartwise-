import asyncio
from app.core.database import async_session_factory
from app.services.maps import find_nearby_shops

async def test():
    async with async_session_factory() as db:
        try:
            print("Calling find_nearby_shops...")
            shops = await find_nearby_shops(db, lat=22.0, lng=80.0, category="kirana")
            print("Success!", shops)
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
