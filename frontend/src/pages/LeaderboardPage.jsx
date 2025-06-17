import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/api';
import { FaTrophy } from 'react-icons/fa'; // 我们将使用这个图标

export default function LeaderboardPage() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(response => setBoard(response.data))
      .catch(error => console.error("Failed to fetch leaderboard:", error))
      .finally(() => setLoading(false));
  }, []);

  const rankColor = (rank) => {
    if (rank === 0) return 'text-yellow-400'; // 金牌
    if (rank === 1) return 'text-gray-300';  // 银牌
    if (rank === 2) return 'text-yellow-600';// 铜牌
    return 'text-text-primary';
  };

  if (loading) return <p className="text-center text-xl">正在加载全服排行榜...</p>;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8 font-heading text-primary">🏆 排行榜 🏆</h1>
      <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-lg">
          <thead className="border-b border-border">
            <tr>
              <th className="p-4 text-left">排名</th>
              <th className="p-4 text-left">玩家</th>
              <th className="p-4 text-center">战胜AI次数</th>
            </tr>
          </thead>
          <tbody>
            {board.map((player, index) => (
              <tr key={player.username} className="border-b border-border/50">
                <td className={`p-4 font-bold text-2xl ${rankColor(index)}`}>
                  {index < 3 ? <FaTrophy className="inline-block" /> : `#${index + 1}`}
                </td>
                <td className="p-4">{player.username}</td>
                <td className="p-4 text-center font-mono">{player.win_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}