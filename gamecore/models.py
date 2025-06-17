from django.db import models
from django.conf import settings
import uuid
import os

# 新增：定义一个文件上传路径和重命名的函数
def game_image_upload_path(filename):
    """
    自定义上传路径函数，用于自动重命名上传的文件。
    这可以防止因文件名包含空格、特殊字符或重名导致的问题。
    """
    # 1. 从原始文件名中安全地获取扩展名
    ext = filename.split('.')[-1]
    # 2. 使用uuid4生成一个全球唯一的、不含特殊字符的字符串作为新文件名
    new_filename = f"{uuid.uuid4()}.{ext}"
    # 3. 返回最终的保存路径，所有图片都将被存放在 'media/uploads/' 目录下
    return os.path.join('uploads', new_filename)


class GameRound(models.Model):
    # --- 会话与记录信息 ---
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='game_rounds',
        help_text="游戏的用户。"
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text="该游戏轮次完成的日期和时间。"
    )

    # --- 原始图片信息 (核心修改) ---
    # 1. 字段类型从 TextField 改为 ImageField，以正确处理和存储上传的图片文件。
    # 2. 使用我们新创建的 game_image_upload_path 函数来自动处理上传文件的路径和命名。
    original_image_url = models.ImageField(
        upload_to=game_image_upload_path,
        max_length=500,
        blank=True,
        null=True,
        help_text="用于本轮游戏的原始图片，上传后会自动重命名并保存。"
    )

    # --- 玩家回合信息 ---
    player_prompt = models.TextField(
        blank=True,
        null=True,
        help_text="人类玩家编写的提示词。"
    )
    player_generated_image_url = models.TextField(
        blank=True,
        null=True,
        help_text="由玩家提示词生成的图片的URL。"
    )
    player_similarity_score = models.FloatField(
        blank=True,
        null=True,
        help_text="玩家生成的图片与原图的相似度得分。"
    )

    # --- AI 回合信息 ---
    ai_generated_prompt_from_image = models.TextField(
        blank=True,
        null=True,
        help_text="AI分析原始图片后生成的提示词。"
    )
    ai_generated_image_url = models.TextField(
        blank=True,
        null=True,
        help_text="由AI提示词生成的图片的URL。"
    )
    ai_similarity_score = models.FloatField(
        blank=True,
        null=True,
        help_text="AI生成的图片与原图的相似度得分。"
    )

    # --- 游戏结果信息 ---
    WINNER_CHOICES = [
        ('player', '玩家胜利'),
        ('ai', 'AI胜利'),
        ('draw', '平局'),
    ]
    winner = models.CharField(
        max_length=10,
        choices=WINNER_CHOICES,
        blank=True,
        null=True,
        db_index=True,
    )

    def __str__(self):
        return f"Round for {self.user.username} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        ordering = ['-timestamp']


# --- GameEvent 模型保持不变 ---
class GameEvent(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="记录事件的用户"
    )
    session_id = models.CharField(
        max_length=255,
        db_index=True,
    )
    event_type = models.CharField(
        max_length=100,
        db_index=True,
        help_text="事件的类型"
    )
    event_data = models.JSONField(
        default=dict,
        blank=True,
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        user_identifier = self.user.username if self.user else self.session_id
        return f" [{self.event_type}] by [{user_identifier}] at {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"

    class Meta:
        ordering = ['-timestamp']