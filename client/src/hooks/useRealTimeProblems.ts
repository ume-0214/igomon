// client/src/hooks/useRealTimeProblems.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Problem {
  id: number;
  description: string;
  turn: string;
  createdDate: string;
  answerCount?: number;
}

export function useRealTimeProblems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // 初期データをAPIから取得
  useEffect(() => {
    fetch('/api/problems')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched problems from API:', data);
        setProblems(data);
      })
      .catch(err => console.error('Failed to fetch problems:', err));
  }, []);

  useEffect(() => {
    // Socket.io接続
    const newSocket = io(window.location.hostname === 'localhost' ? 'http://localhost:3000' : '/');
    setSocket(newSocket);

    // 接続状態の管理
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // 初期問題一覧受信
    newSocket.on('initialProblems', (initialProblems: Problem[]) => {
      console.log('Received initial problems:', initialProblems);
      setProblems(initialProblems);
    });

    // 問題一覧更新受信
    newSocket.on('problemsListUpdated', (updatedProblems: Problem[]) => {
      console.log('Problems list updated:', updatedProblems);
      setProblems(updatedProblems);
    });

    // 個別問題更新受信
    newSocket.on('problemUpdated', (data: { type: string; problem: Problem }) => {
      console.log('Problem updated:', data);
      
      if (data.type === 'update') {
        setProblems(prev => {
          const existingIndex = prev.findIndex(p => p.id === data.problem.id);
          if (existingIndex >= 0) {
            // 既存問題の更新
            const updated = [...prev];
            updated[existingIndex] = data.problem;
            return updated;
          } else {
            // 新規問題の追加
            return [data.problem, ...prev].sort((a, b) => 
              new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
            );
          }
        });
      }
    });

    // クリーンアップ
    return () => {
      newSocket.close();
    };
  }, []);

  return {
    problems,
    isConnected,
    socket
  };
}