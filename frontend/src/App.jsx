// frontend/src/App.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// 导入组件
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// 导入组件
import Layout from './components/Layout.jsx'; // 游戏布局
import ProtectedRoute from './components/ProtectedRoute.jsx'; // 保护路由

const router = createBrowserRouter([
  {
    element: <Layout />, // 所有页面都共享同一个 Layout 外壳
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/', element: <HomePage /> },
        ],
      },
    ],
  },
]);
// App 组件返回 RouterProvider
function App() {
  return <RouterProvider router={router} />;
}

export default App;