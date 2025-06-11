# 导入必要的模块
import random
from django.shortcuts import render # 用于渲染模板
from rest_framework.views import APIView  # 从DRF导入APIView，这是创建API视图的基础类
from rest_framework.response import Response  # 从DRF导入Response对象，用于返回API响应
from rest_framework import status  # 从DRF导入HTTP状态码，如 400 BAD REQUEST

# 导入创建的模型和序列化器
from .models import GameRound  # 导入模型
from .serializers import PlayerTurnInputSerializer, GameRoundResultSerializer # 导入序列化器

# 导入AI服务模块
from . import ai_services

def game_view(request):
    """
    这个视图负责渲染游戏的主页面。
    """
    # render 函数会找到指定的模板文件，用数据填充它，
    # 然后返回一个包含最终HTML内容的HttpResponse对象。
    return render(request, 'gamecore/index.html')

class PlayTurnAPIView(APIView):
    """
    处理游戏回合的核心 API。
    """
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
                {"error": "AI failed to generate a prompt from the image. Check server logs for details."},
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
                {"error": "Failed to calculate image similarity. Check server logs for details."},
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
            session_id=request.session.session_key,
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