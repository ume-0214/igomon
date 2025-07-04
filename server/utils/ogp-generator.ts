// server/utils/ogp-generator.ts
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

interface StonePosition {
  x: number;
  y: number;
  color: 'black' | 'white';
}

export class OGPGenerator {
  private readonly canvasWidth = 1200;
  private readonly canvasHeight = 630;
  private readonly boardSize = 600;
  private readonly boardMargin = 30;
  private readonly gridSize = 19;
  private readonly cellSize: number;

  constructor() {
    this.cellSize = (this.boardSize - 2 * this.boardMargin) / (this.gridSize - 1);
  }

  async generateOGPImage(sgfContent: string, problemId: number, maxMoves?: number): Promise<void> {
    const canvas = createCanvas(this.canvasWidth, this.canvasHeight);
    const ctx = canvas.getContext('2d') as any;

    // 背景色を設定
    ctx.fillStyle = '#f5deb3'; // 薄い木目色
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 碁盤を中央に配置
    const boardX = (this.canvasWidth - this.boardSize) / 2;
    const boardY = (this.canvasHeight - this.boardSize) / 2;

    // 碁盤の背景
    ctx.fillStyle = '#dcb068';
    ctx.fillRect(boardX, boardY, this.boardSize, this.boardSize);

    // 碁盤の線を描画
    this.drawBoard(ctx, boardX, boardY);

    // SGFから石の配置を読み込んで描画
    const stones = this.parseSGF(sgfContent, maxMoves);
    this.drawStones(ctx, stones, boardX, boardY);

    // PNG画像として保存
    const rootDir = process.env.NODE_ENV === 'production' 
      ? path.join(__dirname, '../../..') // dist/server/utils から ルートへ
      : path.join(__dirname, '../..');   // server/utils から ルートへ
    const outputDir = path.join(rootDir, 'public/ogp');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `problem_${problemId}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    console.log(`OGP image generated: ${outputPath}`);
  }

  private drawBoard(ctx: any, boardX: number, boardY: number): void {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    // 縦線と横線を描画
    for (let i = 0; i < this.gridSize; i++) {
      const x = boardX + this.boardMargin + i * this.cellSize;
      const y = boardY + this.boardMargin + i * this.cellSize;

      // 縦線
      ctx.beginPath();
      ctx.moveTo(x, boardY + this.boardMargin);
      ctx.lineTo(x, boardY + this.boardSize - this.boardMargin);
      ctx.stroke();

      // 横線
      ctx.beginPath();
      ctx.moveTo(boardX + this.boardMargin, y);
      ctx.lineTo(boardX + this.boardSize - this.boardMargin, y);
      ctx.stroke();
    }

    // 星を描画（9つの星）
    const starPositions = [
      [3, 3], [9, 3], [15, 3],
      [3, 9], [9, 9], [15, 9],
      [3, 15], [9, 15], [15, 15]
    ];

    ctx.fillStyle = '#000000';
    starPositions.forEach(([x, y]) => {
      const pixelX = boardX + this.boardMargin + x * this.cellSize;
      const pixelY = boardY + this.boardMargin + y * this.cellSize;
      ctx.beginPath();
      ctx.arc(pixelX, pixelY, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private drawStones(ctx: any, stones: StonePosition[], boardX: number, boardY: number): void {
    const stoneRadius = this.cellSize * 0.45;

    stones.forEach(stone => {
      const pixelX = boardX + this.boardMargin + stone.x * this.cellSize;
      const pixelY = boardY + this.boardMargin + stone.y * this.cellSize;

      // 石の影を描画
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // 石を描画
      ctx.beginPath();
      ctx.arc(pixelX, pixelY, stoneRadius, 0, Math.PI * 2);
      
      if (stone.color === 'black') {
        ctx.fillStyle = '#000000';
      } else {
        ctx.fillStyle = '#ffffff';
      }
      ctx.fill();

      // 白石の場合は境界線を追加
      if (stone.color === 'white') {
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 影をリセット
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    });
  }

  private parseSGF(sgfContent: string, maxMoves?: number): StonePosition[] {
    const stones: StonePosition[] = [];
    const board: (0 | 1 | -1)[][] = Array(19).fill(null).map(() => Array(19).fill(0));
    
    // 黒石の手を抽出
    const blackMoves = [...sgfContent.matchAll(/;B\[([a-s])([a-s])\]/g)];
    // 白石の手を抽出
    const whiteMoves = [...sgfContent.matchAll(/;W\[([a-s])([a-s])\]/g)];

    // すべての手を順番に処理（簡易版）
    let moveCount = 0;
    const allMoves: { match: RegExpMatchArray; color: 'black' | 'white' }[] = [];

    // SGFの順序を保持するため、インデックスも記録
    blackMoves.forEach(match => {
      allMoves.push({ match, color: 'black' });
    });
    whiteMoves.forEach(match => {
      allMoves.push({ match, color: 'white' });
    });

    // SGF内での出現順にソート（簡易版）
    allMoves.sort((a, b) => {
      const aIndex = sgfContent.indexOf(a.match[0]);
      const bIndex = sgfContent.indexOf(b.match[0]);
      return aIndex - bIndex;
    });

    // 指定された手数まで処理
    for (const move of allMoves) {
      if (maxMoves !== undefined && moveCount >= maxMoves) break;

      const x = move.match[1].charCodeAt(0) - 'a'.charCodeAt(0);
      const y = move.match[2].charCodeAt(0) - 'a'.charCodeAt(0);

      // 石を配置（取られた石の処理は簡易的に省略）
      board[x][y] = move.color === 'black' ? 1 : -1;
      moveCount++;
    }

    // 盤面の状態から石の位置を抽出
    for (let x = 0; x < 19; x++) {
      for (let y = 0; y < 19; y++) {
        if (board[x][y] !== 0) {
          stones.push({
            x,
            y,
            color: board[x][y] === 1 ? 'black' : 'white'
          });
        }
      }
    }

    return stones;
  }
}

// 問題ディレクトリが追加されたときにOGP画像を生成する関数
export async function generateOGPForProblem(problemId: number, sgfContent: string, maxMoves?: number): Promise<void> {
  const generator = new OGPGenerator();
  await generator.generateOGPImage(sgfContent, problemId, maxMoves);
}