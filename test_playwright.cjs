const { chromium } = require('playwright');
const http = require('http');
const handler = require('serve-handler');

const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: 'dist'
  });
});

server.listen(3000, async () => {
  console.log('Running at http://localhost:3000');
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
    await page.goto('http://localhost:3000/index.html');
    await page.waitForTimeout(2000);
  } finally {
    await browser.close();
    server.close();
  }
});
