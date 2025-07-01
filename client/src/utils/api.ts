// client/src/utils/api.ts
import { getUserUuid } from './uuid';

export async function submitAnswer(answerData: {
  problemId: number;
  coordinate: string;
  reason: string;
  playerName: string;
  playerRank: string;
}) {
  const userUuid = getUserUuid();
  
  const response = await fetch('/api/answers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...answerData,
      userUuid
    }),
  });
  
  const responseData = await response.json();
  
  // 回答済みの場合も成功として扱う（結果ページへ遷移可能）
  if (responseData.alreadyAnswered) {
    return responseData;
  }
  
  if (!response.ok) {
    // サーバーから返されたエラーメッセージを使用
    if (responseData.error) {
      throw new Error(responseData.error);
    }
    throw new Error('Failed to submit answer');
  }
  
  return responseData;
}

export async function getResults(problemId: number) {
  const response = await fetch(`/api/results/${problemId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    if (errorData.error) {
      throw new Error(errorData.error);
    }
    throw new Error('Failed to get results');
  }
  return response.json();
}

export async function deleteAnswer(answerId: number) {
  const userUuid = getUserUuid();
  
  const response = await fetch(`/api/answers/${answerId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userUuid }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    if (errorData.error) {
      throw new Error(errorData.error);
    }
    throw new Error('Failed to delete answer');
  }
  
  return response.json();
}

export async function getProblems() {
  const response = await fetch('/api/problems');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    if (errorData.error) {
      throw new Error(errorData.error);
    }
    throw new Error('Failed to get problems');
  }
  return response.json();
}

export async function getProblem(problemId: string) {
  const response = await fetch(`/api/problems/${problemId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    if (errorData.error) {
      throw new Error(errorData.error);
    }
    throw new Error('Failed to get problem');
  }
  return response.json();
}

export async function hasUserAnswered(problemId: number): Promise<boolean> {
  const userUuid = getUserUuid();
  const response = await fetch(`/api/problems/${problemId}/answered?userUuid=${userUuid}`);
  if (!response.ok) {
    return false;
  }
  const data = await response.json();
  return data.answered;
}

export async function getSgf(problemId: string) {
  const response = await fetch(`/api/sgf/${problemId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    if (errorData.error) {
      throw new Error(errorData.error);
    }
    throw new Error('Failed to get SGF');
  }
  return response.text();
}