const { chromium } = require('playwright');
const http = require('http');

async function checkServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5173/Writepad-Web/', (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 404); // 404 is fine if base url differs
    });
    req.on('error', () => resolve(false));
  });
}

(async () => {
  let isRunning = await checkServer();
  if (!isRunning) {
    console.log("Server is not running on 5173. Please run npm run dev.");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/Writepad-Web/');
  
  // Wait for Monaco Editor to load
  await page.waitForSelector('.monaco-editor', { timeout: 10000 });
  
  // Click Nmap Auto-Parser button
  console.log("Clicking Nmap parser...");
  await page.click('#btn-nmap-parser');
  
  // Wait for sidebar to open and resize handle to appear
  await page.waitForTimeout(500); // give Monaco layout 10ms timeout time to resolve

  // Get bounding boxes
  const handleBox = await page.evaluate(() => {
    const el = document.getElementById('right-sidebar-resize-handle');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const computed = window.getComputedStyle(el);
    return {
      x: rect.x, y: rect.y, width: rect.width, height: rect.height,
      display: computed.display, zIndex: computed.zIndex, visibility: computed.visibility
    };
  });
  
  const editorBox = await page.evaluate(() => {
    const el = document.getElementById('editor-container');
    const rect = el.getBoundingClientRect();
    const computed = window.getComputedStyle(el);
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, overflow: computed.overflow };
  });

  const sidebarBox = await page.evaluate(() => {
    const el = document.getElementById('right-sidebar');
    const rect = el.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  
  const monacoBox = await page.evaluate(() => {
    const el = document.querySelector('.monaco-editor');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });

  console.log("--- LAYOUT ANALYSIS ---");
  console.log("Editor Container:", editorBox);
  console.log("Monaco Editor Inner:", monacoBox);
  console.log("Resize Handle:", handleBox);
  console.log("Right Sidebar:", sidebarBox);
  
  // Check overlaps
  if (handleBox && handleBox.display !== 'none') {
    if (editorBox.x + editorBox.width > handleBox.x) {
      console.log(`⚠️ OVERLAP DETECTED: Editor Container overlaps Handle by ${(editorBox.x + editorBox.width) - handleBox.x}px`);
    } else {
      console.log("✅ No overlap between Editor Container and Handle");
    }
    
    if (monacoBox && monacoBox.x + monacoBox.width > handleBox.x) {
      console.log(`⚠️ OVERLAP DETECTED: Monaco Editor overlaps Handle by ${(monacoBox.x + monacoBox.width) - handleBox.x}px`);
    } else {
      console.log("✅ No overlap between Monaco Editor and Handle");
    }
  }

  await browser.close();
})();
