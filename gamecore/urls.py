from django.urls import path
from . import views  # 从当前目录导入 views.py

urlpatterns = [
    # 当访问应用的根路径时 (比如 /gamecore/ 或者我们之后设置的网站根路径 /)，
    # 调用 views.py 中的 game_view 函数来处理请求。
    # name='game_view' 是给这个 URL 路由起一个名字，方便以后在代码中反向引用它。
    path('', views.game_view, name='game_view'),
]