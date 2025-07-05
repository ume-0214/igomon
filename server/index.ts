// server/index.ts
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import apiRoutes from './routes/api';
import { ProblemWatcher } from './utils/file-watcher';
import { getAllProblems, loadProblemFromDirectory } from './utils/problem-loader';
import { generateProblemHTML } from './utils/html-generator';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイル配信
// プロジェクトルートからの相対パスで指定
const rootDir = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, '../..') // dist/server から ルートへ
  : path.join(__dirname, '..');   // server から ルートへ

// 静的ファイルのデバッグログ
console.log('Static files serving from:', path.join(rootDir, 'public/dist'));

// placeholder-board.pngを特定のルートで配信
app.get('/placeholder-board.png', (_req: Request, res: Response) => {
  res.sendFile(path.join(rootDir, 'public/placeholder-board.png'));
});

app.use(express.static(path.join(rootDir, 'public/dist')));
app.use('/wgo', express.static(path.join(rootDir, 'public/wgo'))); // WGo.js配信
app.use('/problems', express.static(path.join(rootDir, 'public/problems')));
app.use('/ogp', express.static(path.join(rootDir, 'public/ogp')));

// API ルート
app.use('/api', apiRoutes);

// WebSocket接続処理
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // 接続時に現在の問題一覧を送信
  socket.emit('initialProblems', getAllProblems());
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ファイル監視を開始
const problemWatcher = new ProblemWatcher(io);

// 環境変数からサイトURLを取得（デフォルトは開発環境）
const siteUrl = process.env.SITE_URL || `http://localhost:${port}`;

// 問題ページへの直接アクセス時のOGP対応
app.get('/questionnaire/:problemId', (req: Request, res: Response) => {
  const problemId = req.params.problemId;
  const problem = loadProblemFromDirectory(problemId);
  
  if (problem) {
    const ogpData = {
      title: `問題 ${problem.id} - いごもん`,
      description: problem.description,
      imageUrl: `${siteUrl}/ogp/problem_${problem.id}.png`,
      url: `${siteUrl}/questionnaire/${problem.id}`
    };
    
    // OGPタグを含むHTMLを生成
    const html = generateProblemHTML(problem.id, ogpData);
    res.send(html);
  } else {
    // 問題が見つからない場合は通常のSPAとして処理
    res.sendFile(path.join(rootDir, 'public/dist/index.html'));
  }
});

// 結果ページへの直接アクセス時のOGP対応
app.get('/results/:problemId', (req: Request, res: Response) => {
  const problemId = req.params.problemId;
  const problem = loadProblemFromDirectory(problemId);
  
  if (problem) {
    const ogpData = {
      title: `問題 ${problem.id} 結果 - いごもん`,
      description: problem.description,
      imageUrl: `${siteUrl}/ogp/problem_${problem.id}.png`,
      url: `${siteUrl}/results/${problem.id}`
    };
    
    const html = generateProblemHTML(problem.id, ogpData);
    res.send(html);
  } else {
    res.sendFile(path.join(rootDir, 'public/dist/index.html'));
  }
});

// ルートパスへのアクセス
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(rootDir, 'public/dist/index.html'));
});

// SPA用のフォールバック（すべてのルートをキャッチ）
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(rootDir, 'public/dist/index.html'));
});

// サーバー終了時のクリーンアップ
process.on('SIGTERM', () => {
  problemWatcher.destroy();
  server.close();
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});