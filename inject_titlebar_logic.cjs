const fs = require('fs');
let main = fs.readFileSync('src/main.js', 'utf8');

const titlebarLogic = `
// Tauri Titlebar Logic
async function initTitlebar() {
  if (window.__TAURI_INTERNALS__) {
    document.documentElement.classList.add('is-tauri');
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      
      document.getElementById('titlebar-minimize')?.addEventListener('click', () => appWindow.minimize());
      document.getElementById('titlebar-maximize')?.addEventListener('click', () => appWindow.toggleMaximize());
      document.getElementById('titlebar-close')?.addEventListener('click', () => appWindow.close());
    } catch(e) {
      console.warn('Failed to init titlebar', e);
    }
  }
}
initTitlebar();
`;

if (!main.includes('initTitlebar()')) {
  fs.appendFileSync('src/main.js', '\n' + titlebarLogic);
}
