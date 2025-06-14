# 导入必要的模块
from rest_framework.views import APIView # 从DRF导入APIView，这是创建API视图的基础类
from rest_framework.generics import ListAPIView  # 从DRF导入ListAPIView，用于创建只读的API视图
from rest_framework.response import Response  # 从DRF导入Response对象，用于返回API响应
from rest_framework import status  # 从DRF导入HTTP状态码，如 400 BAD REQUEST
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser  # 用于解析包含文件的表单数据
from rest_framework.permissions import IsAuthenticated  # 用于确保只有经过身份验证的用户才能访问视图
from django.core.files.storage import default_storage  # 用于管理文件存储
import random  # 用于生成随机提示词

# 导入创建的模型和序列化器
from .models import GameRound, GameEvent  # 导入模型
from .serializers import PlayerTurnInputSerializer, GameRoundResultSerializer, GameStartSerializer, LeaderboardSerializer, GameEventSerializer # 导入序列化器

# 导入AI服务模块
from . import ai_services

# 导入Django的配置设置
from django.conf import settings

# 导入数据库聚合、分组功能
from django.db.models import Count, Avg, F

# 使用 React 渲染游戏页面，不需要这个视图
# def game_view(request):
#     """
#     这个视图负责渲染游戏的主页面。
#     """
#     # render 函数会找到指定的模板文件，用数据填充它，
#     # 然后返回一个包含最终HTML内容的HttpResponse对象。
#     return render(request, 'gamecore/index.html')

