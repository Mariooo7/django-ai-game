// frontend/src/contexts/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import apiClient, * as api from '../services/api'; // 导入 apiClient 实例和所有方法

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken')); // 使用函数式初始值，确保只读一次

  useEffect(() => {
    // 这个 effect 现在只负责在应用加载时，根据已有的 token 获取用户信息
    if (token && !user) {
      // 在刷新页面时，需要手动将 token 设置到 axios 实例的默认头中
      apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
      api.getUser()
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          // 如果 token 无效，清理所有状态
          setUser(null);
          setToken(null);
          localStorage.removeItem('authToken');
          delete apiClient.defaults.headers.common['Authorization'];
        });
    }
  }, [token, user]); // 依赖项保持不变

  const login = async (credentials) => {
    const response = await api.login(credentials);
    const newToken = response.data.key;

    // 核心修正：拿到 token 后，立即同步更新所有需要它的地方
    localStorage.setItem('authToken', newToken);
    apiClient.defaults.headers.common['Authorization'] = `Token ${newToken}`;

    // 现在可以安全地调用下一个需要认证的请求
    const userResponse = await api.getUser();
    setUser(userResponse.data);
    setToken(newToken); // 最后更新 react state，触发 UI 变化
  };

  const register = async (userData) => {
    const response = await api.register(userData);
    const newToken = response.data.key;

    // 核心修正：与 login 逻辑完全相同
    localStorage.setItem('authToken', newToken);
    apiClient.defaults.headers.common['Authorization'] = `Token ${newToken}`;

    const userResponse = await api.getUser();
    setUser(userResponse.data);
    setToken(newToken);
  };

  const logout = async () => {
    try {
      // 即使后端登出失败，前端也必须清理状态，所以用 finally
      await api.logout();
    } finally {
      // 核心修正：登出时，清理所有地方的 token
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      delete apiClient.defaults.headers.common['Authorization'];
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};