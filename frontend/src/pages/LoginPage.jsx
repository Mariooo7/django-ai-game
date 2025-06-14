// frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input'; // 导入我们新建的 Input 组件

export default function LoginPage() {
  // === 状态管理 (State Management) ===
  // 使用 useState 管理表单数据，所有输入框的值都与这个 state 绑定
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  // 管理异步请求的加载状态，用于禁用按钮、显示加载提示等
  const [isLoading, setIsLoading] = useState(false);
  // 管理登录过程中可能出现的错误信息
  const [error, setError] = useState(null);

  // === 钩子函数 (Hooks) ===
  // 从我们的 AuthContext 中获取 login 函数
  const { login } = useAuth();
  // 从 react-router-dom 中获取用于导航的函数
  const navigate = useNavigate();

  // === 事件处理器 (Event Handlers) ===
  // 处理所有输入框的变化，这是一个通用处理器
  const handleChange = (e) => {
    // e.target 是触发事件的 DOM 元素 (即 input)
    // [e.target.name] 是一个计算属性名，它会使用 input 的 name 属性 ('username'或'password') 作为 state 对象的键
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault(); // 阻止表单的默认提交行为（即刷新页面）

    // 开始提交，设置加载状态，清空旧的错误信息
    setIsLoading(true);
    setError(null);

    try {
      // 调用从 AuthContext 中获取的 login 方法，并传入表单数据
      await login(formData);
      // 如果 await 成功执行（没有抛出错误），说明登录成功
      // 导航到游戏主页
      navigate('/');
    } catch (err) {
      // 如果 await 抛出错误，说明登录失败
      console.error('Login failed:', err); // 在控制台打印详细错误，便于调试
      setError('登录失败，请检查您的用户名和密码。'); // 设置一个对用户友好的错误信息
    } finally {
      // 无论成功或失败，最后都将加载状态设置为 false
      setIsLoading(false);
    }
  };

  // === 渲染逻辑 (Render Logic) ===
  return (
    // 根据设计稿，表单在一个居中的卡片中
    <div className="w-full max-w-md p-8 space-y-6 bg-[#2B3345] rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center text-white">
        登录
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="用户名"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="请输入您的用户名"
          required
        />
        <Input
          label="密码"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="请输入您的密码"
          required
        />

        {/* 错误信息展示区 */}
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <div>
          <button
            type="submit"
            disabled={isLoading} // 当 isLoading 为 true 时，禁用按钮
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? '正在登录...' : '登录'}
          </button>
        </div>

        <p className="text-sm text-center text-gray-400">
          还没有账户？{' '}
          <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300">
            立即注册
          </Link>
        </p>
      </form>
    </div>
  );
}