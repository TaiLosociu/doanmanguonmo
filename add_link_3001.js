const fs = require('fs');
const path = require('path');

const bannerHtml = `
  <!-- Next.js 3001 Official Version Alert Banner -->
  <div style="background: linear-gradient(90deg, #091e3a 0%, #0369a1 40%, #0284c7 60%, #091e3a 100%); border-bottom: 2px solid #38bdf8; padding: 10px 24px; font-size: 13px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(2, 132, 199, 0.45); position: relative; z-index: 10000; flex-wrap: wrap; gap: 10px;">
    <div style="display: flex; align-items: center; gap: 10px; color: #ffffff; font-weight: 600;">
      <span style="background: #ef4444; color: white; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 900; letter-spacing: 0.5px; box-shadow: 0 0 10px rgba(239, 68, 68, 0.7);">BẢN NỘP BÀI CHÍNH THỨC</span>
      <span>⭐ <strong>ĐỒ ÁN MÃ NGUỒN MỞ (NEXT.JS 15 + NEON DB):</strong> Đang chạy tại cổng <strong>3001</strong></span>
    </div>
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="color: #cbd5e1; font-size: 12px; font-family: monospace; background: rgba(0,0,0,0.35); padding: 5px 12px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.4);">http://localhost:3001</span>
      <a href="http://localhost:3001" target="_blank" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; font-weight: 800; text-decoration: none; padding: 6px 18px; border-radius: 999px; display: inline-flex; align-items: center; gap: 7px; font-size: 13px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4); border: 1px solid #86efac; transition: transform 0.15s ease;">
        <span>🚀</span> Mở Bản Next.js 3001 ↗
      </a>
    </div>
  </div>
`;

const linkBtnHtml = `
        <a href="http://localhost:3001" target="_blank" style="padding: 6px 14px; font-size: 12px; border-radius: 999px; display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff; font-weight: 800; text-decoration: none; border: 1px solid #38bdf8; box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);" title="Mở bản chạy chính thức Next.js cổng 3001">
          <span>⚡</span> Bản Next.js 3001 ↗
        </a>
`;

const htmlFiles = [
  'public_html/leduytai/doan/index.html',
  'public_html/leduytai/doan/lookup.html',
  'public_html/leduytai/doan/cv.html',
  'public_html/leduytai/doan/admin.html'
];

htmlFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Insert banner after <body> if not already present
  if (!content.includes('BẢN NỘP BÀI CHÍNH THỨC')) {
    content = content.replace(/(<body[^>]*>)/i, `$1\n${bannerHtml}`);
  }

  // Insert link button next to Neon Cloud or user header area
  if (!content.includes('Bản Next.js 3001 ↗')) {
    if (content.includes('id="userHeaderArea"')) {
      content = content.replace(/(<div id="userHeaderArea"[^>]*>)/i, `${linkBtnHtml}\n$1`);
    } else if (content.includes('openApiConfigModal()')) {
      content = content.replace(/(<button[^>]*openApiConfigModal\(\)[^>]*>[\s\S]*?<\/button>)/i, `$1\n${linkBtnHtml}`);
    }
  }

  // Add into mobile menu if present
  if (content.includes('id="mobileMenu"') && !content.includes('Mở Bản Next.js 3001 (Nộp Bài)')) {
    content = content.replace(/(<div id="mobileMenu"[^>]*>)/i, `$1\n      <a href="http://localhost:3001" target="_blank" style="color: #4ade80; font-weight: 800; background: rgba(34, 197, 94, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(34, 197, 94, 0.3);">🚀 Mở Bản Next.js 3001 (Nộp Bài) ↗</a>`);
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
});
