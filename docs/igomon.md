# 囲碁アンケートサイト「いごもん」仕様書

## 1. サイトコンセプト

序盤や中盤など、手の選択肢が広い局面において、「なぜそこに打ちたいのか」という『着手の理由』を集めることを目的としたアンケートサイトである。

多くの人の意見を集めるため、原則として回答者のみが他のユーザーの回答結果を閲覧できる形式とする。

級位者から高段者まで、幅広い棋力層のユーザーが気軽に参加できるよう、シンプルで使いやすいシステムを目指す。

## 2. 機能要件

### 2.1. アンケート回答ページ (/questionnaire/{problem_id})

各問題ごとに、一意のURLを持つアンケート回答ページを生成する [user request]。

ページには、SGFファイルから読み込んだ問題の盤面が表示される [user request]。表示する手数は、description.txtのmovesパラメータで指定された手数まで（指定がない場合は最終手まで）とする。

盤面上では、最終着手が視覚的に識別できるよう、最終手にマークが表示される。このマークは石の色に応じて自動的に調整される（黒石には白い円、白石には黒い円）。

ユーザーは盤面をクリックすることで着手点を選択でき、選択した座標はフォームに自動入力される。座標はUI上では標準囲碁記法（A1〜T19）で表示され、データベースにはSGF形式（aa, ab, ac...）で保存される。

ユーザーは着手を選択し、「着手の理由」「名前」「段位」を入力して回答を送信する。

「名前」と「段位」は、ユーザーのブラウザのローカルストレージに保存され、次回以降の回答時には自動で入力欄にセットされる（代案の採用） [user request]。

### 2.2. アンケート結果表示ページ

ユーザーがアンケートに回答を送信すると、その問題の結果表示ページへ遷移する。

結果ページでは、盤面上に各着手の得票数が数字で表示される。

得票数に応じて数字の背景色や文字色を変えることで、人気度を視覚的に分かりやすく表示する（例：得票数10以上は赤色、5-9票は橙色、1-4票は青色など）。

盤面の数字をクリックすると、その座標に投票したユーザーの回答（名前、段位、理由）の一覧が右側などに表示される。座標表示は標準囲碁記法（A1〜T19）を使用する。

### 2.3. 投稿削除機能

ユーザーは自分が投稿した回答を削除することができる。

削除機能は、ユーザーのブラウザのCookieまたはローカルストレージに保存された識別情報を用いて、自分の投稿のみを削除対象とする。

削除された回答は、データベースから完全に削除されるか、削除フラグを設定して非表示にする。

削除後は、該当する着手の得票数が減算され、結果表示ページに即座に反映される。

削除機能へのアクセスは、結果表示ページの回答一覧において、自分の投稿にのみ「削除」ボタンが表示される形式とする。

### 2.4. サイトトップページ (/)

サイトのトップページ (https://igomon.net/) では、作成された問題の一覧が表示される [user request]。

問題はdescription.txtに記載されたcreatedの日付を元に、新しいものが上に表示される（作成日時の新しい順） [user request]。

一覧には、問題の盤面サムネイル、問題番号、手番などの情報が表示されることが望ましい。

## 3. 非機能要件

### 3.1. ユーザー認証と識別

Google/XなどのSNSログイン機能は使用しない [user request]。

ユーザーの識別と「回答済みか否か」の判定は、ブラウザのCookieまたはローカルストレージを用いて行う [user request]。

これにより、同一ブラウザであれば、一度回答した問題の結果は閲覧できるが、Cookieを削除したり、別ブラウザでアクセスした場合は未回答の状態として扱われる。

### 3.2. データ永続化

ユーザーから送信されたアンケート回答（着手座標、理由、名前、段位）は、サーバーサイドの **SQLite データベース**に保存する。

**ORマッパー:** Prisma を使用（型安全性、スキーマ管理、マイグレーション機能のため）

SQLiteを選択する理由：

- XServerの共有サーバー環境に適している
- ファイルベースで管理が簡単
- バックアップは単純なファイルコピー
- 予想される負荷（数十の同時アクセス、数千の回答データ）に十分対応可能

ユーザー利便性のための「名前」「段位」の情報は、ユーザーのブラウザのローカルストレージに保存する [user request]。

### 3.3. URL設計とOGP

**サイトURL:** https://igomon.net/ [user request]

**問題ページURL:** /questionnaire/{problem_id} の形式（例: /questionnaire/1） [user request]

問題ページのURLは、X (旧Twitter) などで共有された際に直接アクセスできる必要がある [user request]。

Xで共有された際に分かりやすいカードが表示されるよう、OGP (Open Graph Protocol) を設定する。

- **OGP画像:** 問題の盤面画像（1200x630px、Twitter推奨サイズ）
- **OGPタイトル:** 問題番号や手番などのタイトル
- **OGP説明文:** 問題の説明文
- **OGP画像生成:** problems/ディレクトリに新規配置された時に自動生成

## 4. コンテンツ管理

### 4.1. 問題の作成方法

問題は、サーバーの `public/problems` ディレクトリに、問題ごとのサブディレクトリを配置することで生成される [user request]。

各問題のディレクトリには、盤面データである`kifu.sgf`ファイルと、問題情報を記述した`description.txt`ファイルを配置する [user request]。

**ディレクトリ構造例:**

```
igomon-app/
├── public/
│   └── problems/
│       ├── 1/
│       │   ├── kifu.sgf
│       │   └── description.txt
│       ├── 2/
│       │   ├── kifu.sgf
│       │   └── description.txt
│       └── 1515/
│           ├── kifu.sgf
│           └── description.txt
```

### 4.2. description.txt フォーマット

`description.txt`は、以下の「キー: 値」形式で記述する（提案の採用） [user request]。

```plaintext
id: 1515
turn: black
created: 2025-06-27
moves: 30
description: 着手とその理由を回答してください。
```

- **id:** (必須) ページに表示される問題番号。
- **turn:** (必須) 手番。black または white で指定。
- **created:** (必須) 問題の作成日。トップページでの並び替えに使用。
- **moves:** (任意) 表示する手数。指定がない場合は最終手まで表示。
- **description:** (必須) 盤の下に表示される説明文。

## 5. UIイメージ

### アンケート回答ページのイメージ

![アンケート回答ページ](docs/png/アンケート回答ページイメージ.png)

### アンケート結果表示ページのイメージ

![アンケート結果表示ページ](docs/png/アンケート結果ページイメージ2.png)

### サイトトップページのイメージ

![サイトトップページ](docs/png/サイトトップページイメージ.png)

## 6. 実装対象外（除外機能）

以下の機能は、今回の実装範囲に含まない。

- Google/Xアカウント等を利用したログイン機能
- 回答に対する「いいね」「よくない」ボタン
- サイトトップページの検索機能、最近の投稿・コメント欄
- アンケート結果のCSV形式でのデータ収集機能 [user request]
- ユーザーによる回答の編集機能（削除機能は実装対象）

## 7. 技術仕様詳細

### 7.1. ユーザー識別システム

**ユーザーID生成:**

- 投稿時にUUID（v4）を生成してユーザーを識別
- UUIDはローカルストレージに保存（推奨）
- サーバー側では認証なしで、UUIDの一致確認により投稿者を特定
- UUID衝突対策として、crypto.randomUUID()を使用（暗号学的に安全）

**実装方針:**

```javascript
// 初回アクセス時またはUUIDが存在しない場合
const userUuid = localStorage.getItem('igomon_user_uuid') || crypto.randomUUID()
localStorage.setItem('igomon_user_uuid', userUuid)
```

### 7.2. 削除機能の実装

**削除方式:** 論理削除（物理削除は行わない）

**削除フロー:**

1. ユーザーが自分の投稿の「削除」ボタンをクリック
2. フロントエンドからローカルストレージのUUIDを含むDELETEリクエスト送信
3. サーバー側でUUIDの一致を確認
4. `is_deleted`フラグをtrueに更新
5. 得票数を再計算して結果表示を更新

**削除権限:**

- 結果表示ページで自分の投稿のみに「削除」ボタンを表示
- UUIDが一致する投稿のみ削除可能

### 7.3. SGFファイル処理

**使用ライブラリ:** WGo.js

- https://wgo.waltheri.net/download からダウンロードして使用
- SGF解析、盤面描画、座標変換を統合サポート
- Canvas/SVG両対応でレスポンシブ
- 19路盤のみ対応

**表示仕様:**

- SGFファイルから指定手数まで（またはdescription.txtのmovesパラメータまで）の局面を表示
- movesパラメータが指定されていない場合は最終手まで表示
- コメントやバリエーションは無視する
- ユーザーは盤面クリックで着手点を選択
- クリック座標は自動的にSGF形式に変換してフォームに入力

**座標システム:**

- データベース保存: SGF座標（aa, ab, ac...）
- 内部処理: 数値座標 (0,0)〜(18,18)
- UI表示: 標準囲碁記法（A1〜T19）
- WGo.jsの座標変換機能を活用

**座標の対応関係:**

- A19 = WGo.js (0, 0) = SGF "aa"
- T19 = WGo.js (18, 0) = SGF "sa"
- A1 = WGo.js (0, 18) = SGF "as"
- T1 = WGo.js (18, 18) = SGF "ss"

#### WGo.jsによる投票数表示機能

**WGo.Board APIを使用した盤面上の投票数表示:**

WGo.jsの`addObject()`メソッドを使用して、碁盤上の各交点に投票数を表示する。実装方法は以下の通り：

1. **ラベルマーカー（"LB"）の使用**
   - WGo.jsの組み込みマーカー"LB"（Label）を使用
   - 石の上に投票数の数字を重ねて表示
   - `board.addObject({x, y, type: "LB", text: "票数"})`

2. **実装例**

```javascript
// 各投票データに対して石とラベルを配置
votes.forEach((v) => {
  board.addObject({ x: v.x, y: v.y, c: WGo.B }) // 石を配置
  board.addObject({ x: v.x, y: v.y, type: 'LB', text: String(v.votes) }) // 票数ラベル
})
```

3. **投票数による色分け表示**
   - カスタム描画ハンドラを作成して背景色を制御
   - 得票数に応じた色分け（例：10票以上は赤、5-9票は橙、1-4票は青）
   - `WGo.Board.DrawHandler`インターフェースを実装

### 7.4. データベース設計（Prisma + SQLite）

**Prismaスキーマ:**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./igomon.db"
}

