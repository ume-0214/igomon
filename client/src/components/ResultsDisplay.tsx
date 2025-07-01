// client/src/components/ResultsDisplay.tsx
import React, { useState, useEffect } from 'react';
import { deleteAnswer } from '../utils/api';
import { getUserUuid } from '../utils/uuid';

interface Answer {
  id: number;
  userUuid: string;
  coordinate: string;
  reason: string;
  playerName: string;
  playerRank: string;
  createdAt: string;
}

interface ResultsDisplayProps {
  results: Record<string, { votes: number; answers: Answer[] }>;
  onDelete: () => void;
}

export function ResultsDisplay({ results, onDelete }: ResultsDisplayProps) {
  const [selectedCoordinate, setSelectedCoordinate] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Answer[]>([]);
  const userUuid = getUserUuid();

  useEffect(() => {
    // 碁盤からの詳細表示イベントをリッスン
    const handleShowDetails = (event: CustomEvent) => {
      console.log('ResultsDisplay received event:', event.detail);
      const { coordinate, data } = event.detail;
      setSelectedCoordinate(coordinate);
      setSelectedAnswers(data.answers);
    };

    window.addEventListener('showAnswerDetails', handleShowDetails as EventListener);
    console.log('ResultsDisplay: Event listener registered');
    
    return () => {
      window.removeEventListener('showAnswerDetails', handleShowDetails as EventListener);
      console.log('ResultsDisplay: Event listener removed');
    };
  }, []);

  const handleDelete = async (answerId: number) => {
    if (!confirm('この回答を削除しますか？')) return;
    
    try {
      await deleteAnswer(answerId);
      onDelete(); // 親コンポーネントで再読み込み
    } catch (err) {
      console.error('削除に失敗しました:', err);
      alert('削除に失敗しました');
    }
  };

  // 総回答数を計算
  const totalVotes = Object.values(results).reduce((sum, { votes }) => sum + votes, 0);

  return (
    <div className="results-display">
      <div className="results-summary">
        <h3>回答集計</h3>
        <p>総回答数: {totalVotes}票</p>
      </div>
      
      {selectedCoordinate && selectedAnswers.length > 0 && (
        <div className="answer-details">
          <h3 className="coordinate-header">{selectedCoordinate}</h3>
          <div className="answers-list">
            {selectedAnswers.map((answer) => (
              <div key={answer.id} className="answer-item">
                <div className="answer-meta">
                  <div className="player-info">
                    <span className="player-name">名前：{answer.playerName}</span>
                    <span className="player-rank">段位：{answer.playerRank}</span>
                  </div>
                  <div className="answer-actions">
                    {answer.userUuid === userUuid && (
                      <button 
                        className="delete-button"
                        onClick={() => handleDelete(answer.id)}
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
                <div className="answer-content">
                  <p className="answer-reason">{answer.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!selectedCoordinate && (
        <div className="help-text">
          <p>盤面上の数字をクリックすると、その座標の回答詳細が表示されます</p>
        </div>
      )}
    </div>
  );
}