"""
URL configuration for game_django project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),  # <--- 将 /admin/ 路径指向 Django admin 应用
    path('', include('gamecore.urls')),  # <--- 将 / 路径指向 gamecore 应用

    # 用户认证相关的 URL
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    # 生成登录/登出的 URL
    path('accounts/', include('allauth.urls')),
    path('api-auth/', include('rest_framework.urls')),

    # API 文档相关的 URL
    # OpenAPI schema an Doku
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),  # 暴露 schema 文件
    # Optional UI:
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # 暴露 Swagger UI 界面
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),  # 暴露 Redoc 界面

]

# 在 DEBUG 为 True 时添加 media 文件的 URL
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)