# いごもん（igomon）

囲碁アンケートサイト「いごもん」は、囲碁の局面における「なぜそこに打ちたいのか」という着手の理由を集めるためのWebアプリケーションです。

## 機能

- 問題の盤面表示（SGFファイル対応）
- 着手点の選択と理由の投稿
- 投票結果の可視化（得票数の色分け表示）
- リアルタイム問題更新
- 自分の投稿の削除機能
- OGP対応（SNS共有時のカード表示）

## 技術スタック

- **フロントエンド**: React + TypeScript + Vite
- **バックエンド**: Express.js + TypeScript
- **データベース**: SQLite + Prisma
- **囲碁盤表示**: WGo.js
- **リアルタイム通信**: Socket.io
- **OGP画像生成**: Node.js Canvas

## 開発環境のセットアップ

### 必要な環境

- Node.js 18.x
- npm

### インストール

```bash
# 依存関係のインストール
npm install

# データベースのセットアップ
npx prisma migrate dev

# 環境変数の設定
cp .env.example .env
```

### WGo.jsのセットアップ

1. [WGo.js公式サイト](https://wgo.waltheri.net/download)からライブラリをダウンロード
2. ダウンロードしたファイルを `/public/wgo/` ディレクトリに配置

### 開発サーバーの起動

2つのターミナルで以下を実行：

```bash
# ターミナル1: バックエンドサーバー
npm run dev:server

# ターミナル2: フロントエンド開発サーバー
npm run dev:client
```

アプリケーションは http://localhost:5173 でアクセス可能です。

## 問題の追加方法

1. `/public/problems/{問題番号}/` ディレクトリを作成
2. 以下のファイルを配置：
   - `kifu.sgf` - SGF形式の棋譜ファイル
   - `description.txt` - 問題の情報

### description.txt の形式

```
id: 1
turn: black
created: 2025-06-29
moves: 30
description: 次の一手を考えてください。着手とその理由を回答してください。
```

- **id**: 問題番号（必須）
- **turn**: 手番（black または white）（必須）
- **created**: 作成日（YYYY-MM-DD形式）（必須）
- **moves**: 表示する手数（任意、省略時は最終手まで）
- **description**: 問題の説明文（必須）

## ビルド

```bash
# フロントエンドのビルド
npm run build:client

# サーバーのビルド
npm run build:server
```

## プロダクション環境での起動

### 1. 環境変数の設定

本番環境用の環境変数を設定します：

```bash
# .env ファイルを編集
NODE_ENV=production
PORT=3000  # サーバーポート（必要に応じて変更）
```

### 2. ビルド

```bash
# フロントエンドとサーバーをビルド
npm run build:client
npm run build:server
```

### 3. データベースのマイグレーション

```bash
# 本番環境のデータベースをセットアップ
npx prisma migrate deploy
```

### 4. アプリケーションの起動

```bash
# プロダクションサーバーを起動
npm run start
```

アプリケーションはデフォルトで http://localhost:3000 で起動します。
