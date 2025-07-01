// client/src/pages/Home.tsx
import React, { useEffect, useState } from 'react';
import { useRealTimeProblems } from '../hooks/useRealTimeProblems';
import { Link } from 'react-router-dom';
import { getUserUuid } from '../utils/uuid';
import { hasUserAnswered } from '../utils/api';

export function Home() {
  const { problems, isConnected } = useRealTimeProblems();
  const [answeredProblems, setAnsweredProblems] = useState<Set<number>>(new Set());

  // 日付をフォーマット（YYYY.MM.DD形式）
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  return (
    <div className="home-page">
      <header>
        <h1>いごもん</h1>
        <div className="connection-status">
          {isConnected ? (
            <span className="connected">● リアルタイム更新中</span>
          ) : (
            <span className="disconnected">● 接続中...</span>
          )}
        </div>
      </header>
      
      <main>
        <div className="problems-list">
          {problems.length === 0 ? (
            <p>問題がありません</p>
          ) : (
            problems.map(problem => (
              <Link 
                key={problem.id} 
                to={`/questionnaire/${problem.id}`} 
                className="problem-card-link"
              >
                <div className="problem-card">
                  <div className="problem-thumbnail">
                    <img 
                      src={`/ogp/problem_${problem.id}.png`} 
                      alt={`No.${String(problem.id)}`}
                      onError={(e) => {
                        // 画像が存在しない場合はプレースホルダーを表示
                        e.currentTarget.src = '/placeholder-board.png';
                      }}
                    />
                    <div className="problem-id-overlay">
                      No.{String(problem.id)}
                    </div>
                  </div>
                  <div className="problem-info">
                    <div className="problem-details">
                      <span className="problem-turn">
                        {problem.turn === 'black' ? '黒番' : '白番'}　解答
                      </span>
                      <span className="problem-date">
                        ◎ {formatDate(problem.createdDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}