model Problem {
  id          Int      @id
  sgfFilePath String   @map("sgf_file_path")
  description String
  turn        String   // "black" or "white"
  createdDate String   @map("created_date")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  answers     Answer[]

  @@map("problems")
}

model Answer {
  id          Int      @id @default(autoincrement())
  problemId   Int      @map("problem_id")
  userUuid    String   @map("user_uuid")
  coordinate  String   // SGF座標 (aa, ab, etc.)
  reason      String
  playerName  String   @map("player_name")
  playerRank  String   @map("player_rank")
  isDeleted   Boolean  @default(false) @map("is_deleted")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  problem     Problem  @relation(fields: [problemId], references: [id])

  @@index([problemId])
  @@index([userUuid])
  @@index([coordinate])
  @@index([isDeleted])
  @@map("answers")
}
```

### 7.5. 結果表示機能

**盤面表示:**

- WGo.jsを使用して盤面上に得票数を数字で表示
- 得票数に応じた色分けやサイズ調整が可能
- 数字クリック時に該当座標の回答一覧を表示

**実装例:**

```javascript
// 結果データを盤面に表示
results.forEach((result) => {
  const coords = sgfToWgoCoords(result.coordinate)
  board.addObject({
    x: coords.x,
    y: coords.y,
    type: 'mark',
    mark: {
      type: 'label',
      text: result.votes.toString(),
      color: getColorByVotes(result.votes),
    },
  })
})

// 座標変換関数
function sgfToWgoCoords(sgf) {
  const x = sgf.charCodeAt(0) - 'a'.charCodeAt(0)
  const y = sgf.charCodeAt(1) - 'a'.charCodeAt(0)
  return { x, y }
}

function wgoToSgfCoords(x, y) {
  return String.fromCharCode('a'.charCodeAt(0) + x) + String.fromCharCode('a'.charCodeAt(0) + y)
}

function wgoToStandardNotation(x, y) {
  const letters = 'ABCDEFGHJKLMNOPQRST' // Iを除く
  return letters[x] + (19 - y)
}
```

### 7.6. OGP画像生成

**推奨方法:** Node.js + Canvas

**実装戦略:**

1. problems/ディレクトリに新規ファイルが配置された時に自動実行
2. SGFファイルを解析して盤面状態を取得（movesパラメータまで）
3. Canvasで19x19の碁盤を描画
4. 石を配置して1200x630pxのPNG画像として生成
5. public/ogp/problem\_{id}.png として保存
6. 画像にタイトルや問題番号は含めない（盤面のみ）

**実装例:**

```javascript
const { createCanvas } = require('canvas')

function generateOgpImage(sgfContent, problemId) {
  const canvas = createCanvas(600, 600)
  const ctx = canvas.getContext('2d')

  // 碁盤を描画
  drawBoard(ctx)

  // SGFから石の配置を読み込んで描画
  const stones = parseSgf(sgfContent)
  drawStones(ctx, stones)

  // PNG画像として保存
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(`public/ogp/problem_${problemId}.png`, buffer)
}
```

### 7.7. API設計

**主要エンドポイント:**

```
GET  /questionnaire/{problem_id}     # アンケート回答ページ
POST /api/answers                    # 回答投稿
GET  /api/results/{problem_id}       # 結果取得
DELETE /api/answers/{answer_id}      # 回答削除（論理削除）
GET  /api/problems                   # 問題一覧
GET  /api/sgf/{problem_id}          # SGFファイル取得
```

**投稿データ形式:**

```json
{
  "problem_id": 1,
  "user_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "coordinate": "dd",
  "reason": "この手が最も効率的だと思います",
  "player_name": "田中太郎",
  "player_rank": "3段"
}
```

## 8. XServer向け統合技術構成

### 8.1. 推奨技術スタック

**フルスタック構成:**

- **フロントエンド:** React + TypeScript
- **バックエンド:** Express.js + TypeScript
- **データベース:** SQLite + Prisma
- **碁盤表示:** WGo.js
- **OGP画像生成:** Node.js Canvas
- **デプロイ:** XServer Node.js環境

### 8.2. プロジェクト構成

```
igomon-app/
├── prisma/
│   ├── schema.prisma              // Prismaスキーマ
│   └── migrations/                // マイグレーションファイル
├── server/
│   ├── index.ts                   // Express.jsサーバー（PM2/forever不要）
│   ├── routes/
│   │   ├── api.ts                 // API ルート
│   │   ├── answers.ts             // 回答関連API
│   │   └── problems.ts            // 問題関連API
│   └── utils/
│       ├── sgf-parser.ts          // SGF処理（手数指定対応）
│       └── ogp-generator.ts       // OGP画像生成
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GoBoard.tsx        // WGo.js碁盤コンポーネント
│   │   │   ├── AnswerForm.tsx     // 回答フォーム
│   │   │   └── ResultsDisplay.tsx // 結果表示
│   │   ├── pages/
│   │   │   ├── Home.tsx           // トップページ
│   │   │   ├── Questionnaire.tsx  // アンケートページ
│   │   │   └── Results.tsx        // 結果ページ
│   │   ├── utils/
│   │   │   ├── api.ts             // API呼び出し
│   │   │   └── uuid.ts            // UUID管理
│   │   └── App.tsx
├── public/
│   ├── wgo/                       // WGo.jsライブラリファイル
│   │   ├── wgo.min.js            // メインライブラリ
│   │   ├── wgo.player.min.js     // プレイヤー機能（必要に応じて）
│   │   └── assets/               // テクスチャ・スタイルファイル
│   ├── problems/                  // SGFファイル
│   ├── ogp/                      // 生成OGP画像
│   └── dist/                     // ビルド済みフロントエンド
├── lib/
│   └── database.ts               // Prisma Client操作
├── package.json
├── tsconfig.json
└── igomon.db                     // SQLiteデータベースファイル
```

### 8.3. 依存関係

```json
{
  "name": "igomon-app",
  "version": "1.0.0",
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
    "chokidar": "^3.5.0",
    "cors": "^2.8.5",
    "express": "^4.18.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "socket.io": "^4.7.0",
    "socket.io-client": "^4.7.0",
    "canvas": "^2.11.0",
    "uuid": "^9.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "typescript": "^5.0.0",
    "@types/chokidar": "^3.5.0",
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "@types/socket.io": "^3.0.0",
    "@types/uuid": "^9.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "nodemon": "^3.0.0",
    "ts-node": "^10.0.0",
    "vite": "^4.0.0"
  },
  "scripts": {
    "dev:client": "vite",
    "dev:server": "nodemon --exec ts-node server/index.ts",
    "build:client": "vite build --outDir ../public/dist",
    "build:server": "tsc server/index.ts --outDir dist",
    "start": "node dist/server/index.js",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  }
}
```

### 8.4. データベース操作（Prisma実装）

```typescript
// lib/database.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 回答の保存
export async function saveAnswer(answerData: {
  problemId: number
  userUuid: string
  coordinate: string
  reason: string
  playerName: string
  playerRank: string
}) {
  return await prisma.answer.create({
    data: answerData,
  })
}

