// テスト用スクリプト - サーバーの動作確認
const fetch = require('node-fetch');

async function testServer() {
  console.log('サーバーのテストを開始します...\n');
  
  try {
    // 1. APIヘルスチェック
    console.log('1. APIヘルスチェック...');
    const apiTest = await fetch('http://localhost:3000/api/problems');
    console.log(`   ステータス: ${apiTest.status}`);
    if (apiTest.ok) {
      const problems = await apiTest.json();
      console.log(`   問題数: ${problems.length}`);
    }
    
    // 2. 問題詳細取得テスト
    console.log('\n2. 問題詳細取得テスト (問題ID: 1)...');
    const problemTest = await fetch('http://localhost:3000/api/problems/1');
    console.log(`   ステータス: ${problemTest.status}`);
    if (problemTest.ok) {
      const problem = await problemTest.json();
      console.log(`   問題ID: ${problem.id}`);
      console.log(`   手番: ${problem.turn}`);
      console.log(`   SGFコンテンツ: ${problem.sgfContent ? 'あり' : 'なし'}`);
    }
    
    // 3. 結果取得テスト
    console.log('\n3. 結果取得テスト (問題ID: 1)...');
    const resultsTest = await fetch('http://localhost:3000/api/results/1');
    console.log(`   ステータス: ${resultsTest.status}`);
    if (resultsTest.ok) {
      const results = await resultsTest.json();
      console.log(`   結果数: ${Object.keys(results).length}`);
    }
    
    console.log('\n✅ すべてのテストが完了しました！');
    
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    console.error('サーバーが起動していることを確認してください。');
  }
}

// node-fetchがない場合の対処
try {
  testServer();
} catch (error) {
  console.log('node-fetchをインストールしてください: npm install node-fetch@2');
}