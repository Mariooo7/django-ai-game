// frontend/src/components/modals/HistoryModal.jsx

import React, { useState, useEffect } from 'react';
import { getHistory } from '../../services/api';
import { FaTimes, FaCheckCircle, FaTimesCircle, FaEquals } from 'react-icons/fa';

export default function HistoryModal({ isOpen, onClose }) {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getHistory()
        .then(response => setRounds(response.data))
        .catch(error => console.error("Failed to fetch history:", error))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const winnerIcon = (winner) => {
    if (winner === 'player') return <FaCheckCircle title="胜利" className="text-green-500" />;
    if (winner === 'ai') return <FaTimesCircle title="失败" className="text-red-500" />;
    return <FaEquals title="平局" className="text-gray-500" />;
  };

  // --- 新增辅助函数，根据胜负结果返回不同的行背景色 ---
  const getResultRowClass = (winner) => {
    if (winner === 'player') return 'bg-green-500/10'; // 胜利行：10%透明度的绿色背景
    if (winner === 'ai') return 'bg-red-500/10';   // 失败行：10%透明度的红色背景
    return 'border-border/50'; // 平局行
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl shadow-card w-full max-w-6xl flex flex-col max-h-[90vh]">
        <header className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-3xl font-heading text-primary tracking-wide subpixel-antialiased">
            HISTORY
          </h2>
          <button onClick={onClose} className="text-2xl text-text-muted hover:text-primary transition-colors">
            <FaTimes />
          </button>
        </header>

        <main className="p-6 overflow-y-auto">
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border/50 text-text-muted">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Original</th>
                  <th className="p-2 text-left">Your Prompt</th>
                  <th className="p-2 text-left">AI's Prompt</th>
                  <th className="p-2 text-center">Your Score</th>
                  <th className="p-2 text-center">AI Score</th>
                  <th className="p-2 text-center">Result</th>
                </tr>
              </thead>
              <tbody>
                {rounds.map(round => (
                  // --- 核心修改：为 <tr> 动态添加 className ---
                  <tr key={round.id} className={`border-b last:border-b-0 ${getResultRowClass(round.winner)}`}>
                    <td className="p-2 whitespace-nowrap">{new Date(round.timestamp).toLocaleDateString()}</td>
                    <td className="p-2">
                      <a href={round.original_image_url} target="_blank" rel="noopener noreferrer">
                        <img src={round.original_image_url} alt="Original" className="w-16 h-16 object-cover rounded-md transition-transform hover:scale-110" />
                      </a>
                    </td>
                    <td className="p-2 max-w-xs truncate" title={round.player_prompt}>{round.player_prompt}</td>
                    <td className="p-2 max-w-xs truncate" title={round.ai_generated_prompt_from_image}>{round.ai_generated_prompt_from_image}</td>
                    <td className="p-2 text-center font-mono text-blue-400">{round.player_similarity_score.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono text-purple-400">{round.ai_similarity_score.toFixed(2)}</td>
                    <td className="p-2 text-2xl flex items-center justify-center h-full mt-4">{winnerIcon(round.winner)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
    </div>
  );
}