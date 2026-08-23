const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const upload = (file) => {
  console.log('Uploading', file);
  execSync(`gh release upload v1.0.0 --clobber "${file}"`);
};

const bundleDir = path.join('src-tauri', 'target', 'release', 'bundle');
const nsisDir = path.join(bundleDir, 'nsis');
if (fs.existsSync(nsisDir)) {
  fs.readdirSync(nsisDir).forEach(file => {
    if (file.endsWith('.exe')) upload(path.join(nsisDir, file));
  });
}
const msiDir = path.join(bundleDir, 'msi');
if (fs.existsSync(msiDir)) {
  fs.readdirSync(msiDir).forEach(file => {
    if (file.endsWith('.msi')) upload(path.join(msiDir, file));
  });
}
console.log('Uploads finished.');
