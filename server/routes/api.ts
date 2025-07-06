// server/routes/api.ts
import express, { Request, Response, Router } from 'express';
import { 
  saveAnswer, 
  getResults, 
  deleteAnswer, 
  getProblems,
  getProblem,
  hasUserAnswered 
} from '../../lib/database';
import { loadProblemFromDirectory } from '../utils/problem-loader';
import { createProblem } from '../../src/app/api/problems/create/route';
import prisma from '../../lib/database';

const router = express.Router() as any;

// 回答投稿
router.post('/answers', async (req: Request, res: Response) => {
  try {
    const { problemId, userUuid, coordinate, reason, playerName, playerRank } = req.body;
    
    // 既に回答済みかチェック
    const alreadyAnswered = await hasUserAnswered(problemId, userUuid);
    if (alreadyAnswered) {
      // 回答済みの場合は、エラーではなく成功レスポンスを返す（結果ページへ遷移可能にする）
      return res.json({ 
        success: true, 
        alreadyAnswered: true,
        message: 'この問題には既に回答済みです' 
      });
    }
    
    const result = await saveAnswer({
      problemId,
      userUuid,
      coordinate,
      reason,
      playerName,
      playerRank
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({ error: 'Failed to save answer' });
  }
});

// 結果取得
router.get('/results/:problemId', async (req: Request, res: Response) => {
  try {
    const problemId = parseInt(req.params.problemId);
    const results = await getResults(problemId);
    res.json(results);
  } catch (error) {
    console.error('Error getting results:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
});

// 回答削除
router.delete('/answers/:answerId', async (req: Request, res: Response) => {
  try {
    const answerId = parseInt(req.params.answerId);
    const { userUuid } = req.body;
    
    const success = await deleteAnswer(answerId, userUuid);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Answer not found or not authorized' });
    }
  } catch (error) {
    console.error('Error deleting answer:', error);
    res.status(500).json({ error: 'Failed to delete answer' });
  }
});

// 問題一覧取得（データベースから取得）
router.get('/problems', async (req: Request, res: Response) => {
  try {
    // データベースから問題一覧を取得
    const problems = await prisma.problem.findMany({
      orderBy: { createdAt: 'desc' },
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
    
    // レスポンス形式を整形
    const problemsWithCounts = problems.map(problem => ({
      id: problem.id,
      sgfFilePath: problem.sgfFilePath,
      description: problem.description,
      turn: problem.turn,
      createdDate: problem.createdAt.toISOString().split('T')[0], // 互換性のため一時的に残す
      createdAt: problem.createdAt,
      answerCount: problem._count.answers
    }));
    
    res.json(problemsWithCounts);
  } catch (error) {
    console.error('Error getting problems:', error);
    res.status(500).json({ error: 'Failed to get problems' });
  }
});

// 問題詳細取得
router.get('/problems/:problemId', async (req: Request, res: Response) => {
  try {
    const problemId = req.params.problemId;
    const problem = loadProblemFromDirectory(problemId);
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    res.json(problem);
  } catch (error) {
    console.error('Error getting problem:', error);
    res.status(500).json({ error: 'Failed to get problem' });
  }
});

// SGFファイル取得
router.get('/sgf/:problemId', (req: Request, res: Response) => {
  try {
    const problemId = req.params.problemId;
    const problemData = loadProblemFromDirectory(problemId);
    
    if (!problemData) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    res.setHeader('Content-Type', 'application/x-go-sgf');
    res.send(problemData.sgfContent);
  } catch (error) {
    console.error('Error getting SGF:', error);
    res.status(500).json({ error: 'Failed to get SGF' });
  }
});

// ユーザーが問題に回答済みかチェック
router.get('/problems/:problemId/answered', async (req: Request, res: Response) => {
  try {
    const problemId = parseInt(req.params.problemId);
    const userUuid = req.query.userUuid as string;
    
    if (!userUuid) {
      return res.status(400).json({ error: 'User UUID is required' });
    }
    
    const answered = await hasUserAnswered(problemId, userUuid);
    res.json({ answered });
  } catch (error) {
    console.error('Error checking if user answered:', error);
    res.status(500).json({ error: 'Failed to check answer status' });
  }
});

// 問題作成
router.post('/problems', createProblem);

export default router;