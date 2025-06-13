from django.contrib import admin
from .models import GameRound, GameEvent # 从当前应用的 models.py 文件中导入 GameRound 模型

# 使用 @admin.register(GameRound) 装饰器来注册模型，这是更现代的写法
@admin.register(GameRound)
class GameRoundAdmin(admin.ModelAdmin):
    """
    自定义 GameRound 模型在 Admin 后台的显示和行为。
    """
    # list_display 控制在列表页上显示哪些字段
    list_display = (
        'id',
        'user',  # 这里会自动显示 user 对象的 __str__ 方法的返回值，即用户名
        'winner',
        'player_similarity_score',
        'ai_similarity_score',
        'timestamp'
    )

    # list_filter 在页面右侧添加一个过滤器，方便按用户或胜负结果筛选
    list_filter = ('winner', 'user')

    # search_fields 在页面顶部添加一个搜索框，可以按用户名或提示词内容搜索
    search_fields = ('user__username', 'player_prompt', 'ai_generated_prompt_from_image')

    # ordering 指定在 Admin 中的默认排序方式
    ordering = ('-timestamp',)

# 注册 GameEvent 模型，同样使用 @admin.register 装饰器
@admin.register(GameEvent)
class GameEventAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'event_type', 'user', 'session_id')
    list_filter = ('event_type', 'user')