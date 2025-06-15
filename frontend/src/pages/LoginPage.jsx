// frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';

/**
 * LoginPage Component
 * @description 应用的用户登录页面。
 * - 内部实现了“左侧品牌，右侧表单”的响应式布局。
 * - 全面应用了项目的设计系统（颜色、字体、动效）。
 */
export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      setError('登录失败，请检查您的凭证。');
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl flex items-center justify-center animate-fade-in p-4">
      {/* === 左侧：品牌标题区 === */}
      {/* 在中等屏幕(md)及以上显示，提供视觉引导 */}
      <div className="hidden md:flex flex-col items-center justify-center w-1/2 p-10">
        <h1 className="text-7xl font-heading text-text-primary">
          PICTURE TALK
        </h1>
        <p className="text-3xl text-text-secondary mt-4 font-heading">
          Human vs AI
        </p>
      </div>

      {/* === 右侧：登录卡片区 === */}
      <div className="w-full md:w-1/2 flex justify-center">
        <div className="w-full max-w-sm p-8 space-y-6 bg-surface rounded-2xl shadow-card">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text-primary">
              欢迎回来，挑战者！
            </h2>
            <p className="mt-2 text-text-secondary">
              编写提示词挑战 AI ！
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="用户名或邮箱"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <Input
              label="密码"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-lg font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '正在验证...' : '进入对战'}
              </button>
            </div>

            <p className="text-sm text-center text-text-muted">
              还没有账户？{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                立即加入
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}