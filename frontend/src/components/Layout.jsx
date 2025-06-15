// frontend/src/components/Layout.jsx
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Layout Component
 * @description 应用的全局布局。采用标准的 Flexbox 列布局，确保页头和页脚固定，主内容区自适应填充，解决页面过高问题。
 */
export default function Layout() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    // 主容器：设置为 Flexbox 列布局，并确保其最小高度为整个屏幕
    <div className="bg-background text-text-secondary h-screen flex flex-col font-sans">

      {/* 页头: 作为正常的 Flex-item，不再绝对定位。
          flex-shrink-0 防止其在内容过多时自身被压缩。
          样式已微调，使其更紧凑。 */}
      <header className="w-full p-3 flex justify-between items-center border-b border-border/50 flex-shrink-0">
        <div className="text-md font-bold text-text-primary">
          {user ? ` ${user.username} playing` : '欢迎来到 Picture Talk'}
        </div>

        {isAuthenticated && (
          <nav className="flex items-center gap-4">
            <Link to="/history" title="历史记录" className="text-sm text-text-secondary hover:text-primary transition-colors">
              战绩
            </Link>
            <Link to="/leaderboard" title="排行榜" className="text-sm text-text-secondary hover:text-primary transition-colors">
              排行
            </Link>
            <button
              onClick={logout}
              title="登出"
              className="text-sm bg-destructive hover:brightness-125 text-white font-bold py-1 px-3 rounded-md transition-colors"
            >
              登出
            </button>
          </nav>
        )}
      </header>

      {/* 主内容区:
          - 使用 flex-grow 占据所有剩余的垂直空间。
          - 移除了之前巨大的 pt-20，padding 大幅减小，为内容区释放了大量空间。
          - overflow-y-auto 允许在内容确实超出时，仅在主区域内滚动，而不是整个页面滚动。*/}
      <main className="flex-grow flex flex-col items-center justify-center pt-4 p-4 md:p-8 overflow-y-auto">
        {/* 子路由对应的页面组件将在这里被渲染 */}
        <Outlet />
      </main>

      {/* 全局页脚 */}
      <footer className="w-full text-center p-2 px-8 text-xs text-text-muted border-t border-border/50 flex-shrink-0 flex justify-center gap-28">
        <a href="https://github.com/Mariooo7/django-ai-game" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
          github:https://github.com/Mariooo7/django-ai-game
        </a>
        <a href="mailto:maor7@mail2.sysu.edu.cn" className="hover:text-primary transition-colors">
          contact us:maor7@mail2.sysu.edu.cn
        </a>
        <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
          license:Apache License 2.0
        </a>
      </footer>
    </div>
  );
}