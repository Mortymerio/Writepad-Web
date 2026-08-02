const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000/Writepad-Web/');
    await page.waitForTimeout(1000);
    
    // Ensure cyber-mode is OFF
    await page.evaluate(() => {
      document.body.classList.remove('cyber-mode');
    });
    
    // Check computed style
    const isVisible = await page.evaluate(() => {
      const el = document.querySelector('[data-profile="cyber"]');
      if (!el) return 'NOT FOUND';
      return window.getComputedStyle(el).display;
    });
    console.log('--- CYBER GROUP DISPLAY ---');
    console.log(isVisible);
    
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
