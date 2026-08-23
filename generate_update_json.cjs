const fs = require('fs');
const path = require('path');

const version = '1.0.0';
const basePath = path.join('src-tauri', 'target', 'release', 'bundle', 'updater');
const sigFile = path.join(basePath, `writepad_${version}_x64-setup.exe.zip.sig`);

if (!fs.existsSync(sigFile)) {
  console.error('Signature file not found at', sigFile);
  process.exit(1);
}

const signature = fs.readFileSync(sigFile, 'utf8').trim();

const updateJson = {
  version: version,
  notes: "Primera versión oficial de Writepad Desktop con soporte de auto-actualizaciones.",
  pub_date: new Date().toISOString(),
  platforms: {
    "windows-x86_64": {
      signature: signature,
      url: `https://github.com/Mortymerio/Writepad-Web/releases/download/v${version}/writepad_${version}_x64-setup.exe.zip`
    }
  }
};

fs.writeFileSync('update-windows.json', JSON.stringify(updateJson, null, 2));
console.log('update-windows.json created successfully.');
