import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import ResultCard from '../components/ResultCard';

/**
 * HomePage Component
 * * 这是游戏的核心页面，承载了从开始游戏、进行游戏到查看结果的完整流程。
 * 它采用统一视图布局，通过内部状态来控制不同元素的可见性和可交互性。
 */
export default function HomePage() {
  // --- 状态管理 (State Management) ---

  const { user } = useAuth(); // 从全局 Context 获取当前登录的用户信息

  // 'idle': 游戏开始前 | 'loading': 获取原图中 | 'submitting': 提交提示词等待结果 | 'finished': 显示结果
  const [gameState, setGameState] = useState('idle');

  // 存储后端返回的各类错误信息，用于在 UI 上展示
  const [error, setError] = useState(null);

  // 存储用户自定义的游戏设置
  const [gameSettings, setGameSettings] = useState({
    language: 'zh',
    char_limit: 20,
  });

  // 存储由后端返回的、用于本轮对战的原图 URL
  const [originalImageUrl, setOriginalImageUrl] = useState(null);

  // 受控组件：存储用户在文本框中输入的提示词
  const [playerPrompt, setPlayerPrompt] = useState('');

  // 存储游戏结束后，由后端返回的完整对战结果对象
  const [gameResult, setGameResult] = useState(null);

  // 用于以编程方式触发隐藏的文件上传输入框
  const fileInputRef = useRef(null);

  // --- 事件处理器 (Event Handlers) ---

  // 处理游戏设置（语言、字符数限制）的变更
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setGameSettings(prev => ({ ...prev, [name]: value }));
  };

  // “本地上传”按钮的点击事件
  const handleUploadButtonClick = () => {
    // 触发隐藏的 file input 的点击事件
    fileInputRef.current.click();
  };

  // 文件输入框选择文件后的事件
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      // 'uploaded_image' 是后端 serializer 中定义的字段名
      formData.append('uploaded_image', file);
      startGameHandler(formData);
    }
  };

  // “AI随机生成”按钮的点击事件
  const handleRandomStart = () => {
    // 传递空对象，后端会据此判断并执行随机生成逻辑
    startGameHandler({});
  };

  // 统一的开始游戏处理器
  const startGameHandler = async (data) => {
    setGameState('loading');
    setError(null);
    try {
      const response = await api.startGame(data);
      setOriginalImageUrl(response.data.original_image_url);
      setGameState('idle'); // 获取图片成功后，返回 idle 状态，此时因 originalImageUrl 已有值，UI 会更新
    } catch (err) {
      console.error("Failed to start game:", err);
      setError("获取原图失败，请稍后再试。");
      setGameState('idle');
    }
  };

  // 提交提示词进行对战的处理器
  const handlePromptSubmit = async (event) => {
    event.preventDefault(); // 阻止 form 标签的默认页面刷新行为
    if (!playerPrompt.trim()) {
      setError("提示词不能为空！");
      return;
    }

    setGameState('submitting');
    setError(null);

    try {
      const payload = {
        original_image_url: originalImageUrl,
        player_prompt: playerPrompt,
        language: gameSettings.language,
        char_limit: parseInt(gameSettings.char_limit, 10), // 后端需要整数类型
      };

      const response = await api.playTurn(payload);
      setGameResult(response.data);
      setGameState('finished');
    } catch (err) {
      console.error("An error occurred during playTurn:", err);
      // 使用健壮的错误处理逻辑，解析并显示错误信息
      let displayMessage = "提交失败，发生未知错误。";
      if (err.response) {
        const errorData = err.response.data;
        if (errorData && typeof errorData === 'object') {
          displayMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' \n');
        } else if (typeof errorData === 'string') {
          displayMessage = errorData;
        }
      } else if (err.request) {
        displayMessage = "提交失败：未能收到服务器响应，请检查网络和后端服务器状态。";
      } else {
        displayMessage = `提交失败：发生了一个技术问题 (${err.message})。`;
      }
      setError(displayMessage);
      setGameState('idle'); // 提交失败后，返回 idle 状态让用户可以重试
    }
  };

  // "再玩一次" 按钮的处理器，重置所有游戏相关状态
  const resetGame = () => {
    setGameState('idle');
    setOriginalImageUrl(null);
    setPlayerPrompt('');
    setGameResult(null);
    setError(null);
  };

  // --- 渲染逻辑 (Render Logic) ---

  // 游戏结束状态，渲染独立的结果视图
  if (gameState === 'finished') {
    return (
        <div className="w-full max-w-6xl flex flex-col items-center animate-fade-in">
            <h2 className="text-5xl font-bold mb-2 text-yellow-400 animate-pulse">
                {gameResult.winner === 'player' && '恭喜你，挑战成功！'}
                {gameResult.winner === 'ai' && '很遗憾，AI 更胜一筹！'}
                {gameResult.winner === 'draw' && '平分秋色，再接再厉！'}
            </h2>
            <p className="text-xl text-gray-300 mb-8">这是本轮的对战结果</p>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                <ResultCard title="你的创作" generatedImageUrl={gameResult.player_generated_image_url} prompt={gameResult.player_prompt} score={gameResult.player_similarity_score} isWinner={gameResult.winner === 'player'} />
                <ResultCard title="AI 的创作" generatedImageUrl={gameResult.ai_generated_image_url} prompt={gameResult.ai_generated_prompt_from_image} score={gameResult.ai_similarity_score} isWinner={gameResult.winner === 'ai'} />
            </div>
            <button onClick={resetGame} className="mt-12 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-lg text-xl transition-transform hover:scale-105">
              再玩一次
            </button>
        </div>
    );
  }

  // 其他所有状态 (idle, loading, submitting) 都渲染统一的主游戏界面
  return (
    <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8 p-4 md:p-8">

      {/* ==================== 左侧：控制与设置面板 ==================== */}
      <div className="w-full md:w-1/3 bg-[#2B3345] p-6 rounded-2xl shadow-xl flex flex-col gap-6 animate-fade-in self-start">
        {/* 用户信息显示区 */}
        {user && (
          <div className="pb-4 border-b border-gray-600">
            <h2 className="text-2xl font-bold text-white">欢迎回来, <span className="text-blue-400">{user.username}</span>!</h2>
          </div>
        )}

        {/* 游戏设置区 */}
        <div>
            <h3 className="text-xl font-semibold text-white mb-4">游戏设置</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="language-select" className="block text-sm font-medium text-gray-300">提示词语言</label>
                    <select id="language-select" name="language" value={gameSettings.language} onChange={handleSettingsChange} className="mt-1 block w-full bg-gray-700 rounded p-2 border border-gray-600">
                        <option value="zh">中文</option>
                        <option value="en">英文</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="char-limit-input" className="block text-sm font-medium text-gray-300">最大字符数</label>
                    <input id="char-limit-input" type="number" name="char_limit" value={gameSettings.char_limit} onChange={handleSettingsChange}
                        className="mt-1 block w-full bg-gray-700 rounded p-2 border border-gray-600"
                        min="1" max="200"
                    />
                </div>
            </div>
        </div>

        {/* 开始游戏控制区 */}
        <div>
            <h3 className="text-xl font-semibold text-white mb-4">第一步：生成原图</h3>
            <div className="space-y-4">
                <button onClick={handleRandomStart} disabled={gameState !== 'idle'} className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">AI 随机生成</button>
                <button onClick={handleUploadButtonClick} disabled={gameState !== 'idle'} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">本地上传</button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
        </div>
      </div>

      {/* ==================== 右侧：游戏主操作区 ==================== */}
      <div className="w-full md:w-2/3 bg-[#2B3345] p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center animate-fade-in min-h-[60vh]">
        {/* 根据不同状态显示不同内容 */}
        {gameState === 'loading' ? (
            <p className="text-white text-2xl animate-pulse">正在准备图片...</p>
        ) : originalImageUrl ? (
            // 已有原图，显示图片和提示词输入框
            <div className="w-full h-full flex flex-col">
                <div className="flex-shrink-0 text-center mb-4">
                    <h3 className="text-xl font-semibold text-white">第二步：参考下图编写提示词</h3>
                    <img src={originalImageUrl} alt="Original game to be described" className="mt-2 inline-block max-w-full max-h-64 rounded-lg shadow-lg" />
                </div>
                <form onSubmit={handlePromptSubmit} className="flex-grow flex flex-col">
                    <div className="flex-grow">
                        <textarea
                            value={playerPrompt}
                            onChange={(e) => setPlayerPrompt(e.target.value)}
                            placeholder="在这里输入你的提示词..."
                            className="w-full h-full min-h-[100px] bg-gray-700 border border-gray-600 rounded-md p-3 text-white resize-none focus:ring-2 focus:ring-blue-500"
                            maxLength={gameSettings.char_limit}
                            disabled={gameState === 'submitting'}
                        />
                    </div>
                    <div className="text-right text-sm text-gray-400 mt-1">{playerPrompt.length} / {gameSettings.char_limit}</div>
                    {error && <p className="my-2 text-sm text-red-500 text-center whitespace-pre-line">{error}</p>}
                    <button type="submit" disabled={!originalImageUrl || gameState === 'submitting'}
                        className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg">
                        {gameState === 'submitting' ? '正在与 AI 对战...' : '生成图像，挑战 AI！'}
                    </button>
                </form>
            </div>
        ) : (
            // 初始状态，引导用户开始
            <div className="text-center text-gray-400">
                <p className="text-2xl">请先在左侧选择一张原图</p>
                <p className="mt-2">可通过“AI随机生成”或“本地上传”</p>
            </div>
        )}
      </div>
    </div>
  );
}