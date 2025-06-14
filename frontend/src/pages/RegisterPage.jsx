// frontend/src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';

export default function RegisterPage() {
  // 1. 扩展 state 以包含所有注册所需字段
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '', // dj-rest-auth 需要这个字段进行密码确认
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth(); // 从 Context 中获取 register 方法
  const navigate = useNavigate();

  // 2. handleChange 处理器保持不变，它可以优雅地处理所有输入框
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 3. handleSubmit 处理器中增加新逻辑
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // --- 新增逻辑：客户端校验 ---
    // 在发起 API 请求前，先在前端检查两次密码是否一致
    if (formData.password1 !== formData.password2) {
      setError('两次输入的密码不一致，请重新检查。');
      return; // 校验失败，提前退出，不执行后续操作
    }
    // --- 新增逻辑结束 ---

    setIsLoading(true);

    try {
      // 调用从 AuthContext 中获取的 register 方法
      await register(formData);
      // 注册成功后，同样导航到游戏主页
      navigate('/');
    } catch (err) {
      console.error('Registration failed:', err.response?.data);

      // 更智能的错误处理：尝试从后端响应中提取错误信息
      const errorData = err.response?.data;
      if (errorData) {
        // 将后端返回的多个错误信息拼接成一个字符串
        const errorMessages = Object.entries(errorData).map(([key, value]) => {
          return `${key}: ${Array.isArray(value) ? value.join(', ') : value}`;
        }).join(' ');
        setError(errorMessages || '注册失败，请检查您输入的信息。');
      } else {
        setError('注册失败，发生未知错误。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-[#2B3345] rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center text-white">
        创建新账户
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4"> {/* 减小间距以容纳更多字段 */}
        <Input
          label="用户名"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="创建您的用户名"
          required
        />
        <Input
          label="邮箱"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="请输入您的邮箱地址"
          required
        />
        <Input
          label="密码"
          type="password"
          name="password1"
          value={formData.password1}
          onChange={handleChange}
          placeholder="创建您的密码"
          required
        />
        <Input
          label="确认密码"
          type="password"
          name="password2"
          value={formData.password2}
          onChange={handleChange}
          placeholder="请再次输入您的密码"
          required
        />

        {error && <p className="text-sm text-red-500 text-center whitespace-pre-line">{error}</p>}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? '正在创建...' : '注册'}
          </button>
        </div>

        <p className="text-sm text-center text-gray-400">
          已经有账户了？{' '}
          <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
            前往登录
          </Link>
        </p>
      </form>
    </div>
  );
}