// lib/database.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 回答の保存
export async function saveAnswer(answerData: {
  problemId: number;
  userUuid: string;
  coordinate: string;
  reason: string;
  playerName: string;
  playerRank: string;
}) {
  // 問題がデータベースに存在するか確認
  const problemExists = await prisma.problem.findUnique({
    where: { id: answerData.problemId }
  });

  // 問題が存在しない場合は、ファイルシステムから読み込んで作成
  if (!problemExists) {
    // ファイルシステムから問題データを取得
    const { loadProblemFromDirectory } = await import('../server/utils/problem-loader');
    const problemData = loadProblemFromDirectory(answerData.problemId.toString());
    
    if (!problemData) {
      throw new Error('Problem not found');
    }

    // 問題をデータベースに作成
    await prisma.problem.create({
      data: {
        id: problemData.id,
        sgfFilePath: `problems/${problemData.id}/kifu.sgf`,
        description: problemData.description,
        turn: problemData.turn,
        createdDate: problemData.createdDate
      }
    });
  }

  return await prisma.answer.create({
    data: answerData
  });
}

// 結果の取得
export async function getResults(problemId: number) {
  const answers = await prisma.answer.findMany({
    where: { 
      problemId: problemId, 
      isDeleted: false 
    },
    orderBy: { createdAt: 'asc' }
  });
  
  // 座標ごとの集計
  const results: Record<string, { votes: number; answers: any[] }> = {};
  answers.forEach(answer => {
    if (!results[answer.coordinate]) {
      results[answer.coordinate] = { votes: 0, answers: [] };
    }
    results[answer.coordinate].votes++;
    results[answer.coordinate].answers.push(answer);
  });
  
  return results;
}

// 回答の削除（論理削除）
export async function deleteAnswer(answerId: number, userUuid: string) {
  const result = await prisma.answer.updateMany({
    where: { 
      id: answerId, 
      userUuid: userUuid,
      isDeleted: false 
    },
    data: { 
      isDeleted: true,
      updatedAt: new Date()
    }
  });
  
  return result.count > 0;
}

// 問題一覧の取得
export async function getProblems() {
  return await prisma.problem.findMany({
    orderBy: { createdDate: 'desc' },
    include: {
      _count: {
        select: {
          answers: {
            where: { isDeleted: false }
          }
        }
      }
    }
  });
}

// 問題の詳細取得
export async function getProblem(problemId: number) {
  return await prisma.problem.findUnique({
    where: { id: problemId }
  });
}

// 問題の存在確認（ID重複チェック用）
export async function problemExists(problemId: number) {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: { id: true }
  });
  return !!problem;
}

// ユーザーが既に回答済みかチェック
export async function hasUserAnswered(problemId: number, userUuid: string) {
  const answer = await prisma.answer.findFirst({
    where: {
      problemId: problemId,
      userUuid: userUuid,
      isDeleted: false
    }
  });
  return !!answer;
}

export default prisma;