import json
from typing import Any, Optional
from app.core.config import settings

_llm_client = None


def _get_client():
    global _llm_client
    if _llm_client is not None:
        return _llm_client

    if settings.OLLAMA_URL:
        from openai import AsyncOpenAI
        _llm_client = ("ollama", AsyncOpenAI(api_key="ollama", base_url=f"{settings.OLLAMA_URL}/v1"))
        return _llm_client

    if settings.GROQ_API_KEY:
        from openai import AsyncOpenAI
        _llm_client = ("groq", AsyncOpenAI(api_key=settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1"))
        return _llm_client

    if settings.GROK_API_KEY:
        from openai import AsyncOpenAI
        _llm_client = ("grok", AsyncOpenAI(api_key=settings.GROK_API_KEY, base_url="https://api.x.ai/v1"))
        return _llm_client

    return None


def _build_prompt(system: str, user: str) -> list[dict]:
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


async def _call_llm(prompt: list[dict], response_format: Optional[dict] = None) -> str:
    client_info = _get_client()
    if client_info is None:
        return json.dumps({"error": "No LLM configured"})

    client_type, client = client_info

    try:
        if client_type == "grok":
            kwargs = {
                "model": "grok-3",
                "messages": prompt,
                "temperature": 0.3,
            }
        elif client_type == "groq":
            kwargs = {
                "model": "llama-3.3-70b-versatile",
                "messages": prompt,
                "temperature": 0.3,
            }
        elif client_type == "ollama":
            kwargs = {
                "model": settings.OLLAMA_MODEL or "llama3",
                "messages": prompt,
                "temperature": 0.3,
            }
            
        if response_format:
            kwargs["response_format"] = response_format
        response = await client.chat.completions.create(**kwargs)
        return response.choices[0].message.content or ""
    except Exception as e:
        return json.dumps({"error": str(e)})

    return json.dumps({"error": "No LLM configured"})


async def structure_grocery_items(ocr_text: str) -> list[dict[str, Any]]:
    system = """You are a grocery item structuring assistant. Given OCR text from a handwritten grocery list,
    extract items and return a JSON array of objects with 'name', 'quantity' (number), and 'unit' (kg/g/pieces/pack).
    Only return valid JSON, no explanations."""

    prompt = _build_prompt(system, f"Extract grocery items from this text:\n{ocr_text}")
    result = await _call_llm(prompt, {"type": "json_object"})

    try:
        return json.loads(result)
    except (json.JSONDecodeError, TypeError):
        return []


async def get_recommendations(user_history: list[dict], available_products: list[dict]) -> list[dict]:
    system = """You are a grocery recommendation assistant. Based on user purchase history and available products,
    recommend items the user might need. Return a JSON object with a 'recommendations' key containing an array 
    of product recommendations, each with 'product_name', 'reason' (why recommended), and 'confidence' (high/medium/low)."""

    prompt = _build_prompt(
        system,
        f"User history: {json.dumps(user_history)}\nAvailable products: {json.dumps(available_products[:20])}",
    )
    result = await _call_llm(prompt, {"type": "json_object"})

    try:
        data = json.loads(result)
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            for v in data.values():
                if isinstance(v, list):
                    return v
        return []
    except (json.JSONDecodeError, TypeError):
        return []


async def get_budget_alternatives(product: dict, budget: float) -> list[dict]:
    system = """You are a budget optimization assistant. Given a product and budget, suggest cheaper alternatives.
    Return a JSON array of alternative products with 'name', 'price', 'savings', and 'reason'. No location data."""

    prompt = _build_prompt(
        system,
        f"Product: {json.dumps(product)}\nBudget: ₹{budget}",
    )
    result = await _call_llm(prompt, {"type": "json_object"})

    try:
        return json.loads(result)
    except (json.JSONDecodeError, TypeError):
        return []


async def suggest_combos(cart_items: list[dict]) -> list[dict]:
    system = """You are a combo suggestion assistant. Given items in a cart, suggest complementary products
    that go well together. Return a JSON array of combo suggestions with 'items' (list of product names),
    'reason', and 'estimated_savings'. No coordinate data."""

    prompt = _build_prompt(
        system,
        f"Cart items: {json.dumps(cart_items)}",
    )
    result = await _call_llm(prompt, {"type": "json_object"})

    try:
        return json.loads(result)
    except (json.JSONDecodeError, TypeError):
        return []


async def recommend_based_on_recipe(recipe_name: str) -> dict[str, Any]:
    system = """You are a recipe ingredient assistant. Given a recipe name, return a JSON object with 
    'recipe_name', 'ingredients' (array of {name, quantity, unit}), and 'estimated_cost'. 
    No location data, no coordinates."""

    prompt = _build_prompt(
        system,
        f"List ingredients needed for: {recipe_name}",
    )
    result = await _call_llm(prompt, {"type": "json_object"})

    try:
        return json.loads(result)
    except (json.JSONDecodeError, TypeError):
        return {"ingredients": []}


async def predict_monthly_groceries(user_history: list[dict]) -> dict[str, Any]:
    system = """You are a monthly grocery prediction assistant. Given user purchase history, predict what 
    groceries they will need this month. Return a JSON object with 'predicted_items' (array of {name, 
    estimated_quantity, unit, category}) and 'estimated_budget'. No location data."""

    prompt = _build_prompt(
        system,
        f"User purchase history: {json.dumps(user_history)}",
    )
    result = await _call_llm(prompt, {"type": "json_object"})

    try:
        return json.loads(result)
    except (json.JSONDecodeError, TypeError):
        return {"predicted_items": [], "estimated_budget": 0}


async def extract_grocery_list_from_image(image_bytes: bytes) -> list[dict]:
    """Use Groq Vision to directly extract a structured grocery list from an image."""
    try:
        from openai import AsyncOpenAI
        import base64
        from app.core.config import settings
        
        if settings.OLLAMA_URL:
            client = AsyncOpenAI(api_key="ollama", base_url=f"{settings.OLLAMA_URL}/v1")
            model_name = settings.OLLAMA_VISION_MODEL or "llava"
        elif settings.GROQ_API_KEY:
            client = AsyncOpenAI(api_key=settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")
            model_name = "meta-llama/llama-4-scout-17b-16e-instruct"
        elif settings.GROK_API_KEY:
            client = AsyncOpenAI(api_key=settings.GROK_API_KEY, base_url="https://api.x.ai/v1")
            model_name = "grok-4.3"
        else:
            return [{"error": "No API key configured for vision models."}]
            
        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        response = await client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "This image contains a handwritten or printed grocery list. "
                                "Extract every item you can see and return a JSON array with objects "
                                "containing: 'name' (string), 'quantity' (number, default 1), "
                                "'unit' (string: 'kg', 'g', 'litre', 'ml', 'dozen', 'pieces', 'pack'). "
                                "Return ONLY valid JSON array, no markdown, no extra text."
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                        },
                    ],
                }
            ],
            temperature=0.1,
        )
        raw = response.choices[0].message.content.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except Exception as e:
        return [{"error": str(e)}]