// 結果の取得
export async function getResults(problemId: number) {
  const answers = await prisma.answer.findMany({
    where: {
      problemId: problemId,
      isDeleted: false,
    },
    orderBy: { createdAt: 'asc' },
  })

  // 座標ごとの集計
  const results: Record<string, { votes: number; answers: any[] }> = {}
  answers.forEach((answer) => {
    if (!results[answer.coordinate]) {
      results[answer.coordinate] = { votes: 0, answers: [] }
    }
    results[answer.coordinate].votes++
    results[answer.coordinate].answers.push(answer)
  })

  return results
}

// 回答の削除（論理削除）
export async function deleteAnswer(answerId: number, userUuid: string) {
  const result = await prisma.answer.updateMany({
    where: {
      id: answerId,
      userUuid: userUuid,
      isDeleted: false,
    },
    data: {
      isDeleted: true,
      updatedAt: new Date(),
    },
  })

  return result.count > 0
}

// 問題一覧の取得
export async function getProblems() {
  return await prisma.problem.findMany({
    orderBy: { createdDate: 'desc' },
    include: {
      _count: {
        select: {
          answers: {
            where: { isDeleted: false },
          },
        },
      },
    },
  })
}

// 問題の詳細取得
export async function getProblem(problemId: number) {
  return await prisma.problem.findUnique({
    where: { id: problemId },
  })
}

// 問題の存在確認（ID重複チェック用）
export async function problemExists(problemId: number) {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: { id: true },
  })
  return !!problem
}

// ユーザーが既に回答済みかチェック
export async function hasUserAnswered(problemId: number, userUuid: string) {
  const answer = await prisma.answer.findFirst({
    where: {
      problemId: problemId,
      userUuid: userUuid,
      isDeleted: false,
    },
  })
  return !!answer
}

export default prisma
```

### 8.5. API実装例（Express.js + Prisma）

```typescript
// server/routes/api.ts
import express from 'express'
import {
  saveAnswer,
  getResults,
  deleteAnswer,
  getProblems,
  getProblem,
  hasUserAnswered,
} from '../lib/database'

const router = express.Router()

// 回答投稿
router.post('/answers', async (req, res) => {
  try {
    const { problemId, userUuid, coordinate, reason, playerName, playerRank } = req.body

    // 既に回答済みかチェック
    const alreadyAnswered = await hasUserAnswered(problemId, userUuid)
    if (alreadyAnswered) {
      return res.status(400).json({ error: 'Already answered this problem' })
    }

    const result = await saveAnswer({
      problemId,
      userUuid,
      coordinate,
      reason,
      playerName,
      playerRank,
    })

    res.json(result)
  } catch (error) {
    console.error('Error saving answer:', error)
    res.status(500).json({ error: 'Failed to save answer' })
  }
})

// 結果取得
router.get('/results/:problemId', async (req, res) => {
  try {
    const problemId = parseInt(req.params.problemId)
    const results = await getResults(problemId)
    res.json(results)
  } catch (error) {
    console.error('Error getting results:', error)
    res.status(500).json({ error: 'Failed to get results' })
  }
})

// 回答削除
router.delete('/answers/:answerId', async (req, res) => {
  try {
    const answerId = parseInt(req.params.answerId)
    const { userUuid } = req.body

    const success = await deleteAnswer(answerId, userUuid)

    if (success) {
      res.json({ success: true })
    } else {
      res.status(404).json({ error: 'Answer not found or not authorized' })
    }
  } catch (error) {
    console.error('Error deleting answer:', error)
    res.status(500).json({ error: 'Failed to delete answer' })
  }
})

// 問題一覧取得
router.get('/problems', async (req, res) => {
  try {
    const problems = await getProblems()
    res.json(problems)
  } catch (error) {
    console.error('Error getting problems:', error)
    res.status(500).json({ error: 'Failed to get problems' })
  }
})

// 問題詳細取得
router.get('/problems/:problemId', async (req, res) => {
  try {
    const problemId = parseInt(req.params.problemId)
    const problem = await getProblem(problemId)

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' })
    }

    res.json(problem)
  } catch (error) {
    console.error('Error getting problem:', error)
    res.status(500).json({ error: 'Failed to get problem' })
  }
})

// SGFファイル取得
router.get('/sgf/:problemId', (req, res) => {
  try {
    const problemId = req.params.problemId
    const problemData = loadProblemFromDirectory(problemId)

    if (!problemData) {
      return res.status(404).json({ error: 'Problem not found' })
    }

    res.setHeader('Content-Type', 'application/x-go-sgf')
    res.send(problemData.sgfContent)
  } catch (error) {
    console.error('Error getting SGF:', error)
    res.status(500).json({ error: 'Failed to get SGF' })
  }
})

// 問題一覧取得（ファイルベース + データベース統合）
router.get('/problems', async (req, res) => {
  try {
    // ファイルシステムから問題一覧を取得
    const fileProblems = getAllProblems()

    // データベースの回答数も含めて返す
    const problemsWithCounts = await Promise.all(
      fileProblems.map(async (problem) => {
        const answerCount = await prisma.answer.count({
          where: {
            problemId: problem.id,
            isDeleted: false,
          },
        })

        return {
          ...problem,
          answerCount,
        }
      }),
    )

    res.json(problemsWithCounts)
  } catch (error) {
    console.error('Error getting problems:', error)
    res.status(500).json({ error: 'Failed to get problems' })
  }
})
```

### 8.6. Expressサーバー設定

```typescript
// server/index.ts
import express from 'express'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import cors from 'cors'
import path from 'path'
import apiRoutes from './routes/api'
import { ProblemWatcher } from './utils/file-watcher'
import { getAllProblems } from './utils/problem-loader'

const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

const port = process.env.PORT || 3000

// ミドルウェア
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静的ファイル配信
app.use(express.static(path.join(__dirname, '../public/dist')))
app.use('/wgo', express.static(path.join(__dirname, '../public/wgo'))) // WGo.js配信
app.use('/problems', express.static(path.join(__dirname, '../public/problems')))
app.use('/ogp', express.static(path.join(__dirname, '../public/ogp')))

// API ルート
app.use('/api', apiRoutes)

// WebSocket接続処理
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // 接続時に現在の問題一覧を送信
  socket.emit('initialProblems', getAllProblems())

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// ファイル監視を開始
const problemWatcher = new ProblemWatcher(io)

// SPA用のフォールバック
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dist/index.html'))
})

// サーバー終了時のクリーンアップ
process.on('SIGTERM', () => {
  problemWatcher.destroy()
  server.close()
})

server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
```

### 8.7. フロントエンド実装例

```typescript
// client/src/utils/uuid.ts
export function getUserUuid(): string {
  let uuid = localStorage.getItem('igomon_user_uuid')
  if (!uuid) {
    uuid = crypto.randomUUID()
    localStorage.setItem('igomon_user_uuid', uuid)
  }
  return uuid
}

// client/src/utils/api.ts
export async function submitAnswer(answerData: {
  problemId: number
  coordinate: string
  reason: string
  playerName: string
  playerRank: string
}) {
  const userUuid = getUserUuid()

  const response = await fetch('/api/answers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...answerData,
      userUuid,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to submit answer')
  }

  return response.json()
}

