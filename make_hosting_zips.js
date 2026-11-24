const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const desktop = 'C:\\Users\\ADMIN\\OneDrive\\Máy tính';

// 1. UP_THU_MUC_PUBLIC_HTML.zip
const zip1 = path.join(__dirname, 'UP_THU_MUC_PUBLIC_HTML.zip');
if (fs.existsSync(zip1)) fs.unlinkSync(zip1);
console.log('1. Compressing UP_THU_MUC_PUBLIC_HTML.zip...');
execSync(`powershell -ExecutionPolicy Bypass -Command "Compress-Archive -Path 'public_html\\*' -DestinationPath '${zip1}' -Force"`, { stdio: 'inherit' });

if (fs.existsSync(desktop)) {
  fs.copyFileSync(zip1, path.join(desktop, 'UP_THU_MUC_PUBLIC_HTML.zip'));
  console.log('Copied to Desktop: UP_THU_MUC_PUBLIC_HTML.zip');
}

// 2. UP_TRUC_TIEP_VAO_DOAN.zip
const zip2 = path.join(__dirname, 'UP_TRUC_TIEP_VAO_DOAN.zip');
if (fs.existsSync(zip2)) fs.unlinkSync(zip2);
console.log('2. Compressing UP_TRUC_TIEP_VAO_DOAN.zip...');
execSync(`powershell -ExecutionPolicy Bypass -Command "Compress-Archive -Path 'public_html\\leduytai\\doan\\*' -DestinationPath '${zip2}' -Force"`, { stdio: 'inherit' });

if (fs.existsSync(desktop)) {
  fs.copyFileSync(zip2, path.join(desktop, 'UP_TRUC_TIEP_VAO_DOAN.zip'));
  console.log('Copied to Desktop: UP_TRUC_TIEP_VAO_DOAN.zip');
}

console.log('DONE!');
