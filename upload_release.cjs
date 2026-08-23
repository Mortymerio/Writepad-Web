const { execSync } = require('child_process');

try {
  console.log('Creating Release v1.0.0...');
  execSync('gh release create v1.0.0 --title "v1.0.0 - Lanzamiento Inicial Desktop" --notes "Primera versión oficial de Writepad Desktop con soporte de auto-actualizaciones."');
  console.log('Release created.');

  const upload = (file) => {
    console.log('Uploading', file);
    execSync(`gh release upload v1.0.0 "${file}"`);
  };

  upload('update-windows.json');
  
  // Try to upload the bundle files
  const fs = require('fs');
  const path = require('path');

  const bundleDir = path.join('src-tauri', 'target', 'release', 'bundle');
  
  // exe setup
  const nsisDir = path.join(bundleDir, 'nsis');
  if (fs.existsSync(nsisDir)) {
    fs.readdirSync(nsisDir).forEach(file => {
      if (file.endsWith('.exe')) upload(path.join(nsisDir, file));
    });
  }

  // msi setup
  const msiDir = path.join(bundleDir, 'msi');
  if (fs.existsSync(msiDir)) {
    fs.readdirSync(msiDir).forEach(file => {
      if (file.endsWith('.msi')) upload(path.join(msiDir, file));
    });
  }

  // updater
  const updaterDir = path.join(bundleDir, 'updater');
  if (fs.existsSync(updaterDir)) {
    fs.readdirSync(updaterDir).forEach(file => {
      if (file.endsWith('.zip') || file.endsWith('.sig')) upload(path.join(updaterDir, file));
    });
  }

  console.log('All files uploaded successfully.');
} catch (e) {
  console.error('Failed to create/upload release:', e.message);
}
