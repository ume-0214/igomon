// client/src/pages/Questionnaire.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GoBoard from '../components/GoBoard';
import { AnswerForm } from '../components/AnswerForm';
import { getProblem, submitAnswer, hasUserAnswered } from '../utils/api';
import { getUserUuid } from '../utils/uuid';

export function Questionnaire() {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<any>(null);
  const [selectedCoordinate, setSelectedCoordinate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!problemId) return;
    
    // 回答済みかチェック
    checkIfAnswered();
  }, [problemId]);

  const checkIfAnswered = async () => {
    try {
      const answered = await hasUserAnswered(parseInt(problemId!));
      if (answered) {
        // 回答済みの場合は結果ページへ遷移
        navigate(`/results/${problemId}`, { replace: true });
        return;
      }
      // 未回答の場合は問題を読み込む
      loadProblem();
    } catch (err) {
      console.error('回答状態のチェックに失敗しました:', err);
      // エラーが発生しても問題の読み込みは行う
      loadProblem();
    }
  };

  const loadProblem = async () => {
    try {
      setLoading(true);
      const problemData = await getProblem(problemId!);
      setProblem(problemData);
    } catch (err) {
      setError('問題の読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: {
    coordinate: string;
    reason: string;
    playerName: string;
    playerRank: string;
  }) => {
    if (!problemId || !problem) return;
    
    try {
      setIsSubmitting(true);
      const result = await submitAnswer({
        problemId: problem.id,
        ...formData
      });
      
      // 回答済みの場合でも結果ページへ遷移
      navigate(`/results/${problemId}`);
    } catch (err: any) {
      // サーバーから返されたエラーメッセージを表示
      if (err.message) {
        setError(err.message);
      } else {
        setError('回答の送信に失敗しました');
      }
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="error-page">
        <h2>エラー</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>トップへ戻る</button>
      </div>
    );
  }

  if (!problem) {
    return <div className="error-page">問題が見つかりません</div>;
  }

  return (
    <div className="questionnaire-page">
      <div className="questionnaire-container">
        <div className="problem-header">
          <div className="problem-info-left">
            <span className="problem-number">No.{problem.id}</span>
            <span className="turn-info">{problem.turn === 'black' ? '黒番' : '白番'}</span>
          </div>
        </div>
        
        <p className="problem-description">{problem.description}</p>
        
        <div className="questionnaire-content">
          <div className="board-wrapper">
            <GoBoard
              sgfContent={problem.sgfContent}
              maxMoves={problem.moves}
              onCoordinateSelect={setSelectedCoordinate}
              showClickable={true}
            />
          </div>
          
          <div className="form-wrapper">
            <AnswerForm
              selectedCoordinate={selectedCoordinate}
              onSubmit={handleSubmit}
            />
            {isSubmitting && <p className="submitting">送信中...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}