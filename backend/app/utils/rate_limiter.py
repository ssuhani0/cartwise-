from app.core.redis import check_rate_limit as redis_check_rate


async def check_rate_limit(key: str, max_requests: int = 10, window_seconds: int = 60) -> tuple[bool, int]:
    return await redis_check_rate(key, max_requests, window_seconds)
