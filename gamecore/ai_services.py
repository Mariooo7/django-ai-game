import os
import requests
from PIL import Image
from io import BytesIO

from volcenginesdkarkruntime import Ark
from sentence_transformers import SentenceTransformer, util

# --- 全局初始化 (这些操作只在 Django 启动时执行一次，以提高性能) ---
# 1. 配置客户端
try:
    # 从 .env 文件加载的环境变量中获取 API 密钥
    ARK_API_KEY = os.getenv('ARK_API_KEY')
    if not ARK_API_KEY:
        # 如果没找到密钥，在服务器启动日志中打印一个警告
        print("警告：未在环境变量中找到 ARK_API_KEY。豆包 API 将无法工作。")
    # 配置客户端
    client = Ark(api_key=ARK_API_KEY)
    # 配置 Gemini 模型，指定我们要使用的模型版本
    vision_model = "doubao-seed-1.6-250615"
    image_generation_model="doubao-seedream-3-0-t2i-250415"
    print("客户端已成功配置。")
except Exception as e:
    client = None
    print(f"客户端配置时发生错误: {e}")



# 2. 加载 CLIP 模型用于图像相似度计算
# 重要提示：第一次运行 Django 服务器时，它会自动从网上下载 CLIP 模型文件（可能超过1GB），
#           这个过程会比较慢，请耐心等待。后续启动会直接从本地缓存加载，速度会很快。
try:
    # 加载一个性能和效果均衡的预训练 CLIP 模型
    clip_model = SentenceTransformer('clip-ViT-B-32')
    print("CLIP 图像相似度模型 'clip-ViT-B-32' 已成功加载。")
except Exception as e:
    clip_model = None
    print(f"加载 CLIP 模型时发生错误: {e}")


# --- 服务函数定义 ---

def get_ai_prompt_from_image(image_url: str, language: str = 'en', char_limit: int = 20) -> str | None:
    """
    调用 豆包 API，根据图片 URL 和指定语言生成描述性提示词。
    """
    # 检查模型是否已成功初始化
    if not client:
        return "[错误：客户端未初始化，请检查 API 密钥和网络连接]"

    try:
        # 调用 豆包 API 生成提示词
        if language == 'en':
            if char_limit < 50:
                prompt_instruction = f"You are an expert at writing descriptive prompts for text - to - image AI models. The character limit is only {char_limit}, which is quite tight. Please focus on the most essential and striking features of the following image. Distill the image's essence into a short yet powerful description. Your concise description will effectively guide the text - to - image model. Describe the image with strictly under {char_limit} characters. "
            else:
                prompt_instruction = f"You are an expert at writing descriptive prompts for text - to - image AI models. You have {char_limit} characters to describe the following image, which gives you enough room to be detailed. However, please still keep your description concise and focus on the key elements. Avoid unnecessary elaboration. Describe the image with strictly under {char_limit} characters. "
        else:
            if char_limit < 50:
                prompt_instruction = f"你是一位为文生图 AI 模型撰写描述性提示词的专家。当前字符限制仅为 {char_limit} 个，非常紧张。请聚焦于以下图片最核心、最突出的特征，将图片精髓提炼成简短却有力的描述。你简洁的描述将有效引导文生图模型。请严格在 {char_limit} 个字符内描述该图片。"
            else:
                prompt_instruction = f"你是一位为文生图 AI 模型撰写描述性提示词的专家。你有 {char_limit} 个字符来描述以下图片，这为你提供了足够的空间来详细描述。不过，请依然保持描述简洁，聚焦关键要素，避免不必要的赘述。请严格在 {char_limit} 个字符内描述该图片。"
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": image_url}},
                    {"type": "text", "text": prompt_instruction}
                ]
            }
        ]
        # 调用 chat.completions.create 方法
        response = client.chat.completions.create(
            model=vision_model,
            messages=messages
        )

        # 从响应中提取生成的文本内容
        return response.choices[0].message.content

    except Exception as e:
        # 捕获并打印任何可能发生的错误（如网络问题、API认证失败等）
        print(f"调用 豆包 API 时发生错误: {e}")
        return None # 出错时返回 None


def get_image_from_prompt(prompt: str) -> str | None:
    """
    调用文生图模型，根据提示词生成图片， 并返回图片 URL。
    """
    if not client:
        return "[错误：客户端未初始化，请检查 API 密钥和网络连接]"
    try:
        # 调用 豆包 API 生成图片
        contents = prompt
        response = client.images.generate(
            model=image_generation_model,
            prompt=prompt
        )
        return response.data[0].url

    except Exception as e:
        # 捕获并打印任何可能发生的错误（如网络问题、API认证失败等）
        print(f"调用 豆包 API 生成图像时发生错误: {e}")
        return None # 出错时返回 None

def calculate_image_similarity(image_url_1: str, image_url_2: str) -> float | None:
    """
    使用本地加载的 CLIP 模型，计算两张图片的语义相似度。
    """
    # 检查 CLIP 模型是否已成功加载
    if not clip_model:
        return 0.0 # 如果模型未加载，返回0分

    # 健壮性检查：确保传入的 URL 是有效的
    if not image_url_1 or not image_url_2:
        print("计算图片相似度时，传入的图片 URL 为空。")
        return None
    # --- 检查结束 ---

    try:
       # 定义内部辅助函数，用于加载来自 URL 的图片
        # --- 核心优化：增加图片预处理（调整尺寸）的内部函数 ---
        def load_and_preprocess_image(url: str) -> Image.Image:
            with requests.get(url, stream=True, timeout=30) as response:
                response.raise_for_status()
                img = Image.open(BytesIO(response.content))

                # 1. 转换为 RGB，确保图片格式统一，避免 RGBA 等格式带来的问题
                img = img.convert("RGB")

                # 2. 缩小图片尺寸。CLIP 等视觉模型通常在 224x224 的尺寸上训练，
                #    使用这个尺寸可以极大地降低内存占用，且几乎不影响模型效果。
                img = img.resize((112, 112))

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
        # 捕获并打印任何可能发生的错误
        print(f"计算图片相似度时发生错误: {e}")
        return None # 出错时返回 None
