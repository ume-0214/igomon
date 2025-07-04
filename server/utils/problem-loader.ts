// server/utils/problem-loader.ts
import fs from 'fs';
import path from 'path';

interface ProblemData {
  id: number;
  turn: string;
  createdDate: string;
  description: string;
  sgfContent: string;
  moves?: number;
}

export function loadProblemFromDirectory(problemId: string): ProblemData | null {
  const rootDir = process.env.NODE_ENV === 'production' 
    ? path.join(__dirname, '../../..') // dist/server/utils から ルートへ
    : path.join(__dirname, '../..');   // server/utils から ルートへ
  const problemDir = path.join(rootDir, 'public/problems', problemId);
  
  try {
    // description.txt の読み込み
    const descriptionPath = path.join(problemDir, 'description.txt');
    const descriptionContent = fs.readFileSync(descriptionPath, 'utf-8');
    
    // SGFファイルの読み込み
    const sgfPath = path.join(problemDir, 'kifu.sgf');
    const sgfContent = fs.readFileSync(sgfPath, 'utf-8');
    
    // description.txt のパース
    const problemData = parseDescriptionFile(descriptionContent);
    
    return {
      ...problemData,
      sgfContent
    };
  } catch (error) {
    console.error(`Failed to load problem ${problemId}:`, error);
    return null;
  }
}

function parseDescriptionFile(content: string): Omit<ProblemData, 'sgfContent'> {
  const lines = content.trim().split('\n');
  const data: any = {};
  
  lines.forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      data[key.trim()] = valueParts.join(':').trim();
    }
  });
  
  // 必須項目のチェック
  if (!data.id || !data.turn || !data.created || !data.description) {
    throw new Error('必須項目が不足しています: id, turn, created, description');
  }
  
  return {
    id: parseInt(data.id),
    turn: data.turn,
    createdDate: data.created,
    description: data.description,
    moves: data.moves ? parseInt(data.moves) : undefined
  };
}

// 全問題の一覧を取得
export function getAllProblems(): ProblemData[] {
  const rootDir = process.env.NODE_ENV === 'production' 
    ? path.join(__dirname, '../../..') // dist/server/utils から ルートへ
    : path.join(__dirname, '../..');   // server/utils から ルートへ
  const problemsDir = path.join(rootDir, 'public/problems');
  
  try {
    const problemDirs = fs.readdirSync(problemsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    const problems: ProblemData[] = [];
    
    problemDirs.forEach(dirName => {
      const problemData = loadProblemFromDirectory(dirName);
      if (problemData) {
        problems.push(problemData);
      }
    });
    
    // 作成日時順でソート（新しい順）
    return problems.sort((a, b) => 
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );
  } catch (error) {
    console.error('Failed to load problems:', error);
    return [];
  }
}