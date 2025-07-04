// client/src/components/GoBoard.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import '../styles/GoBoard.css';

interface GoBoardProps {
  sgfContent: string;
  onCoordinateSelect?: (coordinate: string) => void;
  showClickable?: boolean;
  resultsData?: Record<string, { votes: number; answers: any[] }>;
  maxMoves?: number; // movesパラメータ対応
}

declare global {
  interface Window {
    WGo: any;
  }
}

export default function GoBoard({ 
  sgfContent, 
  onCoordinateSelect, 
  showClickable = false,
  resultsData,
  maxMoves 
}: GoBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<any>(null);
  const [isWgoLoaded, setIsWgoLoaded] = useState(false);

  // WGo.jsの読み込み確認（公式推奨方式）
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 50; // 5秒間待つ
    
    const checkWgoLoaded = () => {
      if (typeof window !== 'undefined' && window.WGo) {
        console.log('WGo.js loaded successfully');
        console.log('WGo object:', window.WGo);
        console.log('WGo.Board available:', !!window.WGo.Board);
        console.log('WGo.Game available:', !!window.WGo.Game);
        setIsWgoLoaded(true);
      } else {
        retryCount++;
        console.log(`Waiting for WGo.js... (attempt ${retryCount}/${maxRetries})`);
        
        if (retryCount < maxRetries) {
          setTimeout(checkWgoLoaded, 100);
        } else {
          console.error('Failed to load WGo.js after', maxRetries, 'attempts');
        }
      }
    };
    checkWgoLoaded();
  }, []);

  // 結果表示用のクリックハンドラーを保存
  const resultClickHandlerRef = useRef<any>(null);

  useEffect(() => {
    if (!isWgoLoaded || !boardRef.current) return;

    const initializeBoard = () => {
      try {
        // 既存の碁盤を削除
        if (boardRef.current) {
          boardRef.current.innerHTML = '';
        }
        
        // コンテナのサイズを取得
        const containerRect = boardRef.current.getBoundingClientRect();
        const containerWidth = Math.min(containerRect.width || 360, 500);
        console.log('Initializing board with width:', containerWidth);
        
        // デバッグ情報を追加
        console.log('WGo object:', window.WGo);
        console.log('WGo.Board:', window.WGo?.Board);
        
        const newBoard = new window.WGo.Board(boardRef.current, {
          size: 19,
          width: containerWidth,
          height: containerWidth,
          font: "Calibri",
          lineWidth: 1,
          background: "/wgo/wood1.jpg",
          section: { top: -0.5, bottom: -0.5, left: -0.5, right: -0.5 }  // 座標表示のため余白拡大
        });
        
        console.log('Board created:', newBoard);

        // 座標表示用のカスタム描画ハンドラーを定義
        const coordinates = {
          grid: {
            draw: function(args: any, board: any) {
              const ctx = this;
              // テキスト描画のスタイル設定
              ctx.fillStyle = "rgba(0,0,0,0.7)";
              ctx.textBaseline = "middle";
              ctx.textAlign = "center";
              ctx.font = board.stoneRadius + "px " + (board.font || "");
              
              // 盤外に文字を配置するための座標計算
              const xLeft   = board.getX(board.size - 0.25);  // 右端より少し右のX座標
              const xRight  = board.getX(-0.75);             // 左端より少し左のX座標
              const yTop    = board.getY(-0.75);             // 上端より少し上のY座標
              const yBottom = board.getY(board.size - 0.25); // 下端より少し下のY座標
              
              // 全ての交点に対応する座標ラベルを描画
              for (let i = 0; i < board.size; i++) {
                // 横方向の文字(A～T)を決定（'I'を飛ばす）
                let charCode = "A".charCodeAt(0) + i;
                if (charCode >= "I".charCodeAt(0)) charCode++;  // 'I'の文字コードをスキップ
                const letter = String.fromCharCode(charCode);
                
                // 縦座標（数字）ラベルを左端と右端に描画
                const y = board.getY(i);
                ctx.fillText(board.size - i, xLeft,  y);  // 左側：19,18,...1
                ctx.fillText(board.size - i, xRight, y);  // 右側：19,18,...1
                
                // 横座標（英字）ラベルを上端と下端に描画
                const x = board.getX(i);
                ctx.fillText(letter, x, yTop);     // 上側：A,...T（I抜き）
                ctx.fillText(letter, x, yBottom);  // 下側：A,...T（I抜き）
              }
            }
          }
        };

        // 座標表示ハンドラーを追加
        newBoard.addCustomObject(coordinates);
        console.log('座標表示ハンドラーを追加しました');

        setBoard(newBoard);

        if (sgfContent) {
          // SGF処理（WGo.Gameクラス使用）
          const game = new window.WGo.Game();
          loadSgfToGame(game, sgfContent, maxMoves);
          
          // 現在のポジションを盤面に反映
          const position = game.getPosition();
          updateBoardPosition(newBoard, position);

          // アンケート回答ページでのクリック処理（公式addEventListener）
          if (showClickable && onCoordinateSelect) {
            // クリックマーカー保存用変数
            let lastClickMarker: any = null;
            
            newBoard.addEventListener("click", (x: number, y: number) => {
              // 公式座標システム（相対座標）
              const coordinate = wgoToSgfCoords(x, y);
              onCoordinateSelect(coordinate);
              
              // 視覚的フィードバック（公式addObject）
              // 前回のマーカーを削除
              if (lastClickMarker) {
                newBoard.removeObject(lastClickMarker);
              }
              
              // 新しいマーカーを追加
              lastClickMarker = {
                x: x,
                y: y,
                type: "CR"  // 公式定義済みマーカー（円）
              };
              newBoard.addObject(lastClickMarker);
            });
          }

          // 結果表示ページでの得票数表示
          if (resultsData && Object.keys(resultsData).length > 0) {
            console.log('Calling displayResults with data:', resultsData);
            displayResults(newBoard, resultsData);
          } else {
            console.log('No results data to display');
          }
        }

      } catch (error) {
        console.error('Failed to initialize WGo.Board:', error);
        // エラー詳細を表示
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
      }
    };

    // コンテナのサイズが確定してから初期化
    const timer = setTimeout(() => {
      initializeBoard();
    }, 100);

    // クリーンアップ
    return () => {
      clearTimeout(timer);
      if (board) {
        board.removeAllObjects?.();
        // 以前のクリックハンドラーを削除
        if (resultClickHandlerRef.current) {
          board.removeEventListener("click", resultClickHandlerRef.current);
          resultClickHandlerRef.current = null;
        }
      }
    };
  }, [isWgoLoaded, sgfContent, showClickable, resultsData, maxMoves]);

  // SGFをWGo.Gameに読み込み（公式Game API使用）
  const loadSgfToGame = (game: any, sgfContent: string, maxMoves?: number) => {
    try {
      // 簡易SGFパーサー（公式の詳細パーサーがあれば使用推奨）
      const moves = parseSgfMoves(sgfContent);
      
      moves.forEach((move, index) => {
        if (maxMoves !== undefined && index >= maxMoves) return;
        
        if (move.color && move.x !== undefined && move.y !== undefined) {
          // 公式play()メソッド使用
          const result = game.play(move.x, move.y, move.color);
          if (Array.isArray(result)) {
            console.log(`Move ${index + 1}: captured ${result.length} stones`);
          }
        }
      });
    } catch (error) {
      console.error('Failed to load SGF:', error);
    }
  };

  // ポジションを盤面に反映（公式Position API使用）
  const updateBoardPosition = (boardInstance: any, position: any) => {
    boardInstance.removeAllObjects(); // 既存オブジェクト削除
    
    for (let x = 0; x < position.size; x++) {
      for (let y = 0; y < position.size; y++) {
        const stone = position.get(x, y);
        if (stone !== 0) {
          // 公式addObject（石の配置）
          boardInstance.addObject({
            x: x,
            y: y,
            c: stone // WGo.B または WGo.W （石の場合はtypeは不要）
          });
        }
      }
    }
  };

  // 結果表示機能（WGo.jsのaddObjectを使用）
  const displayResults = (boardInstance: any, results: Record<string, { votes: number; answers: any[] }>) => {
    console.log('Displaying results:', results);
    console.log('Results keys:', Object.keys(results));
    console.log('Board instance:', boardInstance);
    
    // まず、すべての結果マーカーを削除
    boardInstance.removeAllObjects();
    
    // 既存の石を再配置
    const game = new window.WGo.Game();
    loadSgfToGame(game, sgfContent, maxMoves);
    const position = game.getPosition();
    
    for (let x = 0; x < position.size; x++) {
      for (let y = 0; y < position.size; y++) {
        const stone = position.get(x, y);
        if (stone !== 0) {
          boardInstance.addObject({
            x: x,
            y: y,
            c: stone
          });
        }
      }
    }
    
    // 結果の数字を表示（docs/wgo.mdの推奨方法に従い、石とラベルを重ねて表示）
    Object.entries(results).forEach(([coordinate, data]) => {
      const coords = sgfToWgoCoords(coordinate);
      console.log(`Converting coordinate ${coordinate} to WGo coords:`, coords);
      
      if (coords.x >= 0 && coords.x < 19 && coords.y >= 0 && coords.y < 19) {
        const stoneAtPosition = position.get(coords.x, coords.y);
        
        // 石がない場合は、色付き円を追加
        if (stoneAtPosition === 0) {
          // カスタム描画ハンドラを定義
          const voteCircleHandler = {
            stone: {
              draw: function(args: any, board: any) {
                const ctx = board.stone.getContext(args.x, args.y);
                const xr = board.getX(args.x);
                const yr = board.getY(args.y);
                const sr = board.stoneRadius;
                
                // 背景の円を描画
                ctx.beginPath();
                ctx.arc(xr, yr, sr * 0.8, 0, 2 * Math.PI, true);
                ctx.fillStyle = args.bgColor;
                ctx.fill();
                
                // テキストを描画
                ctx.font = `bold ${sr * 0.8}px Calibri`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFFFFF';
                ctx.strokeStyle = args.bgColor;
                ctx.lineWidth = 3;
                ctx.strokeText(args.text, xr, yr);
                ctx.fillText(args.text, xr, yr);
              }
            }
          };
          
          boardInstance.addObject({
            x: coords.x,
            y: coords.y,
            type: voteCircleHandler,
            text: data.votes.toString(),
            bgColor: getColorByVotes(data.votes)
          });
        } else {
          // 石がある場合は、標準のラベルマーカーを使用
          boardInstance.addObject({
            x: coords.x,
            y: coords.y,
            type: "LB",
            text: data.votes.toString()
          });
        }
      }
    });

    // 以前のクリックハンドラーを削除
    if (resultClickHandlerRef.current) {
      boardInstance.removeEventListener("click", resultClickHandlerRef.current);
    }

    // 新しいクリックハンドラーを定義して保存
    resultClickHandlerRef.current = (x: number, y: number) => {
      const coordinate = wgoToSgfCoords(x, y);
      console.log(`Click at (${x}, ${y}), SGF coord: ${coordinate}`);
      console.log('Available results:', Object.keys(results));
      
      if (results[coordinate]) {
        console.log('Found result for coordinate:', coordinate, results[coordinate]);
        showAnswerDetails(coordinate, results[coordinate]);
      } else {
        console.log('No result found for coordinate:', coordinate);
      }
    };

    // クリック時の詳細表示
    boardInstance.addEventListener("click", resultClickHandlerRef.current);
  };

  // 簡易SGFパーサー
  const parseSgfMoves = (sgfContent: string) => {
    const moves: Array<{color: number, x: number, y: number}> = [];
    
    // SGFから手順を順番通りに抽出（黒番Bと白番Wを交互に）
    const movePattern = /;([BW])\[([a-s][a-s])\]/g;
    let match;
    
    while ((match = movePattern.exec(sgfContent)) !== null) {
      const color = match[1] === 'B' ? window.WGo.B : window.WGo.W;
      const coords = match[2];
      
      if (coords && coords.length === 2) {
        const x = coords.charCodeAt(0) - 'a'.charCodeAt(0);
        const y = coords.charCodeAt(1) - 'a'.charCodeAt(0);
        moves.push({ color, x, y });
      }
    }
    
    return moves;
  };

  // 座標変換（公式座標システム準拠）
  const sgfToWgoCoords = (sgfCoord: string): { x: number; y: number } => {
    if (!sgfCoord || sgfCoord.length !== 2) return { x: -1, y: -1 };
    
    const x = sgfCoord.charCodeAt(0) - 'a'.charCodeAt(0); // a=0, b=1, ...
    const y = sgfCoord.charCodeAt(1) - 'a'.charCodeAt(0);
    
    return { x, y };
  };

  const wgoToSgfCoords = (x: number, y: number): string => {
    return String.fromCharCode('a'.charCodeAt(0) + x) + 
           String.fromCharCode('a'.charCodeAt(0) + y);
  };

  // 得票数による色分け
  const getColorByVotes = (votes: number): string => {
    if (votes >= 10) return "#ff4757"; // 赤色（10票以上）
    if (votes >= 5) return "#ffa502";  // 橙色（5-9票）
    return "#57a4ff";                  // 青色（1-4票）
  };

  // 回答詳細表示
  const showAnswerDetails = (coordinate: string, data: { votes: number; answers: any[] }) => {
    const displayCoord = sgfToDisplayCoordinate(coordinate);
    console.log('showAnswerDetails called:', {
      sgfCoord: coordinate,
      displayCoord: displayCoord,
      data: data
    });
    
    const event = new CustomEvent('showAnswerDetails', {
      detail: { coordinate: displayCoord, data }
    });
    window.dispatchEvent(event);
    console.log('CustomEvent dispatched');
  };

  // SGF座標を標準囲碁記法（A1〜T19）に変換
  const sgfToDisplayCoordinate = (sgfCoord: string): string => {
    if (!sgfCoord || sgfCoord.length !== 2) return '';
    
    const x = sgfCoord.charCodeAt(0) - 'a'.charCodeAt(0);
    const y = sgfCoord.charCodeAt(1) - 'a'.charCodeAt(0);
    
    const letters = 'ABCDEFGHJKLMNOPQRST'; // I除く
    const letter = letters[x];
    const number = 19 - y; // SGFは上から下、表示は下から上
    
    return `${letter}${number}`;
  };

  if (!isWgoLoaded) {
    return (
      <div className="igomon-board-loading" style={{ width: '360px', height: '360px', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
        <p>WGo.jsを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="igomon-board-container" style={{ position: 'relative', display: 'inline-block' }}>
      <div 
        ref={boardRef} 
        className="igomon-board"
        style={{ 
          position: 'relative',
          width: '360px', 
          height: '360px',
          border: '1px solid #333',
          backgroundColor: '#DEB887' // フォールバックの背景色
        }}
      />
      {showClickable && (
        <p className="board-instruction">
          盤面をクリックして着手点を選択してください
        </p>
      )}
    </div>
  );
}