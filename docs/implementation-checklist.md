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
  - [ ] Socket.io
  - [ ] Chokidar
  - [ ] Canvas（OGP画像生成用）
  - [ ] UUID（ユーザー識別用）

#### 1.2 WGo.jsライブラリの設置（公式推奨方式）
- [ ] WGo.js公式サイトからダウンロード（https://wgo.waltheri.net/download）
- [ ] `/public/wgo/` ディレクトリの作成
- [ ] 必須ファイルの配置
  - [ ] `wgo.min.js` - メインライブラリ
  - [ ] `wgo.js` - 開発用非圧縮版
  - [ ] `wgo.player.min.js` - プレイヤー機能（SGF表示）
- [ ] アセットファイルの配置
  - [ ] `/assets/wood1.jpg` - デフォルト木目背景
  - [ ] `/assets/wood2.jpg` - 推奨木目背景
  - [ ] `/assets/shell.png` - 白石テクスチャ
  - [ ] `/assets/slate.png` - 黒石テクスチャ
  - [ ] `/assets/shadow.png` - 影テクスチャ
- [ ] スタイルシートの配置
  - [ ] `/themes/default.css` - デフォルトスタイル
  - [ ] `/themes/compact.css` - コンパクトスタイル

#### 1.3 ディレクトリ構造の作成
- [ ] `/server` - バックエンドコード
- [ ] `/client` - フロントエンドコード
- [ ] `/prisma` - データベーススキーマ
- [ ] `/public/problems` - 問題ファイル格納
- [ ] `/public/wgo` - WGo.jsライブラリ（公式推奨配置）
- [ ] `/public/ogp` - OGP画像格納
- [ ] `/public/dist` - ビルド済みフロントエンド

#### 1.4 データベース設計
- [ ] Prismaスキーマ（schema.prisma）の作成
  - [ ] Problemテーブル
  - [ ] Answerテーブル（UUID、論理削除対応）
- [ ] マイグレーションファイルの生成
- [ ] Prisma Clientの生成

#### 1.4 データベース設計
- [ ] Prismaスキーマ（schema.prisma）の作成
  - [ ] Problemテーブル
  - [ ] Answerテーブル（UUID、論理削除対応）
- [ ] マイグレーションファイルの生成
- [ ] Prisma Clientの生成

### Phase 2: バックエンド基本機能

#### 2.1 Expressサーバーのセットアップ（公式構成準拠）
- [ ] 基本的なExpressサーバー（server/index.ts）
- [ ] CORSミドルウェアの設定
- [ ] 静的ファイル配信の設定
  - [ ] WGo.js配信（`/wgo` ルート）
  - [ ] problems配信（`/problems` ルート）
  - [ ] OGP画像配信（`/ogp` ルート）
- [ ] Socket.ioサーバーの初期化
- [ ] エラーハンドリング

#### 2.2 問題ファイル読み込み機能
- [ ] 問題ローダーユーティリティ（problem-loader.ts）
  - [ ] description.txtパーサー（key: value形式）
  - [ ] SGFファイル読み込み
  - [ ] 問題一覧取得（作成日時順ソート）
  - [ ] movesパラメータ対応
- [ ] 問題存在チェック機能
- [ ] ID重複チェック機能

#### 2.3 基本API実装（仕様書準拠）
- [ ] POST `/api/answers` - 回答投稿（UUID認証）
- [ ] GET `/api/results/:problemId` - 結果取得（座標集計）
- [ ] DELETE `/api/answers/:answerId` - 回答削除（論理削除）
- [ ] GET `/api/problems` - 問題一覧（回答数付き）
- [ ] GET `/api/sgf/:problemId` - SGFファイル取得
- [ ] エラーレスポンス統一（JSON形式）

### Phase 3: フロントエンド基本機能

#### 3.1 React基本セットアップ
- [ ] Viteの設定
- [ ] React Router設定（問題ページのURL対応）
- [ ] 基本的なコンポーネント構造
- [ ] HTML内でのWGo.js読み込み（公式推奨scriptタグ）

#### 3.2 共通ユーティリティ（仕様書準拠）
- [ ] UUID管理（uuid.ts）
  - [ ] `crypto.randomUUID()`でユーザーUUID生成
  - [ ] LocalStorage管理（`igomon_user_uuid`キー）
  - [ ] 衝突対策（暗号学的に安全な生成）
- [ ] API通信ユーティリティ（api.ts）
  - [ ] 回答投稿（UUID自動付与）
  - [ ] 結果取得
  - [ ] 削除API（UUID認証）
- [ ] 座標変換ユーティリティ
  - [ ] SGF座標 ⇔ WGo.js座標変換
  - [ ] 標準囲碁記法（A1〜T19）変換

#### 3.3 トップページ（リアルタイム対応）
- [ ] 問題一覧表示コンポーネント（Home.tsx）
- [ ] 問題カード表示（回答数表示）
- [ ] 作成日時順ソート
- [ ] WebSocket接続（Socket.io）
- [ ] リアルタイム問題更新受信

