const { chromium } = require('playwright');
const http = require('http');

async function checkServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5173/Writepad-Web/', (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 404);
    });
    req.on('error', () => resolve(false));
  });
}

(async () => {
  let isRunning = await checkServer();
  if (!isRunning) {
    console.log("Server not running.");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
  });
  
  console.log("Navigating...");
  await page.goto('http://localhost:5173/Writepad-Web/');
  
  await page.waitForTimeout(2000);
  console.log("Checking UI...");
  
  // Try to click the new buttons
  const buttons = ['#btn-ad-pivot', '#btn-obfuscator', '#btn-peas-analyzer'];
  for (const btn of buttons) {
    console.log("Clicking " + btn);
    try {
      await page.click(btn, { timeout: 2000 });
      await page.waitForTimeout(500);
    } catch (e) {
      console.log("Failed to click " + btn + " : " + e.message);
    }
  }

  await browser.close();
})();
