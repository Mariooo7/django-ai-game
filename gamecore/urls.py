from django.urls import path
from . import views  # 从当前目录导入 views.py


urlpatterns = [
    # 当访问应用的根路径时 (比如 /gamecore/ 或者我们之后设置的网站根路径 /)，
    # 调用 views.py 中的 game_view 函数来处理请求。
    # name='game_view' 是给这个 URL 路由起一个名字，方便以后在代码中反向引用它。
    path('', views.game_view, name='game_view'),

    # 创建一个 API 端点，用于处理游戏的开始。
    # 这个端点将处理 POST 请求，并且使用 MultiPartParser 和 FormParser 来解析包含文件的表单数据。
    path('api/start_game/', views.StartGameAPIView.as_view(), name='api_start_game'),

    # 创建一个 API 端点，用于处理游戏回合。
    path('api/play_turn/', views.PlayTurnAPIView.as_view(), name='api_play_turn'),

    # 创建一个 API 端点，用于处理历史记录的获取。
    path('api/history/', views.GameRoundHistoryAPIView.as_view(), name='api_history'),

    # 创建一个 API 端点，用于处理排行榜的获取。
    path('api/leaderboard/', views.LeaderboardAPIView.as_view(), name='api_leaderboard'),

    # 创建一个 API 端点，用于处理数据埋点的记录。
    path('api/log_event/', views.GameEventAPIView.as_view(), name='api_log_event'),

]