### Phase 4: アンケート回答機能（WGo.js公式API準拠）

#### 4.1 碁盤表示コンポーネント（公式実装）
- [ ] WGo.js統合（GoBoard.tsx）
  - [ ] 公式コンストラクタパラメータ使用
  - [ ] `WGo.Board(element, config)`初期化
  - [ ] `WGo.version`読み込み確認
- [ ] SGFファイル読み込み・表示
  - [ ] `WGo.Game`クラス使用
  - [ ] 指定手数まで表示（movesパラメータ対応）
  - [ ] `WGo.Position`による盤面管理
- [ ] クリックで着手選択機能
  - [ ] 公式`addEventListener("click")`使用
  - [ ] 相対座標（0-18）の取得
  - [ ] 視覚的フィードバック（公式マーカー）

#### 4.2 回答フォーム（仕様書準拠）
- [ ] 回答フォームコンポーネント（AnswerForm.tsx）
  - [ ] 着手座標の自動入力（SGF形式）
  - [ ] 着手理由入力（必須）
  - [ ] 名前・段位入力
- [ ] LocalStorageによる名前・段位の保存/復元
  - [ ] `igomon_user_name`、`igomon_user_rank`キー
- [ ] 入力値検証

#### 4.3 アンケートページ統合
- [ ] アンケートページ（Questionnaire.tsx）
- [ ] 回答済みチェック（UUIDベース）
- [ ] 回答送信処理（API統合）
- [ ] 結果ページへの自動遷移

### Phase 5: 結果表示機能（得票数可視化）

#### 5.1 結果表示コンポーネント（公式DrawHandler使用）
- [ ] 結果表示碁盤（ResultsDisplay.tsx）
  - [ ] 各座標の得票数表示（公式LBマーカー）
  - [ ] 得票数による色分け（10票以上=赤、5-9票=橙、1-4票=青）
  - [ ] `WGo.Board.addObject()`での数字表示
- [ ] 座標クリックで回答詳細表示
  - [ ] 標準囲碁記法（A1〜T19）表示
  - [ ] 回答者一覧（名前、段位、理由）

#### 5.2 削除機能（論理削除）
- [ ] 自分の投稿に削除ボタン表示（UUID照合）
- [ ] 削除API呼び出し（UUID認証）
- [ ] リアルタイム更新（削除後の得票数再計算）
- [ ] `is_deleted`フラグ更新

#### 5.3 結果ページ統合
- [ ] 結果ページ（Results.tsx）
- [ ] 回答一覧表示（削除されていない回答のみ）
- [ ] 座標別グループ表示
- [ ] 回答済み制御（UUID確認）

### Phase 6: リアルタイム更新機能（chokidar + Socket.io）

#### 6.1 ファイル監視機能（新仕様）
- [ ] Chokidarによるファイル監視（file-watcher.ts）
  - [ ] `public/problems/`ディレクトリ監視
  - [ ] 新規問題ディレクトリ検知（数字ディレクトリ名）
  - [ ] description.txt/kifu.sgf更新検知
  - [ ] 1秒遅延処理（ファイルコピー完了待ち）
- [ ] ID重複チェック（既存問題との衝突回避）
- [ ] エラーハンドリング（不正ファイル対応）

#### 6.2 WebSocket通信（Socket.io）
- [ ] Socket.ioサーバー設定（Express統合）
- [ ] 問題更新通知機能
  - [ ] `problemUpdated`イベント
  - [ ] `problemsListUpdated`イベント
  - [ ] `initialProblems`イベント（接続時）
- [ ] クライアント側リアルタイム受信
  - [ ] `useRealTimeProblems`フック
  - [ ] 接続状態表示
  - [ ] 自動問題一覧更新

### Phase 7: OGP対応（自動画像生成）

#### 7.1 OGP画像生成（Node.js Canvas）
- [ ] Canvas設定（ogp-generator.ts）
  - [ ] 1200x630px画像生成
  - [ ] 19×19碁盤描画
  - [ ] movesパラメータ対応
- [ ] SGFから石配置を読み込み
- [ ] 問題配置時の自動実行
- [ ] `public/ogp/problem_{id}.png`出力

#### 7.2 OGPメタタグ（動的生成）
- [ ] 問題ページ用OGPタグ
- [ ] Twitter Card対応
- [ ] 問題情報の動的設定
  - [ ] タイトル（問題番号・手番）
  - [ ] 説明文（description）
  - [ ] 画像URL（生成済みOGP画像）
- [ ] 動的OGPタグ生成
- [ ] Twitter Card対応
- [ ] 問題ごとのOGP設定

### Phase 8: 最終調整・デプロイ準備（XServer最適化）

