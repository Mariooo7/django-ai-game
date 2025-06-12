from rest_framework import serializers  # 从 DRF 库中导入 serializers 工具
from .models import GameRound  # 从当前应用的 models.py 中导入我们定义的 GameRound 模型
import re  # 导入 Python 的 re 模块，用于正则表达式操作

class PlayerTurnInputSerializer(serializers.Serializer):
    # 定义一个名为 original_image_url 的字段，我们期望它是一个URL。
    original_image_url = serializers.URLField(max_length=500)
    # 定义一个名为 player_prompt 的字段，我们期望它是一个字符串。
    player_prompt = serializers.CharField(max_length=1000)
    language = serializers.ChoiceField(choices=['en', 'zh'], default='en')
    char_limit = serializers.IntegerField(min_value=1, max_value=200, default=20)

    # 定义验证方法，用于检查提示词长度是否符合要求
    def validate(selfs, data):
        """
        在所有字段基础验证通过后，进行跨字段的验证。
        """
        player_prompt = data.get('player_prompt')
        char_limit = data.get('char_limit')
        prompt_length_without_spaces = len(re.sub(r'\s+', '', player_prompt))

        if len(player_prompt) > char_limit:
            # 如果提示词长度超过限制，抛出一个验证错误
            raise serializers.ValidationError(
                f"提示词有效字符数 ({prompt_length_without_spaces}) 超过了本轮设定的最大字符数 ({char_limit})。"
            )

        # 验证通过，返回数据
        return data


class GameRoundResultSerializer(serializers.ModelSerializer):
    # Meta 类用于配置序列化器
    class Meta:
        model = GameRound  # 告诉这个序列化器，它的结构是基于 GameRound 模型的。
        fields = '__all__' # 告诉序列化器，将模型中的所有字段都包含在输出结果里。

class GameStartSerializer(serializers.Serializer):
    # ImageField 用于处理文件上传。`required=False`表示这个字段是可选的。
    uploaded_image = serializers.ImageField(required=False)

# 为排行榜创建序列化器
class LeaderboardSerializer(serializers.Serializer):
    """
    用于格式化排行榜聚合查询的结果。
    这里的字段名必须与我们稍后在视图查询中定义的注解名完全一致。
    """
    # read_only=True 表示这些字段仅用于序列化输出，不用于反序列化输入。
    username = serializers.CharField(read_only=True)
    win_count = serializers.IntegerField(read_only=True)
    avg_win_margin = serializers.FloatField(read_only=True)