async def find_nearby_shops_by_category(lat: float, lng: float, category: str = "kirana") -> list[dict]:
    """Use Groq to generate realistic nearby shops for a specific category."""
    system = (
        "You are a local neighborhood expert for Indian cities. Given GPS coordinates and a shop category, "
        "generate a realistic list of 5 to 8 nearby shops/stores of that category. "
        "Each shop should have: 'shop_name', 'category', 'location_address' (realistic Indian address), "
        "'phone_number' (Indian format like 9XXXXXXXXX), 'open_from' (e.g. '08:00 AM'), "
        "'open_to' (e.g. '10:00 PM'), 'rating' (float 3.5-5.0), "
        "'lat' (float, within 0.01 degrees of input lat), 'lng' (float, within 0.01 degrees of input lng). "
        "Return ONLY a JSON array of shop objects. No markdown, no extra text."
    )
    prompt = _build_prompt(
        system,
        f"Find nearby '{category}' shops for coordinates: Latitude {lat}, Longitude {lng}. "
        f"Make addresses realistic for the nearest Indian city to these coordinates.",
    )
    result = await _call_llm(prompt, {"type": "json_object"})
    try:
        data = json.loads(result)
        if isinstance(data, list):
            return data
        # LLM might wrap in an object
        for v in data.values():
            if isinstance(v, list):
                return v
        return []
    except (json.JSONDecodeError, TypeError):
        return []


async def find_nearby_shops_grok(lat: float, lng: float) -> list[dict]:
    return await find_nearby_shops_by_category(lat, lng, category="kirana")
