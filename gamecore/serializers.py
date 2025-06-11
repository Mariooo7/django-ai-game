from rest_framework import serializers  # 从 DRF 库中导入 serializers 工具
from .models import GameRound  # 从当前应用的 models.py 中导入我们定义的 GameRound 模型

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

        if len(player_prompt) > char_limit:
            # 如果提示词长度超过限制，抛出一个验证错误
            raise serializers.ValidationError(
                f"提示词长度 ({len(player_prompt)}) 超过了本轮设定的最大字符数 ({char_limit})。"
            )

        # 验证通过，返回数据
        return data




class GameRoundResultSerializer(serializers.ModelSerializer):
    # Meta 类用于配置序列化器
    class Meta:
        model = GameRound  # 告诉这个序列化器，它的结构是基于 GameRound 模型的。
        fields = '__all__' # 告诉序列化器，将模型中的所有字段都包含在输出结果里。