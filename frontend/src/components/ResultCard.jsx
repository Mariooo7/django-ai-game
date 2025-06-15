// frontend/src/components/ResultCard.jsx

/**
 * ResultCard Component
 * @description 在游戏结束后，展示玩家或 AI 单方结果的卡片。
 * @param {string} title - 卡片标题 (例如 "你的创作")
 * @param {string} generatedImageUrl - 生成的图片 URL
 * @param {string} prompt - 使用的提示词
 * @param {number} score - 相似度分数
 * @param {boolean} isWinner - 是否为赢家，用于高亮显示
 */
export default function ResultCard({ title, generatedImageUrl, prompt, score, isWinner }) {
  // 根据是否为赢家，动态决定边框和标题的颜色
  const winnerClass = isWinner
    ? 'border-primary shadow-primary/30'
    : 'border-border';


  return (
    <div className={`flex flex-col bg-surface p-4 rounded-2xl shadow-card border-2 ${winnerClass} transition-all duration-500 animate-slide-up`}>
      <h3 className={`text-2xl font-sans font-bold mb-4 text-center ${isWinner ? 'text-primary' : 'text-text-primary'}`}>
        {title}
      </h3>

      {generatedImageUrl ? (
        <img
          src={generatedImageUrl}
          alt={`${title} generated`}
          className="w-full h-64 object-contain rounded-lg mb-4 bg-secondary"
        />
      ) : (
        <div className="w-full h-64 flex items-center justify-center bg-secondary rounded-lg mb-4 text-text-muted">
          图片生成失败
        </div>
      )}

      <div className="w-full mb-4">
        <p className="text-sm text-text-muted mb-1">使用的提示词:</p>
        <p className="text-base text-text-primary bg-secondary p-2 rounded h-20 overflow-y-auto ">
          {prompt || "未提供"}
        </p>
      </div>

      <div className="mt-auto text-center">
        <p className="text-lg text-text-muted">与原图相似度</p>
        {/* toFixed(2) 确保分数能以两位小数的形式优雅展示, ?? 'N/A' 用于处理null或undefined */}
        <p className="text-5xl font-bold text-text-primary">{score?.toFixed(2) ?? 'N/A'}<span className="text-2xl text-text-muted">%</span></p>
      </div>
    </div>
  );
}