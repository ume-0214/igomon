import { Request, Response } from 'express'
import prisma from '../../../../../lib/database'
import fs from 'fs/promises'
import path from 'path'

interface CreateProblemRequest {
  id: number
  turn: 'black' | 'white'
  moves: number
  description: string
  sgfContent: string
}

export async function createProblem(req: Request, res: Response) {
  try {
    const body: CreateProblemRequest = req.body
    const { id, turn, moves, description, sgfContent } = body

    // 問題ディレクトリを作成
    const problemDir = path.join(process.cwd(), 'public', 'problems', id.toString())
    await fs.mkdir(problemDir, { recursive: true })

    // SGFファイルを保存（kifu.sgfとして保存）
    const sgfPath = path.join(problemDir, 'kifu.sgf')
    await fs.writeFile(sgfPath, sgfContent)

    // description.txtを保存（新フォーマット: idとcreatedを除外）
    const descriptionContent = `turn: ${turn}
moves: ${moves}
description: ${description}`

    const descriptionPath = path.join(problemDir, 'description.txt')
    await fs.writeFile(descriptionPath, descriptionContent)

    // データベースに登録
    const problem = await prisma.problem.create({
      data: {
        id,
        sgfFilePath: `/problems/${id}/kifu.sgf`,
        description,
        turn,
      },
    })

    // ファイル作成後に少し待機（ファイル監視システムが検知するため）
    await new Promise((resolve) => setTimeout(resolve, 100))

    res.json({
      success: true,
      problem: {
        ...problem,
        answerCount: 0,
      },
    })
  } catch (error) {
    console.error('Problem creation error:', error)
    res.status(500).json({ success: false, error: 'Failed to create problem' })
  }
}