export async function getResults(problemId: number) {
  const response = await fetch(`/api/results/${problemId}`)
  if (!response.ok) {
    throw new Error('Failed to get results')
  }
  return response.json()
}

export async function deleteAnswer(answerId: number) {
  const userUuid = getUserUuid()

  const response = await fetch(`/api/answers/${answerId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userUuid }),
  })

  if (!response.ok) {
    throw new Error('Failed to delete answer')
  }

  return response.json()
}
```

### 8.8. Prismaセットアップコマンド

```bash
# プロジェクト初期化
npm init -y

# 依存関係インストール
npm install

# Prismaの初期化（SQLite用）
npx prisma init --datasource-provider sqlite

# マイグレーション実行
npx prisma migrate dev --name init

# Prisma Clientの生成
npx prisma generate

# 開発用データベース確認
npx prisma studio

# 開発サーバー起動
npm run dev:client  # フロントエンド
npm run dev:server  # バックエンド
```

### 8.9. XServerデプロイ手順

1. **ビルド実行:**

```bash
npm run build:client  # React アプリのビルド
npm run build:server  # TypeScript サーバーのビルド
```

2. **ファイルアップロード:**

- `public/dist/` → XServer 公開ディレクトリ
- `dist/server/` → Node.js アプリディレクトリ
- `prisma/` → Prisma 設定ファイル
- `igomon.db` → SQLite データベースファイル

3. **XServer での起動設定:**

```javascript
// XServer用の起動ファイル
const app = require('./dist/server/index.js')
```

この構成により、XServerの制約下でもPrismaを使用した型安全で保守しやすい「いごもん」アプリケーションを構築できます。

### 8.10. 問題ファイル読み込み処理

```typescript
// server/utils/problem-loader.ts
import fs from 'fs'
import path from 'path'

interface ProblemData {
  id: number
  turn: string
  createdDate: string
  description: string
  sgfContent: string
}

export function loadProblemFromDirectory(problemId: string): ProblemData | null {
  const problemDir = path.join(__dirname, '../../public/problems', problemId)

  try {
    // description.txt の読み込み
    const descriptionPath = path.join(problemDir, 'description.txt')
    const descriptionContent = fs.readFileSync(descriptionPath, 'utf-8')

    // SGFファイルの読み込み
    const sgfPath = path.join(problemDir, 'kifu.sgf')
    const sgfContent = fs.readFileSync(sgfPath, 'utf-8')

    // description.txt のパース
    const problemData = parseDescriptionFile(descriptionContent)

    return {
      ...problemData,
      sgfContent,
    }
  } catch (error) {
    console.error(`Failed to load problem ${problemId}:`, error)
    return null
  }
}

function parseDescriptionFile(content: string): Omit<ProblemData, 'sgfContent'> {
  const lines = content.trim().split('\n')
  const data: any = {}

  lines.forEach((line) => {
    const [key, ...valueParts] = line.split(':')
    if (key && valueParts.length > 0) {
      data[key.trim()] = valueParts.join(':').trim()
    }
  })

  // 必須項目のチェック
  if (!data.id || !data.turn || !data.created || !data.description) {
    throw new Error('必須項目が不足しています: id, turn, created, description')
  }

  return {
    id: parseInt(data.id),
    turn: data.turn,
    createdDate: data.created,
    description: data.description,
    moves: data.moves ? parseInt(data.moves) : undefined,
  }
}

// 全問題の一覧を取得
export function getAllProblems(): ProblemData[] {
  const problemsDir = path.join(__dirname, '../../public/problems')

  try {
    const problemDirs = fs
      .readdirSync(problemsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    const problems: ProblemData[] = []

    problemDirs.forEach((dirName) => {
      const problemData = loadProblemFromDirectory(dirName)
      if (problemData) {
        problems.push(problemData)
      }
    })

    // 作成日時順でソート（新しい順）
    return problems.sort(
      (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
    )
  } catch (error) {
    console.error('Failed to load problems:', error)
    return []
  }
}
```

### 8.11. リアルタイム問題一覧更新機能

**実装方式:** ファイルシステム監視 + WebSocket

新しい問題が `public/problems/` ディレクトリに追加された際に、トップページの問題一覧にリアルタイムで反映される機能を実装する。

**技術構成:**

- Node.js `chokidar` ライブラリでファイルシステム監視
- Socket.io でWebSocket通信
- クライアントサイドでリアルタイム更新

**サーバーサイド実装:**

```typescript
// server/utils/file-watcher.ts
import chokidar from 'chokidar'
import { Server as SocketIOServer } from 'socket.io'
import path from 'path'
import { loadProblemFromDirectory, getAllProblems } from './problem-loader'

export class ProblemWatcher {
  private io: SocketIOServer
  private watcher: chokidar.FSWatcher
  private problemsDir: string

  constructor(io: SocketIOServer) {
    this.io = io
    this.problemsDir = path.join(__dirname, '../../public/problems')
    this.initializeWatcher()
  }

  private initializeWatcher() {
    // problems ディレクトリの変更を監視
    this.watcher = chokidar.watch(this.problemsDir, {
      ignored: /node_modules/,
      persistent: true,
      depth: 2, // 問題ディレクトリ内のファイルまで監視
    })

    // 新しいディレクトリが追加された場合
    this.watcher.on('addDir', (dirPath) => {
      if (this.isProblemDirectory(dirPath)) {
        this.handleNewProblem(dirPath)
      }
    })

    // ファイルが追加された場合（description.txt や kifu.sgf）
    this.watcher.on('add', (filePath) => {
      if (this.isRelevantFile(filePath)) {
        const problemDir = path.dirname(filePath)
        this.handleProblemUpdate(problemDir)
      }
    })

    // ファイルが変更された場合
    this.watcher.on('change', (filePath) => {
      if (this.isRelevantFile(filePath)) {
        const problemDir = path.dirname(filePath)
        this.handleProblemUpdate(problemDir)
      }
    })

    console.log('File watcher initialized for problems directory')
  }

  private isProblemDirectory(dirPath: string): boolean {
    const relativePath = path.relative(this.problemsDir, dirPath)
    // problems ディレクトリ直下のディレクトリかつ、数字のディレクトリ名
    return relativePath.split(path.sep).length === 1 && /^\d+$/.test(path.basename(dirPath))
  }

  private isRelevantFile(filePath: string): boolean {
    const fileName = path.basename(filePath)
    return fileName === 'description.txt' || fileName === 'kifu.sgf'
  }

  private async handleNewProblem(dirPath: string) {
    const problemId = path.basename(dirPath)
    console.log(`New problem detected: ${problemId}`)

    // 少し待ってからファイルを読み込み（ファイルコピーが完了するまで）
    setTimeout(() => {
      this.handleProblemUpdate(dirPath)
    }, 1000)
  }

  private async handleProblemUpdate(dirPath: string) {
    const problemId = path.basename(dirPath)

    try {
      // 問題データを読み込み
      const problemData = loadProblemFromDirectory(problemId)

      if (problemData) {
        console.log(`Problem updated: ${problemId}`)

        // 全クライアントに更新を通知
        this.io.emit('problemUpdated', {
          type: 'update',
          problem: problemData,
        })

        // 問題一覧全体も送信（新規追加の場合）
        const allProblems = getAllProblems()
        this.io.emit('problemsListUpdated', allProblems)
      }
    } catch (error) {
      console.error(`Error loading problem ${problemId}:`, error)
    }
  }

  public destroy() {
    if (this.watcher) {
      this.watcher.close()
    }
  }
}
```

**Express + Socket.io サーバー設定（更新版）:**

```typescript
// server/index.ts（リアルタイム更新対応版）
import express from 'express'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import cors from 'cors'
import path from 'path'
import apiRoutes from './routes/api'
import { ProblemWatcher } from './utils/file-watcher'
import { getAllProblems } from './utils/problem-loader'

const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

const port = process.env.PORT || 3000

// ミドルウェア
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静的ファイル配信
app.use(express.static(path.join(__dirname, '../public/dist')))
app.use('/wgo', express.static(path.join(__dirname, '../public/wgo'))) // WGo.js配信
app.use('/problems', express.static(path.join(__dirname, '../public/problems')))
app.use('/ogp', express.static(path.join(__dirname, '../public/ogp')))

// API ルート
app.use('/api', apiRoutes)

// WebSocket接続処理
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // 接続時に現在の問題一覧を送信
  socket.emit('initialProblems', getAllProblems())

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// ファイル監視を開始
const problemWatcher = new ProblemWatcher(io)

// SPA用のフォールバック
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dist/index.html'))
})

// サーバー終了時のクリーンアップ
process.on('SIGTERM', () => {
  problemWatcher.destroy()
  server.close()
})

server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
```

**クライアントサイド実装:**

```typescript
// client/src/hooks/useRealTimeProblems.ts
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface Problem {
  id: number
  description: string
  turn: string
  createdDate: string
  answerCount?: number
}

export function useRealTimeProblems() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Socket.io接続
    const newSocket = io()
    setSocket(newSocket)

    // 接続状態の管理
    newSocket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    // 初期問題一覧受信
    newSocket.on('initialProblems', (initialProblems: Problem[]) => {
      console.log('Received initial problems:', initialProblems)
      setProblems(initialProblems)
    })

    // 問題一覧更新受信
    newSocket.on('problemsListUpdated', (updatedProblems: Problem[]) => {
      console.log('Problems list updated:', updatedProblems)
      setProblems(updatedProblems)
    })

    // 個別問題更新受信
    newSocket.on('problemUpdated', (data: { type: string; problem: Problem }) => {
      console.log('Problem updated:', data)

      if (data.type === 'update') {
        setProblems((prev) => {
          const existingIndex = prev.findIndex((p) => p.id === data.problem.id)
          if (existingIndex >= 0) {
            // 既存問題の更新
            const updated = [...prev]
            updated[existingIndex] = data.problem
            return updated
          } else {
            // 新規問題の追加
            return [data.problem, ...prev].sort(
              (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
            )
          }
        })
      }
    })

    // クリーンアップ
    return () => {
      newSocket.close()
    }
  }, [])

  return {
    problems,
    isConnected,
    socket,
  }
}
```

**トップページコンポーネント:**

```typescript
// client/src/pages/Home.tsx
import React from 'react';
import { useRealTimeProblems } from '../hooks/useRealTimeProblems';

export function Home() {
  const { problems, isConnected } = useRealTimeProblems();

  return (
    <div className="home-page">
      <header>
        <h1>いごもん - 囲碁アンケートサイト</h1>
        <div className="connection-status">
          {isConnected ? (
            <span className="connected">🟢 リアルタイム更新中</span>
          ) : (
            <span className="disconnected">🔴 接続中...</span>
          )}
        </div>
      </header>

      <main>
        <div className="problems-list">
          {problems.length === 0 ? (
            <p>問題がありません</p>
          ) : (
            problems.map(problem => (
              <div key={problem.id} className="problem-card">
                <h3>問題 {problem.id}</h3>
                <p>{problem.description}</p>
                <div className="problem-meta">
                  <span>手番: {problem.turn === 'black' ? '黒番' : '白番'}</span>
                  <span>作成日: {problem.createdDate}</span>
                  {problem.answerCount !== undefined && (
                    <span>回答数: {problem.answerCount}</span>
                  )}
                </div>
                <a href={`/questionnaire/${problem.id}`} className="button">
                  回答する
                </a>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
```

### 8.12. API実装の更新（ファイル読み込み対応）

```typescript
// server/routes/api.ts に追加
import { loadProblemFromDirectory, getAllProblems } from '../utils/problem-loader'

// SGFファイル取得
router.get('/sgf/:problemId', (req, res) => {
  try {
    const problemId = req.params.problemId
    const problemData = loadProblemFromDirectory(problemId)

    if (!problemData) {
      return res.status(404).json({ error: 'Problem not found' })
    }

    res.setHeader('Content-Type', 'application/x-go-sgf')
    res.send(problemData.sgfContent)
  } catch (error) {
    console.error('Error getting SGF:', error)
    res.status(500).json({ error: 'Failed to get SGF' })
  }
})

// 問題一覧取得（ファイルベース + データベース統合）
router.get('/problems', async (req, res) => {
  try {
    // ファイルシステムから問題一覧を取得
    const fileProblems = getAllProblems()

    // データベースの回答数も含めて返す
    const problemsWithCounts = await Promise.all(
      fileProblems.map(async (problem) => {
        const answerCount = await prisma.answer.count({
          where: {
            problemId: problem.id,
            isDeleted: false,
          },
        })

        return {
          ...problem,
          answerCount,
        }
      }),
    )

    res.json(problemsWithCounts)
  } catch (error) {
    console.error('Error getting problems:', error)
    res.status(500).json({ error: 'Failed to get problems' })
  }
})
```

### 8.13. 依存関係の更新（リアルタイム機能追加）

```json
{
  "dependencies": {
    // ...existing dependencies...
    "socket.io": "^4.7.0",
    "socket.io-client": "^4.7.0",
    "chokidar": "^3.5.0"
  },
  "devDependencies": {
    // ...existing dependencies...
    "@types/socket.io": "^3.0.0"
  }
}
```

### 8.14. 運用上の注意点

**リアルタイム更新機能:**

- `public/problems/` ディレクトリに新しい問題を配置すると自動でトップページに反映
- ファイルコピー中の誤検知を避けるため、1秒の遅延処理を実装
- WebSocketが利用できない環境では、ポーリング方式への切り替えも可能

**問題配置手順:**

1. `public/problems/{問題番号}/` ディレクトリを作成（ID重複チェック実施）
2. `kifu.sgf` と `description.txt`（UTF-8）を配置
3. 自動的にOGP画像が生成される（1200x630px）
4. 自動的にトップページに反映される

**エラーハンドリング:**

- SGFファイルが不正な場合はエラーログを出力し、その問題はスキップ
- description.txtの必須項目が欠けている場合もエラーログを出力
- ネットワークエラー時の再試行処理は実装しない

**デプロイ方法:**

- Gitでクローンして展開
- PM2/foreverなどのプロセスマネージャーは使用しない
- 単純な`node server/index.js`で起動

### 8.15. WGo.jsライブラリの設置

**公式Getting Started に基づく設置方法:**

WGo.jsは囲碁のWebアプリケーションを簡単に作成するためのJavaScriptライブラリです。HTML5 canvasベースで、すべての新しいブラウザ（Android・iPhone含む）で動作します。

**1. ダウンロードと基本設置:**

```bash
# 公式サイトからダウンロード
# https://wgo.waltheri.net/download からWGo.jsファイルを取得
```

公式のBasic HTML構成例:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My page</title>
    <script type="text/javascript" src="wgo/wgo.min.js"></script>
  </head>
  <body>
    WGo.js application is here.
  </body>
</html>
```

#### WGo.jsの高度な実装技術

**SGF読み込みとプレイヤー機能:**

WGo.BasicPlayerを使用したSGFファイルの表示：

```javascript
var player = new WGo.BasicPlayer(element, {
  sgfFile: 'game.sgf',
})
```

**標準マーカーの種類と使用方法:**

- **"LB"**: ラベル（任意の文字列を表示）
- **"TR"**: 三角形マーカー
- **"SQ"**: 四角形マーカー
- **"CR"**: 丸印マーカー

これらは`WGo.Board.drawHandlers`として定義されており、`board.addObject()`で使用可能。

**カスタム描画ハンドラによる投票数表示:**

投票数に応じた色付き番号マーカーの実装手順：

1. **色決定関数の作成**
   - 投票数から背景色を決定（少なければ緑系、多ければ赤系）

2. **カスタムDrawHandlerの実装**
   - `board.getX(x)`, `board.getY(y)`で交点のキャンバス座標を取得
   - CanvasRenderingContext2DのAPIで円や四角を描画
   - 中央にテキストを配置（`textAlign="center"`, `textBaseline="middle"`）

3. **マーカー配置**
   - カスタムハンドラを使用して`board.addObject`で配置
   - 例：`{x:3, y:3, type: voteMarker, text: "12"}`

**2. いごもん用ファイル配置:**

```
public/wgo/
├── wgo.min.js                    // メインライブラリ（必須）
├── wgo.js                        // 開発用非圧縮版（デバッグ時用）
├── wgo.player.min.js            // プレイヤー機能（SGF表示機能等）
├── assets/                       // テクスチャファイル
│   ├── wood1.jpg                // 木目背景（デフォルト）
│   ├── wood2.jpg                // 木目背景（推奨）
│   ├── shell.png                // 白石テクスチャ
│   ├── slate.png                // 黒石テクスチャ
│   └── shadow.png               // 影テクスチャ
└── themes/                       // スタイルシート
    ├── default.css              // デフォルトスタイル
    └── compact.css              // コンパクトスタイル
```

**3. HTMLでの読み込み（公式推奨方式）:**

```html
<!-- client/public/index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>いごもん - 囲碁アンケートサイト</title>
    <!-- WGo.js公式推奨の読み込み方法 -->
    <script type="text/javascript" src="/wgo/wgo.min.js"></script>
    <!-- オプション: プレイヤー機能が必要な場合 -->
    <script type="text/javascript" src="/wgo/wgo.player.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <!-- React appがここにマウントされる -->
  </body>
</html>
```

**4. WGo.js主要コンポーネント説明:**

公式ドキュメントに基づく主要コンポーネント:

- **WGo.Board** - HTML5 canvasベースの碁盤描画
  - 碁石の配置・削除
  - カスタムマーカーの表示
  - マウスイベントハンドリング
  - 座標システム（相対座標・絶対座標）

- **WGo.Game** - ゲームロジック
  - 手順の管理
  - 着手判定（コウ・自殺手等）
  - 取った石の計算

- **WGo.Position** - 盤面状態の保存・復元

**5. 基本的なBoard初期化（公式チュートリアル準拠）:**

```javascript
// 公式チュートリアルの基本例
var board = new WGo.Board(document.getElementById('board'), {
  width: 600,
})

// セクション表示（盤面の一部のみ表示）
var board = new WGo.Board(document.getElementById('board'), {
  width: 600,
  section: {
    top: 12,
    left: 6,
    right: 0,
    bottom: 0,
  },
})

// マウスイベント処理
board.addEventListener('click', function (x, y) {
  // 黒石を配置
  board.addObject({
    x: x,
    y: y,
    c: WGo.B,
  })
})
```

**6. いごもん用GoBoard.tsxの実装例（公式API準拠）:**

```typescript
// client/src/components/GoBoard.tsx
'use client';
import { useEffect, useRef, useState } from 'react';

interface GoBoardProps {
  sgfContent: string;
  onCoordinateSelect?: (coordinate: string) => void;
  showClickable?: boolean;
  resultsData?: Record<string, { votes: number; answers: any[] }>;
  maxMoves?: number; // movesパラメータ対応
  derivedTurn: "black" | "white"; // 現在の手番
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
  maxMoves,
  derivedTurn
}: GoBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<any>(null);
  const [isWgoLoaded, setIsWgoLoaded] = useState(false);

  // WGo.jsの読み込み確認（公式推奨方式）
  useEffect(() => {
    const checkWgoLoaded = () => {
      if (typeof window !== 'undefined' && window.WGo) {
        console.log('WGo.js loaded:', window.WGo.version); // 公式のversion確認
        setIsWgoLoaded(true);
      } else {
        // WGo.jsが読み込まれるまで待機
        setTimeout(checkWgoLoaded, 100);
      }
    };
    checkWgoLoaded();
  }, []);

  useEffect(() => {
    if (!isWgoLoaded || !boardRef.current) return;

    const initializeBoard = () => {
      try {
        // 公式コンストラクタパラメータに準拠
        const newBoard = new window.WGo.Board(boardRef.current, {
          size: 19,                    // 19路盤
          width: 500,                  // 幅（px）
          height: 500,                 // 高さ（px）
          font: "Calibri",            // 公式デフォルトフォント
          lineWidth: 1,               // 線の太さ
          stoneSize: 1,               // 石のサイズ係数
          shadowSize: 1,              // 影のサイズ係数
          background: window.WGo.DIR + "wood1.jpg", // 公式デフォルト背景
          section: {                  // セクション表示（公式仕様）
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }
        });

        setBoard(newBoard);

        // ゲームとlastMoveを外側のスコープで宣言
        let game: any;
        let lastMove: { x: number; y: number; color: number } | null = null;

        if (sgfContent) {
          // SGF処理（WGo.Gameクラス使用）
          game = new window.WGo.Game();
          lastMove = loadSgfToGame(game, sgfContent, maxMoves);

          // 現在のポジションを盤面に反映（最終手マーク付き）
          const position = game.getPosition();
          updateBoardPosition(newBoard, position, lastMove);

          // アンケート回答ページでのクリック処理（公式addEventListener）
          if (showClickable && onCoordinateSelect) {
            // クリックマーカー保存用変数
            let lastClickMarker: any = null

            // 現在の手番を取得（黒番: 1, 白番: -1）
            const currentTurn = derivedTurn === "black" ? window.WGo.B : window.WGo.W

            // カスタム着手点マーカーハンドラーを定義
            const clickMarkerHandler = {
              stone: {
                draw: function (args: any, board: any) {
                  const ctx = board.stone.getContext(args.x, args.y)
                  const xr = board.getX(args.x)
                  const yr = board.getY(args.y)
                  const sr = board.stoneRadius

                  // 手番に応じた色を設定
                  const markerColor = currentTurn === 1 ? '#000000' : '#FFFFFF' // 黒番なら黒、白番なら白
                  const markerAlpha =
                    currentTurn === 1 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)'

                  // 外側の円を描画
                  ctx.beginPath()
                  ctx.arc(xr, yr, sr * 0.9, 0, 2 * Math.PI, true)
                  ctx.lineWidth = 3
                  ctx.strokeStyle = markerColor
                  ctx.stroke()

                  // 内側の塗りつぶし円（半透明）
                  ctx.beginPath()
                  ctx.arc(xr, yr, sr * 1.0, 0, 2 * Math.PI, true)
                  ctx.fillStyle = markerAlpha
                  ctx.fill()

                  // 白番の場合は黒い輪郭を追加
                  if (currentTurn === -1) {
                    ctx.beginPath()
                    ctx.arc(xr, yr, sr * 1.0, 0, 2 * Math.PI, true)
                    ctx.lineWidth = 2
                    ctx.strokeStyle = '#000000'
                    ctx.stroke()
                  }

                  // 中心の点
                  ctx.beginPath()
                  ctx.arc(xr, yr, sr * 0.2, 0, 2 * Math.PI, true)
                  ctx.fillStyle = markerColor
                  ctx.fill()
                },
              },
            }

            newBoard.addEventListener("click", (x: number, y: number) => {
              // 着手禁止点、盤外の点などは無視
              if (!game.isValid(x, y, currentTurn)) return

              // 公式座標システム（相対座標）
              const coordinate = wgoToSgfCoords(x, y);
              onCoordinateSelect(coordinate);

              // 視覚的フィードバック
              // すべてのオブジェクトを削除してから石を再配置
              newBoard.removeAllObjects()

              // 既存の石を再配置（最終手マークも含む）
              const position = game.getPosition()
              updateBoardPosition(newBoard, position, lastMove)

              // 新しいマーカーを追加（カスタムハンドラー使用）
              lastClickMarker = {
                x: x,
                y: y,
                type: clickMarkerHandler,
              }
              newBoard.addObject(lastClickMarker)
            });
          }

          // 結果表示ページでの得票数表示
          if (resultsData) {
            displayResults(newBoard, resultsData);
          }
        }

      } catch (error) {
        console.error('Failed to initialize WGo.Board:', error);
      }
    };

    initializeBoard();

    // クリーンアップ
    return () => {
      if (board) {
        board.removeAllObjects?.();
      }
    };
  }, [isWgoLoaded, sgfContent, showClickable, resultsData, maxMoves]);

  // SGFをWGo.Gameに読み込み（公式Game API使用）
  const loadSgfToGame = (game: any, sgfContent: string, maxMoves?: number) => {
    let lastMove: { x: number; y: number; color: number } | null = null;

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

          // 最終手として記録（maxMovesの範囲内の最後の手）
          if (maxMoves === undefined || index < maxMoves) {
            lastMove = { x: move.x, y: move.y, color: move.color };
          }
        }
      });
    } catch (error) {
      console.error('Failed to load SGF:', error);
    }

    return lastMove;
  };

  // ポジションを盤面に反映（公式Position API使用）
  const updateBoardPosition = (boardInstance: any, position: any, lastMove?: { x: number; y: number; color: number }) => {
    boardInstance.removeAllObjects(); // 既存オブジェクト削除

    for (let x = 0; x < position.size; x++) {
      for (let y = 0; y < position.size; y++) {
        const stone = position.get(x, y);
        if (stone !== 0) {
          // 公式addObject（石の配置）
          boardInstance.addObject({
            x: x,
            y: y,
            c: stone // WGo.B または WGo.W
          });
        }
      }
    }

    // 最終手にマークを表示
    if (lastMove) {
      // 最終手マーカーハンドラー（石の色に応じて円の色を変える）
      const lastMoveMarkerHandler = {
        stone: {
          draw: function(args: any, board: any) {
            const ctx = board.stone.getContext(args.x, args.y);
            const xr = board.getX(args.x);
            const yr = board.getY(args.y);
            const sr = board.stoneRadius;

            // 石の色に応じてマーカーの色を決定（黒石には白い円、白石には黒い円）
            const markerColor = args.c === window.WGo.B ? '#FFFFFF' : '#000000';

            // 円を描画
            ctx.beginPath();
            ctx.arc(xr, yr, sr * 0.3, 0, 2 * Math.PI, true);
            ctx.lineWidth = 3;
            ctx.strokeStyle = markerColor;
            ctx.stroke();
          }
        }
      };

      boardInstance.addObject({
        x: lastMove.x,
        y: lastMove.y,
        c: lastMove.color,
        type: lastMoveMarkerHandler
      });
    }
  };

  // 結果表示機能（公式DrawHandler使用）
  const displayResults = (boardInstance: any, results: Record<string, { votes: number; answers: any[] }>) => {
    Object.entries(results).forEach(([coordinate, data]) => {
      const coords = sgfToWgoCoords(coordinate);

      if (coords.x >= 0 && coords.x < 19 && coords.y >= 0 && coords.y < 19) {
        // 得票数に応じた色分け
        const color = getColorByVotes(data.votes);

        // 公式LBマーカー（ラベル）使用
        boardInstance.addObject({
          x: coords.x,
          y: coords.y,
          type: "LB",  // 公式定義済みラベルマーカー
          text: data.votes.toString(),
          color: color
        });
      }
    });

    // クリック時の詳細表示
    boardInstance.addEventListener("click", (x: number, y: number) => {
      const coordinate = wgoToSgfCoords(x, y);
      if (results[coordinate]) {
        showAnswerDetails(coordinate, results[coordinate]);
      }
    });
  };

  // 簡易SGFパーサー
  const parseSgfMoves = (sgfContent: string) => {
    const moves: Array<{color: number, x: number, y: number}> = [];
    const blackMoves = sgfContent.match(/;B\[([a-s][a-s])\]/g) || [];
    const whiteMoves = sgfContent.match(/;W\[([a-s][a-s])\]/g) || [];

    // 手順順に並び替え（簡易版）
    const allMoves = [
      ...blackMoves.map(m => ({ move: m, color: window.WGo.B })),
      ...whiteMoves.map(m => ({ move: m, color: window.WGo.W }))
    ];

    allMoves.forEach(({move, color}) => {
      const coords = move.match(/\[([a-s])([a-s])\]/);
      if (coords) {
        const x = coords[1].charCodeAt(0) - 'a'.charCodeAt(0);
        const y = coords[2].charCodeAt(0) - 'a'.charCodeAt(0);
        moves.push({ color, x, y });
      }
    });

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
    const event = new CustomEvent('showAnswerDetails', {
      detail: { coordinate: displayCoord, data }
    });
    window.dispatchEvent(event);
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
      <div className="go-board-loading">
        <p>WGo.jsを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="go-board-container">
      <div
        ref={boardRef}
        className="go-board"
        style={{
          width: '500px',
          height: '500px',
          border: '2px solid #8B4513',
          borderRadius: '8px'
        }}
      />
      {showClickable && (
        <p className="board-instruction">
          盤面をクリックして着手点を選択してください
        </p>
      )}
      {isWgoLoaded && (
        <p className="wgo-version">
          WGo.js {window.WGo?.version || 'unknown'} loaded
        </p>
      )}
    </div>
  );
}
```

**7. 使用例:**

```typescript
// アンケート回答ページ
<GoBoard
  sgfContent={problemData.sgfContent}
  maxMoves={problemData.moves} // movesパラメータ対応
  derivedTurn={problemData.turn} // 手番情報を渡す
  onCoordinateSelect={(coordinate) => {
    setSelectedCoordinate(coordinate);
  }}
  showClickable={true}
