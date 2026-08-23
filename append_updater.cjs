const fs = require('fs');
let main = fs.readFileSync('src/main.js', 'utf8');

const updaterCode = `
// Tauri Auto-Updater Initialization
async function initTauriUpdater() {
  if (window.__TAURI_INTERNALS__) {
    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const { ask } = await import('@tauri-apps/plugin-dialog');
      const update = await check();
      if (update) {
        const yes = await ask(\`Update available: \${update.version}. Do you want to install it?\`, {
          title: 'Update Available',
          kind: 'info',
        });
        if (yes) {
          await update.downloadAndInstall();
          const { relaunch } = await import('@tauri-apps/plugin-process');
          await relaunch();
        }
      }
    } catch(e) {
      console.warn('Tauri updater not available or failed:', e);
    }
  }
}
initTauriUpdater();
`;

fs.appendFileSync('src/main.js', updaterCode);
console.log('Appended updater code.');
