// frontend/src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';

/**
 * RegisterPage Component
 * @description 用户注册页面，与 LoginPage 共享布局和视觉风格，确保体验一致性。
 */
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.password2) {
      setError('两次输入的密码不一致。');
      return;
    }

    setIsLoading(true);
    try {
      const { password2, ...registerData } = formData;
      await register(registerData);
      navigate('/');
    } catch (err) {
      console.error('Registration failed:', err);
      let displayMessage = "注册失败，请稍后重试。";
      if (err.response?.data && typeof err.response.data === 'object') {
        displayMessage = Object.entries(err.response.data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`).join(' \n');
      }
      setError(displayMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl flex items-center justify-center animate-fade-in">
      {/* 左侧：品牌标题区 */}
      <div className="hidden md:flex flex-col items-center justify-center w-1/2 p-10">
        <h1 className="text-7xl font-heading text-text-primary">PICTURE TALK</h1>
        <p className="text-3xl text-text-secondary mt-4 font-heading">Human vs AI</p>
      </div>

      {/* 右侧：注册卡片区 */}
      <div className="w-full md:w-1/2 flex justify-center p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-surface rounded-2xl shadow-card">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-display text-text-primary">开启你的游戏之旅</h2>
            <p className="mt-2 text-text-muted">创建一个新账户，挑战 AI </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="用户名" name="username" value={formData.username} onChange={handleChange} required />
            <Input label="邮箱地址" type="email" name="email" value={formData.email} onChange={handleChange} required />
            <Input label="设置密码" type="password" name="password" value={formData.password} onChange={handleChange} required />
            <Input label="确认密码" type="password" name="password2" value={formData.password2} onChange={handleChange} required />

            {error && <p className="text-sm text-destructive text-center whitespace-pre-line">{error}</p>}

            <div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 mt-2 rounded-lg shadow-sm text-lg font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-500 disabled:cursor-not-allowed">
                {isLoading ? '正在创建...' : '立即加入'}
              </button>
            </div>

            <p className="text-sm text-center text-text-muted">
              已经拥有账户？{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">返回登录</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}