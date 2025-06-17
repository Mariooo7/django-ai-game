import os
import requests
from PIL import Image
from io import BytesIO
import traceback
import base64

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
    # 配置模型，指定我们要使用的模型版本
    vision_model = "doubao-seed-1.6-250615"
    image_generation_model = "doubao-seedream-3-0-t2i-250415"
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

# 新增：定义一个辅助函数，用于从URL加载、预处理并编码图片为Base64
def preprocess_and_encode_image(image_url: str) -> str:
    """
    从给定的URL下载图片，进行尺寸和格式优化，并返回Base64编码的字符串。
    """
    # 1. 从URL下载图片，设置一个合理的超时时间
    response = requests.get(image_url, timeout=120)
    response.raise_for_status()  # 如果下载失败（如404），则会在此处抛出异常

    # 2. 使用Pillow库从下载的二进制内容中打开图片
    image = Image.open(BytesIO(response.content))

    # 3. 统一转换为RGB格式，以处理PNG等可能带透明通道的图片
    if image.mode != 'RGB':
        image = image.convert('RGB')

    # 4. 核心优化：调整图片尺寸。
    # 将图片等比缩放到最大边不超过512像素，能极大减小文件体积，加速处理
    image.thumbnail((512, 512))

    # 5. 将处理后的图片保存到内存中的BytesIO对象
    # 使用JPEG格式以获得高压缩率，quality参数可以平衡质量和体积
    buffer = BytesIO()
    image.save(buffer, format="JPEG", quality=85)
    image_bytes = buffer.getvalue()

    # 6. 将图片的二进制数据编码为Base64字符串并返回
    return base64.b64encode(image_bytes).decode('utf-8')


def get_ai_prompt_from_image(image_url: str, language: str = 'en', char_limit: int = 20) -> str | None:
    """
    调用豆包API，根据图片内容和指定语言生成描述性提示词。
    优化：不再传递URL，而是直接传递图片的Base64编码数据。
    """
    if not client:
        return "[错误：客户端未初始化，请检查 API 密钥和网络连接]"

    try:
        # 核心修改：先调用新函数将URL转换为Base64字符串
        base64_image = preprocess_and_encode_image(image_url)

        # 根据语言和字数限制构建指令
        if language == 'en':
            prompt_instruction = f"Write a prompt for an image - generation model within {char_limit} characters. Make it vivid, include key details of the image, and ensure it's suitable for generating a new image. Strictly adhere to the character limit."
        else:
            prompt_instruction = f"请为文生图模型撰写一段提示词，严格控制在 {char_limit} 个字符以内。描述需生动具体，涵盖图片关键细节，以确保适合生成新的图像。请严格遵守字符限制。"
        # 构建新的请求体，不再使用 "image_url"，而是直接传入图片数据
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt_instruction},
                    # 这里是关键改动！
                    {"type": "image", "content": base64_image},
                ],
            }
        ]
        # 调用 chat.completions.create 方法
        response = client.chat.completions.create(
            model=vision_model,
            messages=messages,
            timeout=180.0  # 保留较长的超时以应对AI模型处理耗时
        )
        return response.choices[0].message.content

    except Exception as e:
        # 保留详细的错误日志打印，以便未来排错
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
        return "[错误：客户端未初始化，请检查 API 密钥和网络连接]"
    try:
        # 调用 豆包 API 生成图片
        response = client.images.generate(
            model=image_generation_model,
            prompt=prompt,
            timeout=180.0  # 同样保留长超时
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
    # 检查 CLIP 模型是否已成功加载
    if not clip_model:
        return 0.0  # 如果模型未加载，返回0分

    if not image_url_1 or not image_url_2:
        print("计算图片相似度时，传入的图片 URL 为空。")
        return None

    try:
        def load_and_preprocess_image(url: str) -> Image.Image:
            with requests.get(url, stream=True, timeout=120) as response:
                response.raise_for_status()
                img = Image.open(BytesIO(response.content))
                img = img.convert("RGB")
                # CLIP模型优化的尺寸
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