// プレースホルダー碁盤画像を生成するスクリプト
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generatePlaceholderBoard() {
  // 1200x630のキャンバスを作成（OGPサイズ）
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  // 背景色（薄い木目色）
  ctx.fillStyle = '#f5deb3';
  ctx.fillRect(0, 0, 1200, 630);

  // 碁盤を中央に配置（600x600）
  const boardSize = 600;
  const boardX = (1200 - boardSize) / 2;
  const boardY = (630 - boardSize) / 2;
  
  // 碁盤の背景
  ctx.fillStyle = '#dcb068';
  ctx.fillRect(boardX, boardY, boardSize, boardSize);

  // 格子線を描画
  const cellSize = boardSize / 18;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;

  // 縦線
  for (let i = 0; i < 19; i++) {
    const x = boardX + i * cellSize;
    ctx.beginPath();
    ctx.moveTo(x, boardY);
    ctx.lineTo(x, boardY + boardSize);
    ctx.stroke();
  }

  // 横線
  for (let i = 0; i < 19; i++) {
    const y = boardY + i * cellSize;
    ctx.beginPath();
    ctx.moveTo(boardX, y);
    ctx.lineTo(boardX + boardSize, y);
    ctx.stroke();
  }

  // 星を描画
  ctx.fillStyle = '#000000';
  const starPositions = [3, 9, 15];
  for (const i of starPositions) {
    for (const j of starPositions) {
      const x = boardX + i * cellSize;
      const y = boardY + j * cellSize;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 中央に "いごもん" のテキストを配置
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('いごもん', 600, 315);

  // 画像を保存
  const outputPath = path.join(__dirname, '../public/placeholder-board.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`プレースホルダー画像を生成しました: ${outputPath}`);
}

// スクリプトを実行
generatePlaceholderBoard();