#### 8.1 ビルド設定（XServer対応）
- [ ] フロントエンドビルドスクリプト（Vite）
- [ ] TypeScriptコンパイル設定（server→dist変換）
- [ ] 本番環境用設定
  - [ ] 環境変数設定
  - [ ] SQLiteファイルパス設定
  - [ ] 静的ファイル配信最適化
- [ ] XServer用起動スクリプト（PM2/forever不使用）

#### 8.2 エラーハンドリング強化
- [ ] API エラーレスポンス統一（JSON形式）
- [ ] フロントエンドエラー表示（ユーザーフレンドリー）
- [ ] ログ出力設定
  - [ ] WGo.js読み込み状況
  - [ ] ファイル監視ログ
  - [ ] API呼び出しログ

#### 8.3 パフォーマンス最適化
- [ ] 画像最適化（OGP画像圧縮）
- [ ] バンドルサイズ削減
- [ ] キャッシュ設定
  - [ ] WGo.js静的ファイル
  - [ ] OGP画像キャッシュ
  - [ ] 問題ファイルキャッシュ

#### 8.4 テスト環境構築・検証
- [ ] ローカルテスト手順書作成
- [ ] サンプル問題データ準備
  - [ ] 複数問題（movesパラメータあり/なし）
  - [ ] SGFファイル検証
  - [ ] description.txt形式確認
- [ ] 動作確認チェックリスト
  - [ ] WGo.js読み込み確認
  - [ ] リアルタイム更新確認
  - [ ] UUID機能確認
  - [ ] 論理削除確認
  - [ ] OGP生成確認

#### 8.5 公式準拠性確認
- [ ] WGo.js公式API使用確認
  - [ ] グローバル定数（WGo.B、WGo.W）
  - [ ] 公式DrawHandlers（CR、LB、SQ、TR）
  - [ ] 座標システム（相対座標0-18）
- [ ] 仕様書との整合性確認
- [ ] 公式Getting startedサンプルとの比較

## 注意事項（igomon.md仕様書準拠）

### セキュリティ（仕様書7.1節準拠）
- SQLインジェクション対策（Prisma使用で自動対応）
- XSS対策（React使用で基本的に対応）
- UUID衝突対策（crypto.randomUUID使用、暗号学的に安全）
- 論理削除による投稿保護（物理削除回避）

### パフォーマンス（仕様書3.2節考慮）
- 問題数が増えても大丈夫な設計（SQLiteで数千回答対応）
- 適切なインデックス設定（Prismaスキーマ）
- 画像の遅延読み込み（OGP画像最適化）
- WGo.jsライブラリのCDN不使用（ローカル配置でレスポンス向上）

### 保守性（TypeScript + 公式API準拠）
- TypeScriptによる型安全性
- 明確なディレクトリ構造（仕様書8.2節）
- 適切なログ出力
- WGo.js公式API準拠（将来的なライブラリ更新対応）
- 座標システムの統一（SGF ⇔ WGo.js ⇔ 標準記法）

### XServer固有の考慮事項（仕様書8.9節対応）
- PM2/forever不要（単純なnode実行、仕様書推奨）
- SQLiteファイルの配置場所（igomon.db）
- ファイルパーミッション設定
- 共有サーバー環境での制限対応

### WGo.js使用上の注意（公式準拠）
- npmパッケージ不使用（公式ダウンロード推奨）
- scriptタグによる読み込み（公式Getting started準拠）
- `WGo.DIR`の正しい設定（背景画像パス）
- 公式DrawHandlersの活用（CR、LB、SQ、TR等）
- 相対座標システムの理解（0-18の座標範囲）

## 実装開始前の確認事項（更新版）

- [ ] Node.js 18.xがインストールされているか
- [ ] XServerのNode.js環境の制限事項を確認したか
- [ ] ドメイン（igomon.net）の設定は完了しているか
- [ ] 開発環境の準備は整っているか
- [ ] WGo.js公式サイト（https://wgo.waltheri.net/）からライブラリをダウンロード済みか
- [ ] igomon.md仕様書の内容を理解しているか
- [ ] 公式Getting startedのサンプルコードを確認したか
- [ ] UUID識別システムの仕組みを理解しているか
- [ ] SQLite + Prisma構成の準備はできているか
- [ ] リアルタイム更新（chokidar + Socket.io）の仕組みを理解しているか

## 実装順序の推奨

1. **Phase 1**: プロジェクト基盤（WGo.js設置含む）
2. **Phase 2**: バックエンド基本機能（API + DB）
3. **Phase 3**: フロントエンド基本機能（UUID管理）
4. **Phase 4**: アンケート機能（WGo.js統合）
5. **Phase 5**: 結果表示機能（得票数可視化）
6. **Phase 6**: リアルタイム更新（ファイル監視）
7. **Phase 7**: OGP対応（画像自動生成）
8. **Phase 8**: 最終調整・デプロイ準備

---

このチェックリストに従って実装を進めることで、igomon.md仕様書に完全準拠した「いごもん」を効率的に完成させることができます。