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
    <div className="results-page">
      <header className="results-header">
        <h1>問題 {problem.id} - 結果</h1>
        <div className="header-info">
          <span className="turn-info">手番: {problem.turn === 'black' ? '黒番' : '白番'}</span>
          <Link to="/" className="back-link">トップへ戻る</Link>
        </div>
      </header>
      
      <main className="results-main">
        <div className="results-container">
          <div className="board-section">
            <div className="problem-info">
              <h3>No.{problem.id} {problem.turn === 'black' ? '黒番' : '白番'}</h3>
              <p className="description">{problem.description}</p>
            </div>
            <GoBoard
              sgfContent={problem.sgfContent}
              maxMoves={problem.moves}
              resultsData={results}
              showClickable={false}
            />
          </div>
          
          <div className="results-section">
            <ResultsDisplay 
              results={results} 
              onDelete={loadData}
            />
          </div>
        </div>
      </main>
    </div>
  );
}