import axios from 'axios';

// 1. 创建 Axios 实例
// 这样做的好处是可以为不同的 API 创建不同的实例，方便管理
// 例如，如果未来有另一个完全不同的 API 服务，可以再创建一个 apiClient2
const apiClient = axios.create({
  // 从环境变量中读取后端 API 的基础 URL
  // 在开发环境中，我们可以在 .env.local 文件中设置 VITE_API_BASE_URL = http://127.0.0.1:8000
  // 暂时我们先硬编码，后续可以优化
  // 使用 import.meta.env 来访问 Vite 注入的环境变量
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  timeout: 60000, // 请求超时时间 60 秒
  headers: {
    // 'Content-Type': 'application/json', // 智能设置 Content-Type 头
  },
});

// 2. 配置请求拦截器 (Request Interceptor)
// 这是最强大的功能之一：在每个请求被发送出去之前，我们都可以在这里对它进行一些操作
apiClient.interceptors.request.use(
  (config) => {
    // 从 localStorage 中获取 token
    const token = localStorage.getItem('authToken');

    // 如果 token 存在，则在每个请求的头中添加 Authorization 字段
    if (token) {
      // 注意 Django REST Framework + dj-rest-auth 默认期望的格式是 'Token <token>' 或 'Bearer <token>'
      // 我们后端配置的是 dj-rest-auth, 它使用 'Token'
      config.headers.Authorization = `Token ${token}`;
    }

    return config; // 返回修改后的 config 对象
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 3. 配置响应拦截器 (Response Interceptor) - 可选，但建议配置
// 在收到响应后，可以先在这里统一处理，再返回给调用方
apiClient.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么，例如直接返回 response.data
    return response;
  },
  (error) => {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 在这里可以做全局的错误处理，例如对 401 (未授权) 错误进行统一处理，直接跳转到登录页
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized! Redirecting to login...");
      // window.location.href = '/login'; // 后续实现路由后可以放开
    }
    return Promise.reject(error);
  }
);

// 4. 导出封装好的 API 请求函数
// 我们为后端的每一个 API endpoint 创建一个对应的函数

// === 认证相关 ===
export const login = (credentials) => apiClient.post('/auth/login/', credentials);
export const register = (userData) => apiClient.post('/auth/registration/', userData);
export const logout = () => apiClient.post('/auth/logout/');
export const getUser = () => apiClient.get('/auth/user/');

// === 游戏核心 ===
export const startGame = (data) => {
    return apiClient.post('/start_game/', data);
};
export const playTurn = (promptData) => apiClient.post('/play_turn/', promptData);

// === 数据查询 ===
export const getHistory = () => apiClient.get('/history/');
export const getLeaderboard = () => apiClient.get('/leaderboard/');

// === 数据埋点 ===
export const logEvent = (eventData) => apiClient.post('/log_event/', eventData);

// 默认导出我们创建的 apiClient 实例，以便在其他地方可能需要更灵活的调用
export default apiClient;