/>

// 結果表示ページ
<GoBoard
  sgfContent={problemData.sgfContent}
  maxMoves={problemData.moves}
  derivedTurn={problemData.turn} // 手番情報を渡す
  resultsData={resultsData}
  showClickable={false}
/>
```

**8. Expressサーバーでの静的ファイル配信:**

```typescript
// server/index.ts
import express from 'express'
import path from 'path'

const app = express()

// WGo.js静的ファイル配信（公式推奨）
app.use('/wgo', express.static(path.join(__dirname, '../public/wgo')))
app.use(express.static(path.join(__dirname, '../public/dist')))
app.use('/problems', express.static(path.join(__dirname, '../public/problems')))
app.use('/ogp', express.static(path.join(__dirname, '../public/ogp')))

// WGo.DIRが正しく設定されるように
app.get('/wgo/wgo.min.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/wgo/wgo.min.js'))
})
```

**9. 公式API要点まとめ:**

- **グローバル定数**: `WGo.B`（黒石）、`WGo.W`（白石）、`WGo.version`
- **Board クラス**: 19路盤描画、マウスイベント、オブジェクト管理
- **Game クラス**: 着手処理、ルール判定、ポジション管理
- **DrawHandlers**: `CR`（円）、`LB`（ラベル）、`SQ`（四角）、`TR`（三角）等
- **座標システム**: 相対座標（0-18）と絶対座標（ピクセル）の2種類
- **Event処理**: `addEventListener("click", callback)`での盤面クリック検出

## 9. 今後の課題と改善点

- [ ] ユーザーからのフィードバックを基にしたUI/UXの改善
- [ ] アクセシビリティ対応（色覚バリアフリー、キーボード操作対応など）
- [ ] モバイルデバイス向けの最適化
- [ ] 回答削除後の即時反映機能の実装
- [ ] OGP画像のカスタマイズ機能（ユーザーが任意の画像を設定可能に）
- [ ] 問題作成時のガイドラインやテンプレートの提供
- [ ] サイトの多言語対応（英語、中国語など）
- [ ] ユーザーランク制度の導入と報酬システム
- [ ] 定期的なイベントやキャンペーンの実施
- [ ] AIを活用した問題生成やヒント機能の検討

## 10. 参考文献・リンク

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [WGo.js Documentation](https://wgo.waltheri.net/)

## 11. 段位フィルター機能

### 11.1. 概要

結果表示ページにおいて、特定の段位範囲の回答のみを表示できるフィルター機能を実装。これにより、自分と同じレベルの棋力層の回答を確認したり、高段者の着手理由を学習したりすることが可能になる。

### 11.2. 実装履歴

#### 初期実装（コミット：89352c8, 3ef3f59, 37a5318, 6f135b4, 3d06dda）

**1. フロントエンドでのフィルタリング方式採用**

- APIを実行せずにクライアントサイドでフィルタリング処理を実装
- 全回答データを一度取得し、スライダー操作時にリアルタイムでフィルタリング
- パフォーマンスの向上とサーバー負荷の軽減を実現

**2. スライダーコンポーネントの実装**

- 20級からプロまでの段位範囲を選択可能
- リアルタイムで結果が更新される仕様に変更（37a5318）
- スライダーの優先順位制御とz-index管理（6f135b4）
- 両端が同じ値の場合の特殊処理（両方が九段または両方が20級）

**3. 結果表示の連携**

- フィルタリングされた回答のみが碁盤上に表示
- 回答詳細表示もフィルタリング後のデータを使用（3d06dda）
- 着手点が消えない問題の修正（3ef3f59）

### 11.3. 技術仕様

#### RangeSliderコンポーネント

```typescript
interface RangeSliderProps {
  minValue: number
  maxValue: number
  onRangeChange: (min: number, max: number) => void
}
```

主な機能：

- 段位配列（RANKS）を使用したインデックス管理
- リアルタイム更新（useEffectフック不要）
- スライダー優先順位制御（z-index管理）

#### フィルタリング処理

```typescript
const filterResults = (
  data: Record<string, { votes: number; answers: any[] }>,
  min: number,
  max: number,
) => {
  const filteredResults: Record<string, { votes: number; answers: any[] }> = {}

  Object.entries(data).forEach(([key, value]) => {
    const filteredAnswers = value.answers.filter((answer) => {
      const rankIndex = RANKS.indexOf(answer.playerRank)
      return rankIndex >= min && rankIndex <= max
    })

    if (filteredAnswers.length > 0) {
      filteredResults[key] = {
        votes: filteredAnswers.length,
        answers: filteredAnswers,
      }
    }
  })

  setResults(filteredResults)
}
```

### 11.4. 着手禁止点の選択防止機能（コミット：f7c14b8）

#### 概要

アンケート回答ページにおいて、囲碁のルール上着手できない点（既に石がある位置、コウ、自殺手など）をクリックしても選択されないようにする機能を実装。

#### 実装内容

**WGo.jsのゲームロジック活用：**
```typescript
newBoard.addEventListener("click", (x: number, y: number) => {
  // 着手禁止点、盤外の点などは無視
  if (!game.isValid(x, y, currentTurn)) return
  
  // 有効な着手点のみ処理を続行
  const coordinate = wgoToSgfCoords(x, y);
  onCoordinateSelect(coordinate);
  // ...
});
```

**主な機能：**
- WGo.Gameクラスの`isValid()`メソッドを使用して着手可能性を判定
- 既に石がある位置へのクリックを無視
- コウの規則に違反する着手を防止
- 自殺手（着手後に自分の石が取られる手）を防止
- 盤外クリックの無視

これにより、ユーザーは有効な着手点のみを選択できるようになり、誤った回答の送信を防ぐことができる。

### 11.5. プロ段位の追加（コミット：eda8383）

#### 概要

段位選択肢およびフィルター機能に「プロ」を追加。これにより、プロ棋士の回答も記録・フィルタリングできるようになった。

#### 変更内容

**1. 段位配列の更新**
```typescript
const RANKS = [
  '20級', '19級', '18級', '17級', '16級', '15級', '14級', '13級', '12級', '11級',
  '10級', '9級', '8級', '7級', '6級', '5級', '4級', '3級', '2級', '1級',
  '初段', '二段', '三段', '四段', '五段', '六段', '七段', '八段', '九段', 'プロ'
]
```

**2. 段位フィルターの対応**
- スライダーの範囲を「20級からプロまで」に拡張
- プロの回答のみを表示するフィルタリングが可能に
- 段位選択フォームでプロを選択可能に

**3. 影響範囲**
- アンケート回答フォームの段位選択
- 結果表示ページの段位フィルター
- 回答詳細表示での段位表示

これにより、プロ棋士とアマチュア棋士の着手理由を比較することが可能になり、学習効果の向上が期待される。

### 11.6. 認証ロジックの実装（コミット：f3b839f）

#### 概要

なりすまし対策として、Bearer Token認証方式を採用した認証システムを実装。ユーザーは明示的な登録作業なしで、初回アクセス時に自動的に認証される。

#### 実装内容

**1. 認証方式**

- **Bearer Token認証**: HTTPヘッダーに`Authorization: Bearer {token}`形式でトークンを送信
- **トークン仕様**: 32バイトのランダムな16進数文字列（64文字）
- **保存場所**: ローカルストレージの`igomon_auth_token`キー

**2. クライアントサイドの実装**

```typescript
// client/src/utils/auth.ts
export async function ensureAuthenticated(): Promise<boolean> {
  if (hasAuthToken()) {
    return true
  }
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    
    if (response.ok) {
      const data = await response.json()
      setAuthToken(data.authToken)
      return true
    }
  } catch (error) {
    console.error('Authentication failed:', error)
  }
  
  return false
}
```

**3. サーバーサイドの実装**

認証ミドルウェア:
```typescript
// server/middleware/auth.ts
export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }
  
  const user = await getUserByAuthToken(token)
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' })
  }
  
  req.user = user
  next()
}
```

**4. データベース変更**

```prisma
model User {
  id        Int      @id @default(autoincrement())
  uuid      String   @unique
  authToken String   @unique @map("auth_token")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  answers   Answer[]
}
```

**5. セキュリティ強化**

- userUuidの直接送信を廃止し、認証トークンから取得
- 回答削除は自分の投稿のみ可能（`canDelete`フラグで制御）
- 結果取得APIでuserUuidを隠蔽してプライバシー保護
- 401エラー時の自動再認証機能

**6. 影響を受けるAPI**

- `POST /api/auth/register`: 新規ユーザー登録（新規追加）
- `POST /api/answers`: 回答投稿（認証必須）
- `DELETE /api/answers/:answerId`: 回答削除（認証必須）
- `GET /api/problems/:problemId/answered`: 回答済み確認（認証必須）
- `GET /api/results/:problemId`: 結果取得（認証任意）

この実装により、なりすましを防ぎながら、ユーザーは認証を意識せずにシームレスに利用できる。

### 11.7. 問題の期限機能（コミット：52a50d8）

#### 概要

問題に期限を設定できる機能を実装。期限が過ぎた問題は誰でも結果を閲覧でき、期限前は回答者のみが結果を閲覧できる仕組みを提供。

#### 実装内容

**1. データベース変更**

Problemモデルに期限フィールドを追加：
```prisma
model Problem {
  // ... 既存フィールド
  deadline    DateTime? // 期限（オプショナル）
  // ...
}
```

**2. description.txtフォーマットの拡張**

期限パラメータの追加（任意）：
```plaintext
id: 1515
turn: black
created: 2025-06-27
deadline: 2025-07-01T23:59:59Z
moves: 30
description: 着手とその理由を回答してください。
```

**3. クライアントサイドの期限チェック**

アンケート回答ページ（Questionnaire.tsx）：
```typescript
// 期限チェック
if (problemData.deadline) {
  const now = new Date()
  const deadlineDate = new Date(problemData.deadline)
  
  if (now >= deadlineDate) {
    // 期限切れの場合、結果ページへ自動遷移
    navigate(`/results/${problemId}`, { replace: true })
    return
  }
}
```

結果表示ページ（Results.tsx）：
```typescript
// 期限切れチェック
const isExpired = problemData.deadline 
  ? new Date() >= new Date(problemData.deadline) 
  : false

