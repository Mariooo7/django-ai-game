// frontend/src/components/GameLayout.jsx
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // 导入 useAuth 钩子

export default function GameLayout() {
  // 使用 useAuth 钩子来获取 isAuthenticated 和 logout 方法
  const { isAuthenticated, logout } = useAuth();
  return (
    <div className="bg-[#061C4C] text-[#D2CAD9] min-h-screen flex flex-col font-sans">
        {isAuthenticated && (
            <button
                onClick={logout}
                className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm"
            >
                登出
            </button>
        )}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        {/* Outlet 是一个占位符，所有匹配的子路由组件将在这里被渲染 */}
        <Outlet />
      </main>
      <footer className="w-full text-center p-4 text-xs text-gray-400">
        github:xxxxxxxx.git &nbsp;&nbsp;&nbsp; contact us:xxxxxxxxxxxxx.gmail.com &nbsp;&nbsp;&nbsp; license:Apache.license
      </footer>
    </div>
  );
}