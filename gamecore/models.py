from django.db import models
from  django.conf import settings

# 定义一个名为 GameRound 的模型类，它继承自 models.Model
class GameRound(models.Model):
    # --- 会话与记录信息 ---
    # 定义一个名为 user 的字段，用于存储游戏的用户，使用 setting.AUTH_USER_MODEL 来指定用户模型
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # 引用 Django 的用户模型
        on_delete=models.CASCADE,  # 如果用户被删除，与之关联的游戏轮次也会被删除
        related_name='game_rounds',  # 反向关系，允许通过 user.game_rounds.all() 来访问用户的所有游戏轮次
        help_text="游戏的用户。"  # 在Admin后台等地方显示的辅助说明文字
    )

    # 定义一个名为 timestamp 的字段，用于存储日期和时间
    timestamp = models.DateTimeField(
        auto_now_add=True,  # 在记录第一次创建时，自动将此字段的值设置为当前时间
        help_text="该游戏轮次完成的日期和时间。"  # 辅助说明文字
    )

    # --- 原始图片信息 ---

    # 定义一个名为 original_image_url 的字段，用于存储原始图片的URL
    original_image_url = models.URLField(
        max_length=500,  # 设置URL的最大长度为500个字符
        help_text="用于本轮游戏的原始图片的URL。"  # 辅助说明文字
    )

    # --- 玩家回合信息 ---

    # 定义一个名为 player_prompt 的字段，用于存储玩家输入的提示词
    player_prompt = models.TextField(
        blank=True,  # 允许此字段在表单（如Admin后台）中为空
        null=True,  # 允许此字段在数据库中的值为NULL（空）
        help_text="人类玩家编写的提示词。"  # 辅助说明文字
    )
    # 定义一个名为 player_generated_image_url 的字段，用于存储玩家生成的图片的URL
    player_generated_image_url = models.TextField(
        blank=True,  # 允许在表单中为空
        null=True,  # 允许在数据库中为空
        help_text="由玩家提示词生成的图片的URL。"  # 辅助说明文字
    )
    # 定义一个名为 player_similarity_score 的字段，用于存储玩家图片的相似度得分
    player_similarity_score = models.FloatField(
        blank=True,  # 允许在表单中为空
        null=True,  # 允许在数据库中为空
        help_text="玩家生成的图片与原图的相似度得分。"  # 辅助说明文字
    )

    # --- AI 回合信息 ---

    # 定义一个名为 ai_generated_prompt_from_image 的字段，用于存储AI生成的提示词
    ai_generated_prompt_from_image = models.TextField(
        blank=True,  # 允许在表单中为空
        null=True,  # 允许在数据库中为空
        help_text="AI分析原始图片后生成的提示词。"  # 辅助说明文字
    )
    # 定义一个名为 ai_generated_image_url 的字段，用于存储AI生成的图片的URL
    ai_generated_image_url = models.TextField(
        blank=True,  # 允许在表单中为空
        null=True,  # 允许在数据库中为空
        help_text="由AI提示词生成的图片的URL。"  # 辅助说明文字
    )
    # 定义一个名为 ai_similarity_score 的字段，用于存储AI图片的相似度得分
    ai_similarity_score = models.FloatField(
        blank=True,  # 允许在表单中为空
        null=True,  # 允许在数据库中为空
        help_text="AI生成的图片与原图的相似度得分。"  # 辅助说明文字
    )

    # --- 游戏结果信息 ---

    # 定义一个包含可选值的元组列表，用于 'winner' 字段
    WINNER_CHOICES = [
        ('player', '玩家胜利'),  # 选项1：数据库存'player'，界面显示'玩家胜利'
        ('ai', 'AI胜利'),     # 选项2：数据库存'ai'，界面显示'AI胜利'
        ('draw', '平局'),     # 选项3：数据库存'draw'，界面显示'平局'
    ]
    # 定义一个名为 winner 的字段，用于存储胜负结果
    winner = models.CharField(
        max_length=10,  # 设置此文本字段的最大长度为10个字符
        choices=WINNER_CHOICES,  # 将此字段的可选值限制为上面定义的WINNER_CHOICES
        blank=True,  # 允许在表单中为空
        null=True  # 允许在数据库中为空
    )

    # 定义一个特殊方法 __str__，用于返回该模型实例的字符串表示形式
    def __str__(self):
        # 这个方法使得在Admin后台或其他地方显示对象时，更具可读性
        return f"Round for {self.user.username} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"

    # 定义一个内部 Meta 类，用于配置模型级别的选项
    class Meta:
        # ordering 选项用于指定查询该模型时的默认排序方式
        ordering = ['-timestamp']  # 按 'timestamp' 字段降序（'-'号代表降序）排列，即最新的记录在前
