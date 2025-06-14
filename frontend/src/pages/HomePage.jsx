// frontend/src/pages/HomePage.jsx
import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

export default function HomePage() {
  // === 状态管理 ===
  const { user } = useAuth(); // 获取当前登录用户信息
  const [gameState, setGameState] = useState('idle'); // 'idle', 'loading', 'started', 'finished'
  const [gameData, setGameData] = useState(null); // 存储当前游戏回合的数据
  const [error, setError] = useState(null);

  // === Refs ===
  // useRef 用于获取对 DOM 元素的直接引用，这里我们用它来触发隐藏的文件输入框
  const fileInputRef = useRef(null);

  // === 事件处理器 ===
  // 处理“本地上传”按钮的点击
  const handleUploadButtonClick = () => {
    // 编程式地点击隐藏的 input[type=file] 元素
    fileInputRef.current.click();
  };

  // 当用户选择了文件后被调用
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 创建 FormData 对象，这是用于发送文件等二进制数据的标准化方法
      const formData = new FormData();
      formData.append('uploaded_image', file); // 'image' 必须与后端接收的字段名一致
      startGameHandler(formData);
    }
  };

  // 处理“AI 随机生成”按钮的点击
  const handleRandomStart = () => {
    // 对于随机生成，我们发送一个空对象
    startGameHandler({});
  };

  // 统一的游戏开始处理器
  const startGameHandler = async (data) => {
    setGameState('loading');
    setError(null);
    try {
      const response = await api.startGame(data);
      setGameData(response.data); // 保存后端返回的游戏数据（round_id, initial_image_url）
      setGameState('started'); // 更新游戏状态
    } catch (err) {
      console.error("Failed to start game:", err);
      setError("开始游戏失败，请稍后再试。");
      setGameState('idle'); // 出错后返回初始状态
    }
  };

  // === 渲染逻辑 ===
  const renderContent = () => {
    switch (gameState) {
      case 'loading':
        return <div className="text-white text-2xl">正在生成游戏，请稍候...</div>;

      case 'started':
        return (
          <div>
            <h2 className="text-xl text-center mb-4">游戏开始！这是我们的原图：</h2>
            <img src={gameData.original_image_url} alt="Initial game" className="max-w-md max-h-[50vh] rounded-lg shadow-lg" />
            {/* 后续步骤中，我们将在这里添加提示词输入框 */}
          </div>
        );

      case 'idle':
      default:
        return (
          // 根据 Figma 设计稿 (`homepage-pre`) 的布局
          <div className="text-center p-8 bg-[#2B3345] rounded-3xl shadow-xl max-w-4xl">
              <h1 className="text-5xl font-bold text-white mb-2">PICTURE TALK</h1>
              <p className="text-2xl text-gray-300 mb-8">Human vs AI</p>

              {user && <p className="mb-4">欢迎，{user.username}！</p>}

              <div className="bg-[#630101] p-6 rounded-2xl shadow-inner">
                  <p className="mb-6 text-gray-200">
                      让AI随机生成或从本地上传一张图片作为原图，<br/>
                      然后和AI一起编写提示词进行图像生成，和原图越像越好！<br/>
                      去挑战AI吧！ ⚠️ 图像生成可能需要一些时间
                  </p>

                  <div className="flex justify-center gap-4">
                      <button onClick={handleRandomStart} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg">
                          AI 随机生成
                      </button>
                      <button onClick={handleUploadButtonClick} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg">
                          本地上传
                      </button>
                      {/* 隐藏的文件输入框 */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                  </div>
              </div>
              {error && <p className="mt-4 text-red-500">{error}</p>}
          </div>
        );
    }
  };

  return renderContent();
}