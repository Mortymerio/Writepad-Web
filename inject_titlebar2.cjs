const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const titlebarHtml = `
    <div class="custom-titlebar" data-tauri-drag-region>
      <div class="titlebar-left" data-tauri-drag-region>
        <img src="./icon_square.png" class="titlebar-icon" data-tauri-drag-region />
      </div>
      <div class="titlebar-drag-area" data-tauri-drag-region></div>
      <div class="titlebar-controls">
        <div class="titlebar-btn" id="titlebar-minimize">&#x2013;</div>
        <div class="titlebar-btn" id="titlebar-maximize">&#x2610;</div>
        <div class="titlebar-btn titlebar-close" id="titlebar-close">&#x2715;</div>
      </div>
    </div>
`;

if (html.includes('custom-titlebar')) {
    html = html.replace(/<div class="custom-titlebar".*?<\/div>\s*<\/div>\s*<\/div>/s, '');
}
if (html.includes('class="app-container app-rounded"')) {
    html = html.replace('class="app-container app-rounded"', '');
}

html = html.replace('<div id="app">', '<div id="app" class="app-rounded">\n' + titlebarHtml);

fs.writeFileSync('index.html', html);
console.log('Added titlebar to index.html successfully!');
