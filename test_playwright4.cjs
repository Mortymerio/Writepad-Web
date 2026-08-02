const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000/Writepad-Web/');
    await page.waitForTimeout(3000);
    
    // Dump body attributes
    const bodyInfo = await page.evaluate(() => {
      return {
        className: document.body.className,
        dataTheme: document.body.getAttribute('data-theme'),
        bgColor: window.getComputedStyle(document.body).backgroundColor
      };
    });
    console.log('--- BODY INFO ---');
    console.log(bodyInfo);
    
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
