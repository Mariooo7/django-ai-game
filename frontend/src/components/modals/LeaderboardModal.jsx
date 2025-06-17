// frontend/src/components/modals/LeaderboardModal.jsx

import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../../services/api';
import { FaTrophy, FaTimes } from 'react-icons/fa';

export default function LeaderboardModal({ isOpen, onClose }) {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getLeaderboard()
        .then(response => setBoard(response.data))
        .catch(error => console.error("Failed to fetch leaderboard:", error))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rankIcon = (rank) => {
    if (rank === 0) return <FaTrophy className="text-yellow-400 inline-block" />;
    if (rank === 1) return <FaTrophy className="text-gray-300 inline-block" />;
    if (rank === 2) return <FaTrophy className="text-yellow-600 inline-block" />;
    return `#${rank + 1}`;
  };

  // --- 新增辅助函数，根据排名返回不同的行背景色 ---
  const getRankRowClass = (rank) => {
    if (rank === 0) return 'bg-yellow-400/20'; // 金牌行：20%透明度的黄色背景
    if (rank === 1) return 'bg-gray-300/20';   // 银牌行：20%透明度的灰色背景
    if (rank === 2) return 'bg-yellow-600/20'; // 铜牌行：20%透明度的铜色背景
    return 'border-border/50'; // 其他行
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl shadow-card w-full max-w-3xl flex flex-col max-h-[90vh]">
        <header className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-3xl font-heading text-primary tracking-wide subpixel-antialiased">
            LEADERBOARD
          </h2>
          <button onClick={onClose} className="text-2xl text-text-muted hover:text-primary transition-colors">
            <FaTimes />
          </button>
        </header>

        <main className="p-6 overflow-y-auto">
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <table className="w-full text-lg">
              <thead className="border-b border-border/50">
                <tr>
                  <th className="p-3 text-left">Rank</th>
                  <th className="p-3 text-left">Player</th>
                  <th className="p-3 text-center">Wins</th>
                  <th className="p-3 text-center">Avg. Score Margin</th>
                </tr>
              </thead>
              <tbody>
                {board.map((player, index) => (
                  // --- 核心修改：为 <tr> 动态添加 className ---
                  <tr key={player.username} className={`border-b last:border-b-0 ${getRankRowClass(index)}`}>
                    <td className={`p-3 font-bold text-2xl`}>{rankIcon(index)}</td>
                    <td className="p-3">{player.username}</td>
                    <td className="p-3 text-center font-mono">{player.win_count}</td>
                    <td className="p-3 text-center font-mono text-green-400">
                      +{player.avg_win_margin.toFixed(2)}
                    </td>
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