// server/utils/file-watcher.ts
import chokidar, { FSWatcher } from 'chokidar';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { loadProblemFromDirectory } from './problem-loader';
import { getProblems } from '../../lib/database';
import { generateOGPForProblem } from './ogp-generator';
import { problemExists } from '../../lib/database';
import prisma from '../../lib/database';

export class ProblemWatcher {
  private io: SocketIOServer;
  private watcher!: FSWatcher;
  private problemsDir: string;

  constructor(io: SocketIOServer) {
    this.io = io;
    const rootDir = process.env.NODE_ENV === 'production' 
      ? path.join(__dirname, '../../..') // dist/server/utils から ルートへ
      : path.join(__dirname, '../..');   // server/utils から ルートへ
    this.problemsDir = path.join(rootDir, 'public/problems');
    this.initializeWatcher();
  }

  private async initializeWatcher() {
    // 初回起動時に既存の問題を読み込む
    await this.loadExistingProblems();

    // problems ディレクトリの変更を監視
    this.watcher = chokidar.watch(this.problemsDir, {
      ignored: /node_modules/,
      persistent: true,
      depth: 2, // 問題ディレクトリ内のファイルまで監視
      ignoreInitial: true // 初回のファイルイベントは無視（既に手動で読み込んだため）
    });

    // 新しいディレクトリが追加された場合
    this.watcher.on('addDir', (dirPath: string) => {
      if (this.isProblemDirectory(dirPath)) {
        this.handleNewProblem(dirPath);
      }
    });

    // ファイルが追加された場合（description.txt や kifu.sgf）
    this.watcher.on('add', (filePath: string) => {
      if (this.isRelevantFile(filePath)) {
        const problemDir = path.dirname(filePath);
        this.handleProblemUpdate(problemDir);
      }
    });

    // ファイルが変更された場合
    this.watcher.on('change', (filePath: string) => {
      if (this.isRelevantFile(filePath)) {
        const problemDir = path.dirname(filePath);
        this.handleProblemUpdate(problemDir);
      }
    });

    console.log('File watcher initialized for problems directory');
  }

  private isProblemDirectory(dirPath: string): boolean {
    const relativePath = path.relative(this.problemsDir, dirPath);
    // problems ディレクトリ直下のディレクトリかつ、数字のディレクトリ名
    return relativePath.split(path.sep).length === 1 && /^\d+$/.test(path.basename(dirPath));
  }

  private isRelevantFile(filePath: string): boolean {
    const fileName = path.basename(filePath);
    return fileName === 'description.txt' || fileName === 'kifu.sgf';
  }

  private async handleNewProblem(dirPath: string) {
    const problemId = path.basename(dirPath);
    console.log(`New problem detected: ${problemId}`);
    
    // 少し待ってからファイルを読み込み（ファイルコピーが完了するまで）
    setTimeout(() => {
      this.handleProblemUpdate(dirPath);
    }, 1000);
  }

  private async loadExistingProblems() {
    try {
      const fs = require('fs').promises;
      const entries = await fs.readdir(this.problemsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && /^\d+$/.test(entry.name)) {
          const problemDir = path.join(this.problemsDir, entry.name);
          await this.handleProblemUpdate(problemDir);
        }
      }
      
      console.log('Loaded existing problems');
    } catch (error) {
      console.error('Error loading existing problems:', error);
    }
  }

  private async handleProblemUpdate(dirPath: string) {
    const problemId = path.basename(dirPath);
    
    try {
      // 問題データを読み込み
      const problemData = loadProblemFromDirectory(problemId);
      
      if (problemData) {
        console.log(`Problem updated: ${problemId}`);
        
        // データベースに問題が存在するか確認
        const exists = await problemExists(problemData.id);
        
        if (!exists) {
          // 問題がデータベースに存在しない場合は新規登録
          await prisma.problem.create({
            data: {
              id: problemData.id,
              sgfFilePath: `/problems/${problemData.id}/kifu.sgf`,
              description: problemData.description,
              turn: problemData.turn as 'black' | 'white',
            }
          });
          console.log(`Problem ${problemId} registered in database`);
        }
        
        // OGP画像を生成
        try {
          await generateOGPForProblem(problemData.id, problemData.sgfContent, problemData.moves);
          console.log(`OGP image generated for problem ${problemId}`);
        } catch (ogpError) {
          console.error(`Failed to generate OGP image for problem ${problemId}:`, ogpError);
        }
        
        // 全クライアントに更新を通知
        this.io.emit('problemUpdated', {
          type: 'update',
          problem: problemData
        });
        
        // 問題一覧全体も送信（新規追加の場合）
        const allProblems = await getProblems();
        this.io.emit('problemsListUpdated', allProblems);
      }
    } catch (error) {
      console.error(`Error loading problem ${problemId}:`, error);
    }
  }

  public destroy() {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}