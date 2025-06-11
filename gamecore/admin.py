from django.contrib import admin
from .models import GameRound  # 从当前应用的 models.py 文件中导入 GameRound 模型

# Register your models here.
admin.site.register(GameRound) # 将 GameRound 模型注册到 Admin 站点