const fs = require('fs');
const path = require('path');

function copyDirRecursive(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  const entries = fs.readdirSync(source, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Convert all /_next/ to ./_next/ in web/out html files
function patchHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      patchHtmlFiles(fullPath);
    } else if (entry.name.endsWith('.html') || entry.name.endsWith('.txt')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('/_next/')) {
        content = content.split('/_next/').join('./_next/');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Patched paths in: ${fullPath}`);
      }
    }
  }
}

console.log('1. Patching web/out HTML files with relative paths...');
patchHtmlFiles('web/out');

// 2. Prepare public_html destinations
const target1 = 'public_html/leduytai/doan';
const target2 = 'public_html/leduytai/doan/leduytai/doan';
const rootNext = 'public_html/_next';

console.log('2. Deploying web/out to public_html/leduytai/doan...');
copyDirRecursive('web/out', target1);

console.log('3. Deploying web/out to nested public_html/leduytai/doan/leduytai/doan...');
copyDirRecursive('web/out', target2);

console.log('4. Copying _next to public_html root as fallback...');
if (fs.existsSync('web/out/_next')) {
  copyDirRecursive('web/out/_next', rootNext);
}

// Ensure .htaccess and helper php scripts are kept in target directories
const htaccessContent = `AddDefaultCharset UTF-8
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
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  RewriteRule ^ index.html [L]
</IfModule>
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
</IfModule>
`;

fs.writeFileSync(path.join(target1, '.htaccess'), htaccessContent, 'utf8');
fs.writeFileSync(path.join(target2, '.htaccess'), htaccessContent, 'utf8');

console.log('All files copied and updated successfully!');
