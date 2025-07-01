#!/bin/bash

# ローカル環境での動作確認スクリプト

echo "いごもん ローカル動作確認"
echo "========================="

# 1. Node.jsバージョン確認
echo "1. Node.jsバージョン確認"
node --version
echo ""

# 2. 依存関係の確認
echo "2. 依存関係の確認"
if [ -d "node_modules" ]; then
    echo "✓ node_modulesが存在します"
else
    echo "✗ node_modulesが存在しません。npm installを実行してください"
    exit 1
fi
echo ""

# 3. データベースの確認
echo "3. データベースの確認"
if [ -f "prisma/igomon.db" ]; then
    echo "✓ データベースが存在します"
else
    echo "✗ データベースが存在しません。npx prisma migrate devを実行してください"
    exit 1
fi
echo ""

# 4. WGo.jsの確認
echo "4. WGo.jsライブラリの確認"
if [ -f "public/wgo/wgo.min.js" ]; then
    echo "✓ WGo.jsが設置されています"
else
    echo "⚠ WGo.jsが見つかりません（プレースホルダーを使用中）"
    echo "  公式サイトからダウンロードしてください: https://wgo.waltheri.net/download"
fi
echo ""

# 5. 問題ファイルの確認
echo "5. 問題ファイルの確認"
if [ -d "public/problems/1" ]; then
    echo "✓ テスト問題が存在します"
    if [ -f "public/problems/1/kifu.sgf" ] && [ -f "public/problems/1/description.txt" ]; then
        echo "  - kifu.sgf: ✓"
        echo "  - description.txt: ✓"
    else
        echo "  ✗ 必要なファイルが不足しています"
    fi
else
    echo "✗ テスト問題が存在しません"
fi
echo ""

# 6. ビルド確認
echo "6. ビルド状態の確認"
if [ -d "dist" ]; then
    echo "✓ サーバービルドが存在します"
else
    echo "⚠ サーバーがビルドされていません（開発モードで実行可能）"
fi
if [ -d "public/dist" ]; then
    echo "✓ フロントエンドビルドが存在します"
else
    echo "⚠ フロントエンドがビルドされていません（開発モードで実行可能）"
fi
echo ""

echo "========================="
echo "動作確認完了"
echo ""
echo "開発サーバーを起動するには："
echo "  ターミナル1: npm run dev:server"
echo "  ターミナル2: npm run dev:client"
echo ""
echo "ビルドを実行するには："
echo "  npm run build:client"
echo "  npm run build:server"