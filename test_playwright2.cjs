const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[Browser Console Error] ${msg.text()}`);
    }
  });
  
  page.on('pageerror', err => {
    console.log(`[Browser Page Error] ${err.message}`);
  });

  try {
    await page.goto('http://localhost:3000/Writepad-Web/');
    await page.waitForTimeout(3000);
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
