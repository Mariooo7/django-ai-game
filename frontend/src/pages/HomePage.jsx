// frontend/src/pages/HomePage.jsx
import { useState, useRef } from 'react';
import * as api from '../services/api';
import ResultCard from '../components/ResultCard';

export default function HomePage() {
  const [gameState, setGameState] = useState('idle');
  const [error, setError] = useState(null);
  const [gameSettings, setGameSettings] = useState({ language: 'zh', char_limit: 20 });
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [playerPrompt, setPlayerPrompt] = useState('');
  const [gameResult, setGameResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setGameSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleUploadButtonClick = () => fileInputRef.current.click();
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('uploaded_image', file);
      startGameHandler(formData);
    }
  };
  const handleRandomStart = () => startGameHandler({});

  const startGameHandler = async (data) => {
    setGameState('loading');
    setError(null);
    try {
      const response = await api.startGame(data);
      setOriginalImageUrl(response.data.original_image_url);
    } catch (err) {
      console.error("Failed to start game:", err);
      setError("获取原图失败，请稍后再试。");
    } finally {
      setGameState('idle');
    }
  };

  const handlePromptSubmit = async (event) => {
    event.preventDefault();
    if (!playerPrompt.trim()) { setError("提示词不能为空！"); return; }
    setGameState('submitting');
    setError(null);
    try {
      const payload = {
        original_image_url: originalImageUrl,
        player_prompt: playerPrompt,
        language: gameSettings.language,
        char_limit: parseInt(gameSettings.char_limit, 10),
      };
      const response = await api.playTurn(payload);
      setGameResult(response.data);
      setGameState('finished');
    } catch (err) {
      console.error("An error occurred during playTurn:", err);
      setError("提交失败，请检查网络或刷新页面重试。");
      setGameState('idle');
    }
  };

  const winnerColorClass =
      gameResult?.winner === 'player' ? 'text-text-success' :
      gameResult?.winner === 'ai' ? 'text-text-lose' :
      'text-text-draw'

  const resetGame = () => {
    setGameState('idle');
    setOriginalImageUrl(null);
    setPlayerPrompt('');
    setGameResult(null);
    setError(null);
  };

  // --- 主游戏视图 ---
  return (
    <div className="w-full flex flex-col items-center gap-2 animate-fade-in">
        <div className="text-center">
            <h1 className="text-5xl font-heading text-text-primary">PICTURE TALK</h1>
            <p className="text-3xl text-text-secondary font-heading">Human vs AI</p>
        </div>

        <div className="w-4/5 max-w-8xl grid grid-cols-1 md:grid-cols-7 gap-10 mt-1 mx-auto">
            {/* === 左侧：拆分后的控制面板 === */}
            <div className="md:col-span-2 flex flex-col gap-6 self-start">
                {/* 卡片1: 游戏设置 */}
                <div className="bg-surface p-6 rounded-2xl shadow-card">
                    <h3 className="text-xl font-bold text-text-primary mb-3">游戏设置</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="language-select" className="block text-sm font-medium text-text-secondary">提示词语言</label>
                            <select id="language-select" name="language" value={gameSettings.language} onChange={handleSettingsChange} className="mt-1 block w-full bg-secondary rounded-lg p-2 border border-border focus:ring-2 focus:ring-primary">
                                <option value="zh">中文</option><option value="en">英文</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="char-limit-input" className="block text-sm font-medium text-text-secondary">最大字符数</label>
                            <input id="char-limit-input" type="number" name="char_limit" value={gameSettings.char_limit} onChange={handleSettingsChange}
                                className="mt-1 block w-full bg-secondary rounded-lg p-2 border border-border focus:ring-2 focus:ring-primary"
                                min="1" max="200" />
                        </div>
                    </div>
                </div>

                {/* 卡片2: 获取原图 */}
                <div className="bg-surface p-6 rounded-2xl shadow-card">
                    <h3 className="text-xl font-bold text-white mb-3">第一步：生成原图</h3>
                    <div className="space-y-4 mb-3">
                        <button onClick={handleRandomStart} disabled={gameState !== 'idle'} className="w-full bg-primary-secondary hover:bg-primary-hoverSecondary text-text-primary font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">AI 随机生成</button>
                        <button onClick={handleUploadButtonClick} disabled={gameState !== 'idle'} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">本地上传</button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>

                    {/* 核心修改：原图展示区内嵌在此卡片中 */}
                    {originalImageUrl && (
                      <div className="mt-4 animate-fade-in">
                          <h4 className="text-lg font-semibold text-text-secondary mb-2">当前原图:</h4>
                          {/* 核心修改：固定高度的容器 + object-contain */}
                          <div className="w-full h-48 bg-black rounded-lg flex items-center justify-center">
                              <img src={originalImageUrl} alt="Original" className="max-w-full max-h-full object-contain" />
                          </div>
                      </div>
                    )}
                </div>
            </div>

          {/* === 右侧卡片2：主交互区 (提示词输入 -> 结果展示) === */}
          <div className="md:col-span-5 bg-surface p-6 rounded-2xl shadow-card flex flex-col items-center justify-center">
            {/* 核心修改：根据 gameState 在同一区域内渲染不同内容 */}
            {gameState === 'submitting' ? (
              <div className="text-center text-text-primary animate-subtle-pulse">
                <p className="text-2xl">正在与 AI 对战...</p>
                <p className="text-text-secondary mt-2">这可能需要一些时间，请耐心等待</p>
              </div>
            ) : gameState === 'finished' && gameResult ? (
                <div className="w-full max-w-6xl flex flex-col items-center animate-fade-in">
                    <h2 className={`text-5xl font-bold mb-2 font-display animate-pulse ${winnerColorClass}`}>
                        {gameResult.winner === 'player' && '恭喜你，挑战成功！'}
                        {gameResult.winner === 'ai' && '很遗憾，AI 更胜一筹！'}
                        {gameResult.winner === 'draw' && '平分秋色，再接再厉！'}
                    </h2>
                    <p className="text-xl text-text-secondary mb-6">这是本轮的对战结果</p>
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ResultCard title="你的提示词生成的图像" generatedImageUrl={gameResult.player_generated_image_url} prompt={gameResult.player_prompt} score={gameResult.player_similarity_score} isWinner={gameResult.winner === 'player'} />
                        <ResultCard title="AI的提示词生成的图像" generatedImageUrl={gameResult.ai_generated_image_url} prompt={gameResult.ai_generated_prompt_from_image} score={gameResult.ai_similarity_score} isWinner={gameResult.winner === 'ai'} />
                    </div>
                    <button onClick={resetGame} className="mt-6 bg-primary hover:bg-primary-hover text-white font-bold py-4 px-8 rounded-lg text-xl transition-transform hover:scale-105">再玩一次</button>
                </div>
            ) : (
              <div className="w-full h-full flex flex-col">
                <h3 className="text-xl font-semibold text-text-primary text-center mb-3">{originalImageUrl ? '第二步：编写提示词' : '等待开始'}</h3>
                <form onSubmit={handlePromptSubmit} className="flex-grow flex flex-col">
                  <textarea
                    value={playerPrompt}
                    onChange={(e) => setPlayerPrompt(e.target.value)}
                    placeholder={originalImageUrl ? "在这里输入你的提示词..." : "请先在左侧生成一张原图"}
                    className="w-full h-full min-h-[200px] bg-secondary border-border rounded-md p-3 text-text-primary resize-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    maxLength={gameSettings.char_limit}
                    disabled={!originalImageUrl || gameState !== 'idle'}
                  />
                  <div className="text-right text-sm text-text-muted mt-1">{playerPrompt.length} / {gameSettings.char_limit}</div>
                  {error && <p className="my-2 text-sm text-destructive text-center">{error}</p>}
                  <button type="submit" disabled={!originalImageUrl || gameState !== 'idle'}
                      className="mt-4 w-full bg-success hover:bg-success-hover text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg">
                      {gameState === 'submitting' ? '正在提交...' : '生成图像，挑战 AI！'}
                  </button>
                </form>
              </div>
            )}
          </div>
      </div>
  </div>
);
}