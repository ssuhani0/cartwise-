import math
import random
import re


def generate_otp(length: int = 6) -> str:
    return "".join(str(random.randint(0, 9)) for _ in range(length))


def format_phone(phone: str) -> str:
    cleaned = re.sub(r"\D", "", phone)
    if cleaned.startswith("91") and len(cleaned) == 12:
        return f"+{cleaned}"
    if cleaned.startswith("0") and len(cleaned) == 11:
        return f"+91{cleaned[1:]}"
    if len(cleaned) == 10:
        return f"+91{cleaned}"
    return f"+{cleaned}"


def validate_indian_phone(phone: str) -> bool:
    cleaned = re.sub(r"\D", "", phone)
    if cleaned.startswith("91"):
        cleaned = cleaned[2:]
    if cleaned.startswith("0"):
        cleaned = cleaned[1:]
    return bool(re.match(r"^[6-9]\d{9}$", cleaned))


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


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text


def truncate_uuid(u: str) -> str:
    return u[:8].upper()
