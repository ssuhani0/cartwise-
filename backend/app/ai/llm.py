import json
from typing import Any, Optional
from app.core.config import settings

_llm_client = None


def _get_client():
    global _llm_client
    if _llm_client is not None:
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

    if client_type == "grok":
        kwargs = {
            "model": "grok-beta",
            "messages": prompt,
            "temperature": 0.3,
        }
        if response_format:
            kwargs["response_format"] = response_format
        response = await client.chat.completions.create(**kwargs)
        return response.choices[0].message.content or ""

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
    recommend items the user might need. Return a JSON array of product recommendations with 'product_name', 
    'reason' (why recommended), and 'confidence' (high/medium/low). Do not include any coordinates or location data."""

    prompt = _build_prompt(
        system,
        f"User history: {json.dumps(user_history)}\nAvailable products: {json.dumps(available_products)}",
    )
    result = await _call_llm(prompt, {"type": "json_object"})

    try:
        return json.loads(result)
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
