const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'src', 'ui');
const files = fs.readdirSync(uiDir).filter(f => f.endsWith('.js') && f !== 'AgentPanel.js' && f !== 'CommunityHub.js' && f !== 'SidebarManager.js' && f !== 'MarkdownPreviewPanel.js');

let totalModified = 0;

for (const file of files) {
  const filePath = path.join(uiDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Generalized aggressive CSS replacing
  content = content.replace(/style="display: flex; flex-direction: column; height: 100%;[^"]+"/g, 'class="panel-container"');
  content = content.replace(/style="margin-bottom: 10px;"/g, 'class="panel-group"');
  content = content.replace(/style="margin-bottom: 10px; flex: 1; display: flex; flex-direction: column;"/g, 'class="panel-group" style="flex:1"');
  content = content.replace(/style="font-size: 0\.8em; font-weight: bold;"/g, 'class="panel-label"');
  content = content.replace(/style="width: 100%; height: 100px; box-sizing: border-box; margin-top: 5px; padding: 5px; background: var\(--bg-secondary\); color: var\(--text-primary\); border: 1px solid var\(--border-color\); outline: none; resize: vertical; font-family: monospace; font-size: 0\.9em;"/g, 'class="panel-input panel-textarea"');
  content = content.replace(/style="width: 100%; flex: 1; box-sizing: border-box; margin-top: 5px; padding: 5px; background: var\(--bg-secondary\); color: var\(--text-primary\); border: 1px solid var\(--border-color\); outline: none; resize: none; font-family: monospace; font-size: 0\.9em;"/g, 'class="panel-output-box"');
  content = content.replace(/style="width: 100%; box-sizing: border-box; margin-top: 5px; padding: 5px; background: var\(--bg-secondary\); color: var\(--text-primary\); border: 1px solid var\(--border-color\); outline: none; font-size: 0\.9em;"/g, 'class="panel-select"');
  content = content.replace(/style="margin-top: 5px; background: var\(--bg-secondary\); color: var\(--text-primary\); border: 1px solid var\(--border-color\); cursor: pointer; padding: 4px; border-radius: 4px; font-size: 0\.8em; width: 100%;"/g, 'class="panel-btn" style="background:var(--bg-secondary); color:var(--text-primary);"');
  content = content.replace(/style="margin-top: 5px; background: #238636; color: white; border: none; cursor: pointer; padding: 6px; border-radius: 4px; font-size: 0\.9em; width: 100%; font-weight: bold;"/g, 'class="panel-btn"');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    totalModified++;
    console.log(`Modified: ${file}`);
  }
}

console.log(`Total panels refactored: ${totalModified}`);
