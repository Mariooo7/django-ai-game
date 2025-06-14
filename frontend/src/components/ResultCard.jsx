// frontend/src/components/ResultCard.jsx

export default function ResultCard({ title, generatedImageUrl, prompt, score, isWinner }) {
  // 根据是否为赢家，决定卡片的边框和标题颜色
  const cardColor = isWinner ? 'border-yellow-400' : 'border-gray-600';
  const titleColor = isWinner ? 'text-yellow-400' : 'text-white';

  return (
    <div className={`flex flex-col items-center bg-[#2B3345] p-4 rounded-2xl shadow-lg border-2 ${cardColor} transition-all duration-500`}>
      <h3 className={`text-2xl font-bold mb-4 ${titleColor}`}>{title}</h3>
      <img
        src={generatedImageUrl}
        alt={`${title} generated image`}
        className="w-full h-64 object-cover rounded-lg mb-4 bg-gray-700"
      />
      <div className="w-full text-left">
        <p className="text-sm text-gray-400">使用的提示词:</p>
        <p className="text-base text-white bg-gray-700 p-2 rounded h-20 overflow-y-auto">{prompt}</p>
      </div>
      <div className="mt-4 text-center">
        <p className="text-lg text-gray-400">与原图相似度</p>
        <p className="text-4xl font-bold text-white">{score}%</p>
      </div>
    </div>
  );
}