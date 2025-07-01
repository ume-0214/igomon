// XServer用起動ファイル
// PM2/foreverなどのプロセスマネージャーは使用しない

// 環境変数の設定
process.env.NODE_ENV = 'production';

// 本番サーバーの起動
require('./dist/server/index.js');