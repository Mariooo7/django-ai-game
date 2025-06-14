// frontend/src/App.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// 导入组件
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HistoryPage from './pages/HistoryPage';
import LeaderboardPage from './pages/LeaderboardPage';

// 导入组件
import GameLayout from './components/GameLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// 1. 定义路由配置数组
const router = createBrowserRouter([
  {
    // 顶层路由，所有页面都将应用 GameLayout
    element: <GameLayout />,
    // errorElement: <NotFoundPage />, // 未来可添加的错误页
    children: [
      // === 公开路由 ===
      // 登录和注册页面是公开的，任何人都可以访问
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      // === 受保护的路由组 ===
      // 我们创建一个没有路径的父路由，用 ProtectedRoute 作为其元素
      // 这样，它下面的所有子路由都会受到保护
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/',
            element: <HomePage />,
          },
          {
            path: '/history',
            element: <HistoryPage />,
          },
          {
            path: '/leaderboard',
            element: <LeaderboardPage />,
          },
          // 未来所有需要登录才能访问的页面，都应放在这里
        ],
      },
    ],
  },
]);


// 2. App 组件返回 RouterProvider
function App() {
  return <RouterProvider router={router} />;
}

export default App;