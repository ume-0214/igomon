// server/utils/html-generator.ts
import fs from 'fs';
import path from 'path';

interface OGPData {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}

// HTMLエスケープ関数
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

export function generateProblemHTML(problemId: number, ogpData: OGPData): string {
  // URLはすでに適切な形式で渡されているため、置換処理は不要
  
  // 本番環境と開発環境でパスを切り替え
  const rootDir = process.env.NODE_ENV === 'production' 
    ? path.join(__dirname, '../../..') // dist/server/utils から ルートへ
    : path.join(__dirname, '../..');   // server/utils から ルートへ
  
  const templatePath = path.join(rootDir, 'public/dist/index.html');
  let template = fs.readFileSync(templatePath, 'utf-8');

  // OGPメタタグを生成（Discord/Twitter対応強化）
  const ogpTags = `
    <!-- OGP Tags -->
    <meta property="og:title" content="${escapeHtml(ogpData.title)}">
    <meta property="og:description" content="${escapeHtml(ogpData.description)}">
    <meta property="og:image" content="${ogpData.imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escapeHtml(ogpData.title)}">
    <meta property="og:url" content="${ogpData.url}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="いごもん">
    <meta property="og:locale" content="ja_JP">
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(ogpData.title)}">
    <meta name="twitter:description" content="${escapeHtml(ogpData.description)}">
    <meta name="twitter:image" content="${ogpData.imageUrl}">
    <meta name="twitter:image:alt" content="${escapeHtml(ogpData.title)}">
    
    <!-- Additional Meta Tags -->
    <meta name="description" content="${escapeHtml(ogpData.description)}">
    <link rel="canonical" href="${ogpData.url}">`;

  // </head>タグの前にOGPタグを挿入
  template = template.replace('</head>', `${ogpTags}\n  </head>`);
  
  // タイトルも更新
  template = template.replace(
    '<title>いごもん</title>',
    `<title>${ogpData.title}</title>`
  );

  return template;
}