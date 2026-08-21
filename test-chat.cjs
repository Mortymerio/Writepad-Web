const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('[Browser ' + msg.type() + '] ' + msg.text()));
  page.on('pageerror', err => console.error('[Browser Error]', err));

  try {
    await page.goto('http://localhost:5173/Writepad-Web/', { waitUntil: 'networkidle' });
    console.log('Page loaded');
    
    // Evaluate in page to click the agents button
    await page.evaluate(() => {
      document.getElementById('btn-agents').click();
    });
    
    await page.waitForTimeout(1000);
    
    // Click the first agent card
    await page.evaluate(() => {
      const cards = document.querySelectorAll('.agent-card');
      if(cards.length > 0) cards[0].click();
      else console.log('No agent cards found!');
    });
    
    await page.waitForTimeout(1000);
    
    // Type and send message
    await page.evaluate(() => {
      const input = document.getElementById('ag-chat-input');
      const btn = document.getElementById('btn-agent-send');
      if (input && btn) {
        input.value = 'hello';
        btn.click();
      }
    });

    await page.waitForTimeout(3000);
    
  } catch (e) {
    console.error('Script error:', e);
  } finally {
    await browser.close();
  }
})();
