# いごもん実装計画書（チェックリスト式）

## 概要
囲碁アンケートサイト「いごもん」の実装タスクを段階的に進めるためのチェックリストです。

## 前提条件
- Node.js 18.x
- XServerのNode.js環境
- SQLite（ファイルベースDB）
- 認証なし（Cookie/LocalStorageベース）

## 実装チェックリスト

### Phase 1: プロジェクト基盤構築

#### 1.1 プロジェクト初期化
- [ ] Node.jsプロジェクトの初期化（package.json作成）
- [ ] TypeScriptの設定（tsconfig.json）
- [ ] 必要な依存関係のインストール
  - [ ] Express.js
  - [ ] TypeScript関連
  - [ ] Prisma（SQLite）
  - [ ] React + Vite
  - [ ] WGo.js
  - [ ] Socket.io
  - [ ] Chokidar
  - [ ] Canvas（OGP画像生成用）

#### 1.2 ディレクトリ構造の作成
- [ ] `/server` - バックエンドコード
- [ ] `/client` - フロントエンドコード
- [ ] `/prisma` - データベーススキーマ
- [ ] `/public/problems` - 問題ファイル格納
- [ ] `/public/ogp` - OGP画像格納
- [ ] `/public/dist` - ビルド済みフロントエンド

#### 1.3 データベース設計
- [ ] Prismaスキーマ（schema.prisma）の作成
  - [ ] Problemテーブル
  - [ ] Answerテーブル
- [ ] マイグレーションファイルの生成
- [ ] Prisma Clientの生成

### Phase 2: バックエンド基本機能

#### 2.1 Expressサーバーのセットアップ
- [ ] 基本的なExpressサーバー（server/index.ts）
- [ ] CORSミドルウェアの設定
- [ ] 静的ファイル配信の設定
- [ ] エラーハンドリング

#### 2.2 問題ファイル読み込み機能
- [ ] 問題ローダーユーティリティ（problem-loader.ts）
  - [ ] description.txtパーサー
  - [ ] SGFファイル読み込み
  - [ ] 問題一覧取得
- [ ] 問題存在チェック機能

#### 2.3 基本API実装
- [ ] POST `/api/answers` - 回答投稿
- [ ] GET `/api/results/:problemId` - 結果取得
- [ ] DELETE `/api/answers/:answerId` - 回答削除
- [ ] GET `/api/problems` - 問題一覧
- [ ] GET `/api/sgf/:problemId` - SGFファイル取得

### Phase 3: フロントエンド基本機能

#### 3.1 React基本セットアップ
- [ ] Viteの設定
- [ ] React Router設定
- [ ] 基本的なコンポーネント構造

#### 3.2 共通ユーティリティ
- [ ] UUID管理（uuid.ts）
  - [ ] ユーザーUUID生成・保存
  - [ ] LocalStorage管理
- [ ] API通信ユーティリティ（api.ts）
- [ ] 座標変換ユーティリティ

#### 3.3 トップページ
- [ ] 問題一覧表示コンポーネント（Home.tsx）
- [ ] 問題カード表示
- [ ] 作成日時順ソート

### Phase 4: アンケート回答機能

#### 4.1 碁盤表示コンポーネント
- [ ] WGo.js統合（GoBoard.tsx）
- [ ] SGFファイル読み込み・表示
- [ ] 指定手数まで表示（movesパラメータ対応）
- [ ] クリックで着手選択機能

#### 4.2 回答フォーム
- [ ] 回答フォームコンポーネント（AnswerForm.tsx）
  - [ ] 着手座標の自動入力
  - [ ] 着手理由入力
  - [ ] 名前・段位入力
- [ ] LocalStorageによる名前・段位の保存/復元

#### 4.3 アンケートページ統合
- [ ] アンケートページ（Questionnaire.tsx）
- [ ] 回答済みチェック（Cookie/LocalStorage）
- [ ] 回答送信処理
- [ ] 結果ページへの遷移

### Phase 5: 結果表示機能

#### 5.1 結果表示コンポーネント
- [ ] 結果表示碁盤（ResultsDisplay.tsx）
  - [ ] 各座標の得票数表示
  - [ ] 得票数による色分け
- [ ] 座標クリックで回答詳細表示

#### 5.2 削除機能
- [ ] 自分の投稿に削除ボタン表示
- [ ] 削除API呼び出し
- [ ] リアルタイム更新

#### 5.3 結果ページ統合
- [ ] 結果ページ（Results.tsx）
- [ ] 回答一覧表示
- [ ] 標準囲碁記法での座標表示

### Phase 6: リアルタイム更新機能

#### 6.1 ファイル監視機能
- [ ] Chokidarによるファイル監視（file-watcher.ts）
- [ ] 新規問題ディレクトリ検知
- [ ] description.txt/kifu.sgf更新検知

#### 6.2 WebSocket通信
- [ ] Socket.ioサーバー設定
- [ ] 問題更新通知機能
- [ ] クライアント側リアルタイム受信（useRealTimeProblems.ts）

### Phase 7: OGP対応

#### 7.1 OGP画像生成
- [ ] Canvas設定（ogp-generator.ts）
- [ ] 碁盤描画機能
- [ ] SGFから石配置を読み込み
- [ ] 1200x630px PNG生成

#### 7.2 OGPメタタグ
- [ ] 動的OGPタグ生成
- [ ] Twitter Card対応
- [ ] 問題ごとのOGP設定

### Phase 8: 最終調整・デプロイ準備

#### 8.1 ビルド設定
- [ ] フロントエンドビルドスクリプト
- [ ] TypeScriptコンパイル設定
- [ ] 本番環境用設定

#### 8.2 エラーハンドリング強化
- [ ] API エラーレスポンス統一
- [ ] フロントエンドエラー表示
- [ ] ログ出力設定

#### 8.3 パフォーマンス最適化
- [ ] 画像最適化
- [ ] バンドルサイズ削減
- [ ] キャッシュ設定

#### 8.4 テスト環境構築
- [ ] ローカルテスト手順書作成
- [ ] サンプル問題データ準備
- [ ] 動作確認チェックリスト

## 注意事項

### セキュリティ
- SQLインジェクション対策（Prisma使用で自動対応）
- XSS対策（React使用で基本的に対応）
- UUID衝突対策（crypto.randomUUID使用）

### パフォーマンス
- 問題数が増えても大丈夫な設計
- 適切なインデックス設定
- 画像の遅延読み込み

### 保守性
- TypeScriptによる型安全性
- 明確なディレクトリ構造
- 適切なログ出力

### XServer固有の考慮事項
- PM2/forever不要（単純なnode実行）
- SQLiteファイルの配置場所
- ファイルパーミッション設定

## 実装開始前の確認事項

- [ ] Node.js 18.xがインストールされているか
- [ ] XServerのNode.js環境の制限事項を確認したか
- [ ] ドメイン（igomon.net）の設定は完了しているか
- [ ] 開発環境の準備は整っているか

---

このチェックリストに従って実装を進めることで、体系的かつ効率的に「いごもん」を完成させることができます。