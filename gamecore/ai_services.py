import os
import requests
from PIL import Image
from io import BytesIO
import traceback

from volcenginesdkarkruntime import Ark
from sentence_transformers import SentenceTransformer, util

# --- 全局初始化 ---
try:
    ARK_API_KEY = os.getenv('ARK_API_KEY')
    if not ARK_API_KEY:
        print("警告：未在环境变量中找到 ARK_API_KEY。豆包 API 将无法工作。")
    client = Ark(api_key=ARK_API_KEY)
    vision_model = "doubao-seed-1.6-250615"
    image_generation_model = "doubao-seedream-3-0-t2i-250415"
    print("客户端已成功配置。")
except Exception as e:
    client = None
    print(f"客户端配置时发生错误: {e}")

try:
    clip_model = SentenceTransformer('clip-ViT-B-32')
    print("CLIP 图像相似度模型 'clip-ViT-B-32' 已成功加载。")
except Exception as e:
    clip_model = None
    print(f"加载 CLIP 模型时发生错误: {e}")


# --- 服务函数定义 ---

def get_ai_prompt_from_image(image_url: str, language: str = 'en', char_limit: int = 20) -> str | None:
    """
    调用豆包API，根据图片URL和指定语言生成描述性提示词。
    （已还原为使用 image_url 的正确版本）
    """
    if not client:
        return "[错误：客户端未初始化]"

    try:
        if language == 'en':
            prompt_instruction = f"You are an expert at writing descriptive prompts for text - to - image AI models. You have {char_limit} characters to describe the following image. Describe the image with strictly under {char_limit} characters. "
        else:
            prompt_instruction = f"你是一位为文生图 AI 模型撰写描述性提示词的专家。请严格在 {char_limit} 个字符内描述该图片。"

        # 构建符合豆包API要求的、使用 image_url 的请求体
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "content": image_url},
                    {"type": "text", "content": prompt_instruction}
                ],
            }
        ]
        response = client.chat.completions.create(
            model=vision_model,
            messages=messages,
            timeout=180.0
        )
        return response.choices[0].message.content

    except Exception as e:
        print("=" * 80)
        print("!!!!!! AI SERVICE CRITICAL ERROR in get_ai_prompt_from_image !!!!!!")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {e}")
        traceback.print_exc()
        print("=" * 80)
        return None


def get_image_from_prompt(prompt: str) -> str | None:
    """
    调用文生图模型，根据提示词生成图片， 并返回图片 URL。
    """
    if not client:
        return "[错误：客户端未初始化]"
    try:
        response = client.images.generate(
            model=image_generation_model,
            prompt=prompt,
            timeout=180.0
        )
        return response.data[0].url

    except Exception as e:
        print("=" * 80)
        print("!!!!!! AI SERVICE CRITICAL ERROR in get_image_from_prompt !!!!!!")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {e}")
        traceback.print_exc()
        print("=" * 80)
        return None


def calculate_image_similarity(image_url_1: str, image_url_2: str) -> float | None:
    """
    使用本地加载的 CLIP 模型，计算两张图片的语义相似度。
    """
    if not clip_model:
        return 0.0

    if not image_url_1 or not image_url_2:
        return None

    try:
        def load_and_preprocess_image(url: str) -> Image.Image:
            with requests.get(url, stream=True, timeout=120) as response:
                response.raise_for_status()
                img = Image.open(BytesIO(response.content))
                img = img.convert("RGB")
                img = img.resize((224, 224))
                return img

        image_1 = load_and_preprocess_image(image_url_1)
        image_2 = load_and_preprocess_image(image_url_2)

        if not image_1 or not image_2:
            return None

        embeddings = clip_model.encode(
            [image_1, image_2],
            convert_to_tensor=True,
        )
        cosine_scores = util.cos_sim(embeddings[0], embeddings[1])
        similarity_score = cosine_scores.item() * 100

        return round(max(0.0, min(similarity_score, 100.0)), 2)

    except Exception as e:
        print(f"计算图片相似度时发生错误: {e}")
        traceback.print_exc()
        return None