import json
from typing import Any, Optional
import redis.asyncio as aioredis
from app.core.config import settings

redis_client: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    global redis_client
    if redis_client is None:
        redis_url = settings.UPSTASH_REDIS_URL
        if not redis_url:
            print("WARNING: UPSTASH_REDIS_URL is empty, falling back to localhost")
            redis_url = settings.REDIS_URL
        else:
            print(f"Connecting to Redis at: {redis_url.split('@')[-1]}")
            
        redis_client = aioredis.from_url(
            redis_url,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5
        )
    return redis_client


async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None


async def cache_get(key: str) -> Optional[str]:
    r = await get_redis()
    return await r.get(key)


async def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    r = await get_redis()
    if isinstance(value, (dict, list)):
        value = json.dumps(value)
    await r.setex(key, ttl, value)


async def cache_delete(key: str) -> None:
    r = await get_redis()
    await r.delete(key)


async def check_rate_limit(key: str, max_requests: int = 10, window: int = 60) -> tuple[bool, int]:
    r = await get_redis()
    current = await r.get(key)
    if current is None:
        await r.setex(key, window, 1)
        return True, 1
    count = int(current)
    if count >= max_requests:
        return False, count
    await r.incr(key)
    return True, count + 1
