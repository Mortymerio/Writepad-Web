const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen for console logs and errors
  page.on('console', msg => {
    console.log('[Browser ' + msg.type() + '] ' + msg.text());
  });
  page.on('pageerror', err => {
    console.error('[Browser Error]', err);
  });

  try {
    await page.goto('http://localhost:5173/Writepad-Web/', { waitUntil: 'networkidle' });
    console.log('Page loaded');
    
    // Evaluate in page to click the agents button
    await page.evaluate(() => {
      const btn = document.getElementById('btn-agents');
      if (btn) btn.click();
      else console.log('Button btn-agents not found');
    });
    
    await page.waitForTimeout(2000);
    
    // Check if the agent panel is visible
    const rightSidebar = await page.locator('#right-sidebar');
    const isVisible = await rightSidebar.isVisible();
    console.log('Right sidebar visible:', isVisible);
    
  } catch (e) {
    console.error('Script error:', e);
  } finally {
    await browser.close();
  }
})();
