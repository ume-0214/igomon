// server/utils/html-generator.ts
import fs from 'fs';
import path from 'path';

interface OGPData {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}

export function generateProblemHTML(problemId: number, ogpData: OGPData): string {
  // 本番環境のURLを環境変数から取得
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  ogpData.imageUrl = ogpData.imageUrl.replace('https://igomon.net', siteUrl);
  ogpData.url = ogpData.url.replace('https://igomon.net', siteUrl);
  const templatePath = path.join(__dirname, '../../client/index.html');
  let template = fs.readFileSync(templatePath, 'utf-8');

  // OGPメタタグを生成
  const ogpTags = `
    <!-- OGP Tags -->
    <meta property="og:title" content="${ogpData.title}">
    <meta property="og:description" content="${ogpData.description}">
    <meta property="og:image" content="${ogpData.imageUrl}">
    <meta property="og:url" content="${ogpData.url}">
    <meta property="og:type" content="website">
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${ogpData.title}">
    <meta name="twitter:description" content="${ogpData.description}">
    <meta name="twitter:image" content="${ogpData.imageUrl}">`;

  // </head>タグの前にOGPタグを挿入
  template = template.replace('</head>', `${ogpTags}\n  </head>`);
  
  // タイトルも更新
  template = template.replace(
    '<title>いごもん - 囲碁アンケートサイト</title>',
    `<title>${ogpData.title}</title>`
  );

  return template;
}