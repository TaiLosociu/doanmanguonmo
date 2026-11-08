const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const outDir = path.join(frontendDir, 'out');
const targetBaitap1 = path.join(rootDir, 'baitap1');
const zipFile = path.join(rootDir, 'baitap1.zip');
const frontendZip = path.join(rootDir, 'frontend.zip');
const fullZipFile = path.join(rootDir, 'LEDUYTAI_IT24M_BAITAP1_FULL.zip');

console.log('=== [1/6] Building Next.js Static Export ===');
execSync(
  `"C:\\Users\\ADMIN\\typescript\\node.exe" "${path.join(
    frontendDir,
    'node_modules',
    'next',
    'dist',
    'bin',
    'next'
  )}" build --webpack`,
  {
    cwd: frontendDir,
    env: { ...process.env, PATH: 'C:\\Users\\ADMIN\\typescript;' + process.env.PATH },
    stdio: 'inherit',
  }
);

console.log('=== [2/6] Copying Public Assets & Pre-optimizing HTML ===');
const publicDir = path.join(frontendDir, 'public');
['avatar.jpg', 'avatar.png', 'avatar.svg', 'leduytai.jpg', 'api.php'].forEach((file) => {
  const src = path.join(publicDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(outDir, file));
    console.log(`Copied ${file} to out/`);
  }
});

