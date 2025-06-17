# gamecore/migrations/0006_clean_long_image_urls.py

from django.db import migrations


# 定义一个函数，用于执行我们的数据清理逻辑
def clean_long_urls(apps, schema_editor):
    # 获取在当前迁移历史版本中的 GameRound 模型
    GameRound = apps.get_model('gamecore', 'GameRound')

    # 遍历数据库中所有的 GameRound 记录
    for round_instance in GameRound.objects.all():
        # 检查 original_image_url 字段是否存在且其长度超过了我们新字段的限制（500）
        if round_instance.original_image_url and len(round_instance.original_image_url) > 500:
            # 如果数据过长，就将这个字段的值设置为空
            # 我们选择设置为空字符串，因为ImageField在数据库中是VARCHAR，不能为空(NULL)
            round_instance.original_image_url = ''
            # 保存修改
            round_instance.save(update_fields=['original_image_url'])


class Migration(migrations.Migration):
    dependencies = [
        # 这个依赖项应指向上一个迁移文件，即 '0005_...'
        ('gamecore', '0005_alter_gameround_original_image_url'),
    ]

    operations = [
        # 在这个迁移中，只执行我们的Python清理函数
        migrations.RunPython(clean_long_urls),
    ]