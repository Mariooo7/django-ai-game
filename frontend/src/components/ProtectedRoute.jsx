// frontend/src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  // 关键逻辑：检查来自 AuthContext 的 isAuthenticated 状态
  if (!isAuthenticated) {
    // 如果用户未认证，渲染 Navigate 组件，将其重定向到登录页
    return <Navigate to="/login" replace />;
  }

  // 如果用户已认证，则渲染 Outlet 组件，它代表了所有被包裹的子路由
  return <Outlet />;
}