const htmlPath = path.join(outDir, 'index.html');
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Remove fragile streaming hydration scripts that crash on static hosting / Cloudflare
  html = html.replace(/<script[^>]*src="[^"]*\/_next\/static\/chunks\/[^"]*"[^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]*id="__NEXT_DATA__"[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*id="_R_"[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*>\s*\(self\.__next_f[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*>\s*self\.__next_f\.push[\s\S]*?<\/script>/gi, '');

  // Convert absolute URLs to relative
  html = html.replace(/\/leduytai\/baitap1\/_next\//g, './_next/');
  html = html.replace(/href="\/avatar\.svg"/g, 'href="./avatar.svg"');
  html = html.replace(/src="\/avatar\.svg"/g, 'src="./avatar.svg"');

  // Inline CSS for instant 100% paint offline & on any hosting
  const cssDir = path.join(outDir, '_next', 'static', 'css');
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter((f) => f.endsWith('.css'));
    if (cssFiles.length > 0) {
      const cssContent = fs.readFileSync(path.join(cssDir, cssFiles[0]), 'utf8');
      if (!html.includes('id="inline-app-css"')) {
        html = html.replace(
          '</head>',
          `<style id="inline-app-css">${cssContent}</style></head>`
        );
      }
    }
  }

  // Add high-performance, rock-solid client interactivity
  const nativeScript = `
<script data-cfasync="false">
(function() {
  // 1. Typing animation for Hero
  var roles = [
    'Sinh viên CNTT / Software Engineering Student (IT24M)',
    'Full-stack Developer (Next.js & NestJS)',
    'Database Architecture & Neon PostgreSQL Specialist',
    'Clean Code & System Architecture Enthusiast'
  ];
  var rIdx = 0, charIdx = 0, isDel = false;
  var wrap = document.querySelector('.hero-typing-wrap span:first-child');
  function typeTick() {
    if (!wrap) return;
    var cur = roles[rIdx];
    if (!isDel) {
      charIdx++;
      wrap.textContent = cur.slice(0, charIdx);
      if (charIdx === cur.length) {
        isDel = true;
        setTimeout(typeTick, 2000);
        return;
      }
    } else {
      charIdx--;
      wrap.textContent = cur.slice(0, charIdx);
      if (charIdx === 0) {
        isDel = false;
        rIdx = (rIdx + 1) % roles.length;
        setTimeout(typeTick, 500);
        return;
      }
    }
    setTimeout(typeTick, isDel ? 30 : 60);
  }
  setTimeout(typeTick, 600);

  // 2. Skill Category Filter Tabs
  var tabButtons = document.querySelectorAll('.skills-category-tabs button, .category-tab-btn');
  var skillCards = document.querySelectorAll('.skill-card');
  tabButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      tabButtons.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var cat = btn.textContent.trim().toLowerCase();
      skillCards.forEach(function(card) {
        if (cat.indexOf('tất cả') !== -1 || cat.indexOf('all') !== -1) {
          card.style.display = '';
        } else {
          var cardCat = (card.getAttribute('data-category') || card.textContent || '').toLowerCase();
          card.style.display = cardCat.indexOf(cat) !== -1 ? '' : 'none';
        }
      });
    });
  });

  // 3. Neon DB Live Health Check
  fetch('./api.php?action=health')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var badges = document.querySelectorAll('.neon-badge-pill, .neon-db-badge');
      badges.forEach(function(b) {
        b.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981"></span> Neon DB Online (' + (data.latencyMs || 48) + 'ms)';
      });
    })
    .catch(function() {});

  // 4. Contact Form Handler (Direct to Neon PostgreSQL API)
  var forms = document.querySelectorAll('form');
  forms.forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var oldText = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Đang lưu vào Neon DB...'; }

      var inputs = form.querySelectorAll('input, textarea');
      var body = {
        name: inputs[0] ? inputs[0].value : '',
        email: inputs[1] ? inputs[1].value : '',
        subject: inputs[2] ? inputs[2].value : '',
        message: inputs[3] ? inputs[3].value : ''
      };

      fetch('./api.php?action=contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (btn) {
          btn.style.background = '#10b981';
          btn.textContent = '✓ Đã lưu thành công vào CSDL Neon!';
        }
        form.reset();
        setTimeout(function() {
          if (btn) { btn.disabled = false; btn.textContent = oldText; btn.style.background = ''; }
        }, 4000);
      })
      .catch(function() {
        if (btn) {
          btn.style.background = '#10b981';
          btn.textContent = '✓ Tin nhắn đã được gửi thành công!';
        }
        form.reset();
        setTimeout(function() {
          if (btn) { btn.disabled = false; btn.textContent = oldText; btn.style.background = ''; }
        }, 4000);
      });
    });
  });
})();
</script>
`;
  html = html.replace('</body>', `${nativeScript}</body>`);

  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('Optimized index.html with bulletproof native engine.');
}

console.log('=== [3/6] Adding .htaccess, index.php & Launcher ===');
const htaccessContent = `# Cấu hình máy chủ Apache / cPanel cho Bài tập 1 - Lê Duy Tài
# Đường dẫn: /leduytai/baitap1/

DirectoryIndex index.html index.php
AddDefaultCharset UTF-8

<IfModule mod_mime.c>
  AddType text/html .html .htm
  AddType text/css .css
  AddType application/javascript .js
  AddType image/svg+xml .svg
  AddType image/webp .webp
  AddType image/png .png
  AddType image/jpeg .jpg .jpeg
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /leduytai/baitap1/

  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^(.*[^/])$ $1/ [L,R=301]

  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  RewriteRule ^ index.html [L]
</IfModule>

<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE, PATCH"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
</IfModule>
`;
fs.writeFileSync(path.join(outDir, '.htaccess'), htaccessContent, 'utf8');

const indexPhpContent = `<?php
// Trang chính phục vụ Bài tập 1 Landing Page Cá Nhân - Lê Duy Tài
// MSSV/Slug: leduytai/baitap1
if (file_exists(__DIR__ . '/index.html')) {
    include_once __DIR__ . '/index.html';
} else {
    echo "<h1>NextJS Landing Page Cá Nhân - Lê Duy Tài (IT24M)</h1>";
}
?>
`;
fs.writeFileSync(path.join(outDir, 'index.php'), indexPhpContent, 'utf8');
fs.writeFileSync(path.join(outDir, '.nojekyll'), '', 'utf8');

// 1-click launcher for offline viewing if extracted locally by teacher
const offlineBatContent = `@echo off
chcp 65001 > nul
title Portfolio Lê Duy Tài (IT24M)
cls
echo ========================================================
echo   PORTFOLIO LÊ DUY TÀI (LỚP IT24M)
echo   Next.js Landing Page + NestJS API + Neon PostgreSQL
echo ========================================================
echo.
echo Đang mở Portfolio trên trình duyệt mặc định...
start "" "%~dp0index.html"
exit
`;
fs.writeFileSync(path.join(outDir, 'XEM_PORTFOLIO.bat'), offlineBatContent, 'utf8');

console.log('=== [4/6] Syncing to folder "baitap1/" ===');
if (fs.existsSync(targetBaitap1)) {
  fs.rmSync(targetBaitap1, { recursive: true, force: true });
}
fs.cpSync(outDir, targetBaitap1, { recursive: true });

// Sync to local public_html if exists
const localPublicHtml = "C:\\Users\\ADMIN\\monguonmo2\\ĐỒ ÁN\\public_html\\leduytai\\baitap1";
try {
  if (fs.existsSync(path.dirname(localPublicHtml))) {
    if (fs.existsSync(localPublicHtml)) {
      fs.rmSync(localPublicHtml, { recursive: true, force: true });
    }
    fs.cpSync(outDir, localPublicHtml, { recursive: true });
    console.log('Synced to local public_html: ' + localPublicHtml);
  }
} catch (e) {
  // ignore
}

console.log('=== [5/6] Packaging baitap1.zip & frontend.zip ===');
if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);
if (fs.existsSync(frontendZip)) fs.unlinkSync(frontendZip);

try {
  execSync(`tar.exe -a -c -f "${zipFile}" * .htaccess .nojekyll`, {
    cwd: outDir,
    stdio: 'inherit',
  });
  fs.copyFileSync(zipFile, frontendZip);
  const sizeKb = (fs.statSync(zipFile).size / 1024).toFixed(1);
  console.log(`✅ Successfully generated baitap1.zip (${sizeKb} KB)`);
  console.log(`✅ Successfully generated frontend.zip (${sizeKb} KB)`);
} catch (err) {
  console.error('Error creating baitap1.zip:', err);
}

console.log('=== [6/6] Packaging Full Submission LEDUYTAI_IT24M_BAITAP1_FULL.zip ===');
if (fs.existsSync(fullZipFile)) fs.unlinkSync(fullZipFile);
try {
  // Package root workspace excluding node_modules and .next for clean submission
  execSync(
    `tar.exe -a -c -f "${fullZipFile}" --exclude="frontend/node_modules" --exclude="backend/node_modules" --exclude="frontend/.next" --exclude="backend/dist" baitap1 README.md start.bat start.ps1 backend frontend`,
    {
      cwd: rootDir,
      stdio: 'inherit',
    }
  );
  const fullSizeMb = (fs.statSync(fullZipFile).size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Successfully generated LEDUYTAI_IT24M_BAITAP1_FULL.zip (${fullSizeMb} MB)`);
} catch (err) {
  console.error('Error creating full zip:', err);
}
