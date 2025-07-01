// client/src/pages/Results.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import GoBoard from '../components/GoBoard';
import { ResultsDisplay } from '../components/ResultsDisplay';
import { getProblem, getResults } from '../utils/api';

export function Results() {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<any>(null);
  const [results, setResults] = useState<Record<string, { votes: number; answers: any[] }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!problemId) return;
    
    loadData();
  }, [problemId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [problemData, resultsData] = await Promise.all([
        getProblem(problemId!),
        getResults(parseInt(problemId!))
      ]);
      
      console.log('Problem data:', problemData);
      console.log('Results data:', resultsData);
      
      setProblem(problemData);
      setResults(resultsData);
    } catch (err) {
      setError('データの読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
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
            <span className="problem-number">No.{problem.id} - 結果</span>
            <span className="turn-info">{problem.turn === 'black' ? '黒番' : '白番'}</span>
          </div>
        </div>
        
        <p className="problem-description">{problem.description}</p>
        
        <div className="questionnaire-content">
          <div className="board-wrapper">
            <GoBoard
              sgfContent={problem.sgfContent}
              maxMoves={problem.moves}
              resultsData={results}
              showClickable={false}
            />
          </div>
          
          <div className="form-wrapper">
            <ResultsDisplay 
              results={results} 
              onDelete={loadData}
            />
            <div className="back-to-top">
              <Link to="/">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 12L7 8L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>トップへ戻る</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}