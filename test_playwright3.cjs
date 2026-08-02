const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000/Writepad-Web/');
    await page.waitForTimeout(3000);
    
    // Dump computed style of #app
    const appStyle = await page.evaluate(() => {
      const app = document.getElementById('app');
      if (!app) return 'NO APP FOUND';
      const style = window.getComputedStyle(app);
      return {
        display: style.display,
        flexDirection: style.flexDirection,
        width: style.width,
        height: style.height
      };
    });
    console.log('--- APP STYLE ---');
    console.log(appStyle);
    
    // Dump computed style of menu-bar
    const menuBarStyle = await page.evaluate(() => {
      const el = document.querySelector('.menu-bar');
      if (!el) return 'NO MENU BAR';
      const style = window.getComputedStyle(el);
      return {
        display: style.display,
        width: style.width,
        height: style.height
      };
    });
    console.log('--- MENU BAR STYLE ---');
    console.log(menuBarStyle);

    // Get body class
    const bodyClass = await page.evaluate(() => document.body.className);
    console.log('--- BODY CLASS ---');
    console.log(bodyClass);
    
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
