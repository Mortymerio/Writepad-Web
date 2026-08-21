const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  // Wait for server to be ready
  await page.waitForTimeout(1000);
  
  await page.goto('http://localhost:5173/Writepad-Web/');
  
  // Wait for monaco and DOM
  await page.waitForTimeout(2000);

  const artifactsDir = 'C:\\\\Users\\\\Mariano\\\\.gemini\\\\antigravity\\\\brain\\\\8df69317-02f2-4858-940c-2f7d5ca79d3e';
  
  const buttons = [
    { id: 'btn-nmap-parser', name: 'nmap-parser.png' },
    { id: 'btn-cmd-builder', name: 'cmd-builder.png' },
    { id: 'btn-tpl-gen', name: 'tpl-gen.png' },
    { id: 'btn-tty-stab', name: 'tty-stab.png' },
    { id: 'btn-recipe', name: 'recipe-pipeline.png' }
  ];

  for (const btn of buttons) {
    console.log(`Clicking ${btn.id}...`);
    // ensure sidebar is hidden first so click opens it cleanly and buttons are visible
    await page.evaluate(() => {
      document.querySelectorAll('.toolbar-btn').forEach(b => b.style.display = 'block');
      const rightSidebar = document.getElementById('right-sidebar');
      if (rightSidebar) rightSidebar.style.display = 'none';
    });
    
    await page.$eval(`#${btn.id}`, el => el.click());
    await page.waitForTimeout(500); // let it render
    
    // Screenshot just the right sidebar
    const sidebarElement = await page.$('#right-sidebar');
    await sidebarElement.screenshot({ path: path.join(artifactsDir, btn.name) });
  }

  // Also test Nmap Injection
  console.log("Testing Nmap Parser Injection");
  await page.$eval('#btn-nmap-parser', el => el.click());
  await page.waitForTimeout(200);
  await page.fill('#nmap-raw-input', 'Nmap scan report for 10.10.10.5\\n22/tcp open ssh\\n80/tcp open http');
  await page.$eval('#btn-nmap-parse', el => el.click());
  await page.waitForTimeout(500);
  
  // Take a full screenshot of the editor
  await page.screenshot({ path: path.join(artifactsDir, 'nmap-editor-result.png') });

  await browser.close();
  console.log("Tests done.");
})();
