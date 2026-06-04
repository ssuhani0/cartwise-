import io
from typing import Optional
from PIL import Image
from app.core.config import settings


async def extract_text_from_image(image_bytes: bytes) -> str:
    if settings.GROK_API_KEY:
        return await _extract_with_grok(image_bytes)

    return _extract_with_tesseract(image_bytes)


def _extract_with_tesseract(image_bytes: bytes) -> str:
    try:
        import pytesseract
        if settings.GOOGLE_TESSERACT_PATH:
            pytesseract.pytesseract.tesseract_cmd = settings.GOOGLE_TESSERACT_PATH
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image, lang="eng+hin")
        return text.strip()
    except Exception:
        return ""


async def _extract_with_grok(image_bytes: bytes) -> str:
    try:
        from openai import AsyncOpenAI
        import base64
        client = AsyncOpenAI(api_key=settings.GROK_API_KEY, base_url="https://api.x.ai/v1")
        
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        response = await client.chat.completions.create(
            model="grok-vision-beta",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Extract all handwritten grocery items from this image. List each item on a new line with quantity if visible."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return _extract_with_tesseract(image_bytes)
