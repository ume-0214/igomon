# いごもん デプロイ手順書

## 前提条件
- XServerのNode.js環境（Node.js 18.x）
- ドメイン（igomon.net）の設定完了
- SSHアクセス権限

## デプロイ手順

### 1. WGo.jsライブラリのダウンロード
公式サイト（https://wgo.waltheri.net/download）から以下のファイルをダウンロード：
- wgo.min.js
- wgo.player.min.js
- assets/（木目背景、石のテクスチャなど）
- themes/（スタイルシート）

これらを `/public/wgo/` ディレクトリに配置。

### 2. ローカルでのビルド

```bash
# 依存関係のインストール
npm install

# データベースのセットアップ
npx prisma generate
npx prisma migrate deploy

# フロントエンドのビルド
cd client
npm run build:client
cd ..

# サーバーのビルド
npm run build:server
```

### 3. アップロードするファイル

以下のファイル・ディレクトリをXServerにアップロード：

```
/dist/              # ビルド済みサーバーコード
/prisma/            # Prismaスキーマとクライアント
/public/            # 静的ファイル
  /dist/            # ビルド済みフロントエンド
  /wgo/             # WGo.jsライブラリ
  /problems/        # 問題ファイル（初期は空でOK）
  /ogp/             # OGP画像（自動生成される）
/lib/               # データベースユーティリティ
/package.json       # 依存関係定義
/package-lock.json  # 依存関係ロック
/start.js           # 起動スクリプト
/.env               # 環境変数（別途作成）
```

### 4. XServerでの設定

#### 4.1 SSHでログイン
```bash
ssh ユーザー名@サーバー名.xserver.jp
```

#### 4.2 Node.jsディレクトリに移動
```bash
cd ~/node/igomon
```

#### 4.3 依存関係のインストール
```bash
npm install --production
```

#### 4.4 環境変数の設定
`.env` ファイルを作成：
```bash
DATABASE_URL="file:./igomon.db"
PORT=3000
SITE_URL="https://igomon.net"
NODE_ENV="production"
```

#### 4.5 データベースの初期化
```bash
npx prisma migrate deploy
```

### 5. アプリケーションの起動

```bash
node start.js
```

### 6. 問題の追加

1. `/public/problems/{問題番号}/` ディレクトリを作成
2. 以下のファイルを配置：
   - `kifu.sgf` - 棋譜ファイル
   - `description.txt` - 問題情報

description.txt の形式：
```
id: 1
turn: black
created: 2025-06-29
moves: 30
description: 次の一手を考えてください。着手とその理由を回答してください。
```

3. ファイルを配置すると自動的に：
   - OGP画像が生成される
   - トップページに反映される

### 7. 動作確認

1. https://igomon.net にアクセス
2. 問題一覧が表示されることを確認
3. 問題をクリックして回答ページが表示されることを確認
4. 回答を送信して結果ページが表示されることを確認

### 8. トラブルシューティング

#### ポートが使用中の場合
`.env` ファイルのPORTを変更

#### データベースエラーの場合
```bash
rm prisma/igomon.db
npx prisma migrate deploy
```

#### WGo.jsが読み込まれない場合
- `/public/wgo/` ディレクトリの配置を確認
- ブラウザの開発者ツールでエラーを確認

### 9. バックアップ

定期的にバックアップすべきファイル：
- `prisma/igomon.db` - データベース
- `/public/problems/` - 問題ファイル
- `.env` - 環境設定

### 10. 更新時の手順

1. ローカルで変更・ビルド
2. サーバーを停止
3. 必要なファイルをアップロード
4. `npm install --production`（package.jsonが変更された場合）
5. `npx prisma migrate deploy`（スキーマが変更された場合）
6. サーバーを再起動