// 期限切れまたは回答済みの場合のみ結果を表示
if (!isExpired && !hasAnswered) {
  // 未回答の場合は結果を表示しない
  return <UnauthorizedView />
}
```

**4. 動作仕様**

- **期限前**：
  - 回答ページ：正常にアクセス可能
  - 結果ページ：回答済みユーザーのみ閲覧可能
  
- **期限後**：
  - 回答ページ：自動的に結果ページへリダイレクト
  - 結果ページ：誰でも閲覧可能（回答の有無に関わらず）

**5. 問題作成時の対応**

- 問題作成APIで`deadline`パラメータを受け付け
- description.txtファイルに期限情報を保存
- データベースに期限情報を登録

この機能により、時間制限のあるアンケートや、特定期間後に結果を公開したい問題を作成できるようになった。

### 11.8. 今後の改善案

- [ ] 段位フィルターの設定をローカルストレージに保存
- [ ] プリセットフィルター（初級者向け、中級者向け、上級者向け、プロのみ）の追加
- [ ] フィルター適用中の視覚的表示の改善
- [ ] 段位分布グラフの表示機能
- [ ] プロの回答に特別なマーク表示
- [ ] 認証トークンの有効期限管理
- [ ] リフレッシュトークンの実装
- [ ] 期限切れ問題の視覚的な表示（アイコンやバッジ）
- [ ] 期限までの残り時間表示機能