class PlayTurnAPIView(APIView):
    """
    处理游戏回合的核心 API。
    """

    # 指定该视图需要经过身份验证
    permission_classes = [IsAuthenticated]

    # post 方法会自动处理所有发往此视图的 POST 类型的 HTTP 请求
    def post(self, request, *args, **kwargs):
        input_serializer = PlayerTurnInputSerializer(data=request.data)
        # 验证输入数据是否有效， 否则返回错误响应
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = input_serializer.validated_data
        original_image_url = validated_data['original_image_url']
        player_prompt = validated_data['player_prompt']
        language = validated_data['language']
        char_limit = validated_data['char_limit']

        # 1. 玩家回合：根据玩家提示词生成图片
        player_generated_image_url = ai_services.get_image_from_prompt(player_prompt)

        # 2. AI 回合：AI识图 -> AI生成图片
        # 将 language 和 char_limit 参数都传递给服务函数
        ai_prompt_from_image = ai_services.get_ai_prompt_from_image(
            image_url=original_image_url,
            language=language,
            char_limit=char_limit
        )
        # 检查是否成功获取到提示词
        if ai_prompt_from_image is None:
            return Response(
                {"error": "AI failed to generate a prompt from the images. Check server logs for details."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # AI 生成的提示词也应该被用来生成图片
        ai_generated_image_url = ai_services.get_image_from_prompt(ai_prompt_from_image)
        # 确保图片都生成成功
        if not all([player_generated_image_url, ai_generated_image_url]):
             return Response(
                {"error": "AI failed to generate one or more images. Check server logs for details."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 3. 计算相似度
        player_similarity_score = ai_services.calculate_image_similarity(
            original_image_url, player_generated_image_url
        )
        ai_similarity_score = ai_services.calculate_image_similarity(
            original_image_url, ai_generated_image_url
        )
        # --- 确保相似度计算成功 ---
        if player_similarity_score is None or ai_similarity_score is None:
            return Response(
                {"error": "Failed to calculate images similarity. Check server logs for details."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 4. 判定胜负
        winner = 'draw'
        if player_similarity_score > ai_similarity_score:
            winner = 'player'
        elif ai_similarity_score > player_similarity_score:
            winner = 'ai'

        # 5. 创建并保存 GameRound 记录到数据库
        game_round = GameRound.objects.create(
            user=request.user,
            original_image_url=original_image_url,
            player_prompt=player_prompt,
            player_generated_image_url=player_generated_image_url,
            player_similarity_score=player_similarity_score,
            ai_generated_prompt_from_image=ai_prompt_from_image,
            ai_generated_image_url=ai_generated_image_url,
            ai_similarity_score=ai_similarity_score,
            winner=winner
        )

        # 6. 准备并返回响应
        output_serializer = GameRoundResultSerializer(game_round)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

class StartGameAPIView(APIView):
    """
    处理游戏开始（上传或随机生成原图）
    """
    # 添加文件解析器，用于处理包含文件的表单数据
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    # 将 GameStartSerializer 关联到这个视图，以便 DRF 的可浏览 API 能够识别它
    serializer_class = GameStartSerializer
    # 保护这个视图，确保只有经过身份验证的用户才能访问
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # 检查序列化器是否有效
        serializer = GameStartSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uploaded_image = serializer.validated_data.get('uploaded_image')

        if uploaded_image:
            # --- 场景1：处理用户上传的图片 ---
            # 调用 Django 的 default_storage 来保存文件。
            file_name = default_storage.save(uploaded_image.name, uploaded_image)
            # 构建文件的完整 URL
            file_url = request.build_absolute_uri(settings.MEDIA_URL + file_name)
            return Response({
                "message": "Image uploaded and saved successfully.",
                "original_image_url": file_url
            }, status=status.HTTP_201_CREATED)

        else:
            # --- 场景2：随机生成图片 ---
            # 这里我们使用一个简单的随机生成器来模拟生成图片的过程。
            styles = [
                "写实", "抽象", "印象派", "超现实主义", "复古", "现代", "简约",
                "时尚", "浪漫", "暗黑", "梦幻", "蒸汽朋克", "赛博朋克"
            ]
            subjects = [
                "自然风光", "城市街景", "建筑奇观", "动物世界", "美食佳肴",
                "时尚穿搭", "历史场景", "科技产品", "运动瞬间", "节日庆典",
                "人物肖像", "静物特写", "抽象图案"
            ]
            mediums = [
                "油画", "水彩画", "丙烯画", "素描", "数字绘画", "摄影作品",
                "3D 渲染", "插画", "拼贴画", "版画"
            ]
            moods = [
                "欢快", "宁静", "神秘", "温馨", "悲伤", "震撼", "幽默",
                "优雅", "紧张", "浪漫", "孤独", "励志"
            ]

            random_style = random.choice(styles)
            random_subject = random.choice(subjects)
            random_medium = random.choice(mediums)
            random_mood = random.choice(moods)

            prompt = (
                f"一张{random_style}风格的{random_subject}主题{random_medium}作品，传达出{random_mood}的情绪，画面细节和构图随机"
            )
            image_url = ai_services.get_image_from_prompt(prompt)

            if image_url:
                return Response({
                    "message": "Random images generated successfully.",
                    "original_image_url": image_url
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "message": "Failed to generate one or more images. Check server logs for details."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 历史记录 API 视图
class GameRoundHistoryAPIView(ListAPIView):
    """
    显示用户的游戏历史记录。
    只读接口，只响应 GET 请求。
    """
    # 指定这个视图应该使用哪个序列化器来格式化数据
    serializer_class = GameRoundResultSerializer
    # 指定这个视图需要用户登录才能访问
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        这是 ListAPIView 的核心方法，我们必须重写它。
        它的返回值决定了这个列表包含了哪些数据。
        """
        # self.request.user 会自动获取到当前通过认证的用户对象
        user = self.request.user
        # 通过 user 对象，查询所有与他关联的 GameRound 记录，并按时间倒序排列
        return GameRound.objects.filter(user=user).order_by('-timestamp')

# 排行榜 API 视图
class LeaderboardAPIView(ListAPIView):
    """
    获取战胜 AI 次数最多的用户排行榜。
    这是一个公开的、只读的接口。
    """
    # 使用我们为排行榜创建的专用序列化器
    serializer_class = LeaderboardSerializer
    # 无需 permission_classes，因为排行榜是公开的

    def get_queryset(self):
        """
        构建一个复杂的数据库查询来生成排行榜数据。
        """
        # F() 对象允许我们在查询中直接引用模型的字段值
        win_margin = F('player_similarity_score') - F('ai_similarity_score')

        queryset = GameRound.objects.filter(
            winner='player'  # 1. 首先，只筛选出玩家获胜的记录
        ).values(
            username = F('user__username') # 2. 按用户名进行分组
        ).annotate(
            win_count=Count('id'), # 3. 为每个分组（即每个用户）计算获胜次数
            avg_win_margin=Avg(win_margin) # 4. 为每个分组计算平均净胜分
        ).order_by(
            '-win_count', '-avg_win_margin' # 5. 首先按获胜次数降序排，次数相同再按平均净胜分降序排
        )[:7] # 6. 最后，只取排名前 7 的记录

        return queryset

# 数据埋点 API 视图
class GameEventAPIView(APIView):
    """
    用于记录用户行为的 API 视图。
    公开接口，无需登录即可调用
    """
    # 无需 permission_classes，因为希望所有用户的行为都能被记录
    def post(self, request, *args, **kwargs):
        """
        处理 POST 请求，记录用户行为。
        """
        # 验证输入数据是否符合我们定义的序列化器要求
        serializer = GameEventSerializer(data=request.data)
        if serializer.is_valid():
            # 检查是否登录
            user = request.user if request.user else None
            # 获取 Session ID
            session_id = request.session.session_key
            # 创建 GameEvent 记录
            GameEvent.objects.create(
                user=user,
                session_id=session_id,
                event_type=serializer.data['event_type'],
                event_data=serializer.data.get('event_data', {}),
            )
            # 返回 204 No Content，表示请求成功，但没有返回任何内容
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)