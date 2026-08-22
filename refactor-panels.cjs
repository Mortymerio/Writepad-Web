const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'src', 'ui');
const files = fs.readdirSync(uiDir).filter(f => f.endsWith('Panel.js') && f !== 'AgentPanel.js' && f !== 'MarkdownPreviewPanel.js' && f !== 'RepeaterPanel.js' && f !== 'TodoTreePanel.js' && f !== 'RestClientPanel.js');

const replacements = [
  [/<div style="display: flex; flex-direction: column; height: 100%; box-sizing: border-box; background: var\(--bg-primary\); color: var\(--text-primary\);">/g, '<div class="panel-container">'],
  [/<div style="padding: 10px; background: var\(--bg-secondary\); border-bottom: 1px solid var\(--border-light\); font-weight: bold;">/g, '<div class="panel-header">'],
  [/<div style="flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;">/g, '<div class="panel-content">'],
  [/<div style="display: flex; flex-direction: column; gap: 5px;">/g, '<div class="panel-group">'],
  [/<label style="font-weight: bold; font-size: 0\.9em; color: var\(--text-primary\);">/g, '<label class="panel-label">'],
  [/<span style="font-size: 0\.8em; color: var\(--text-secondary\);">/g, '<span class="panel-desc">'],
  [/<div style="font-size: 0\.8em; color: var\(--text-secondary\); margin-top: -3px;">/g, '<div class="panel-desc">'],
  [/style="width: 100%; box-sizing: border-box; padding: 8px; background: var\(--bg-secondary\); color: var\(--text-primary\); border: 1px solid var\(--border-light\); border-radius: 4px; font-family: inherit;"/g, 'class="panel-input"'],
  [/style="width: 100%; box-sizing: border-box; padding: 8px; background: var\(--bg-secondary\); color: var\(--text-primary\); border: 1px solid var\(--border-light\); border-radius: 4px; font-family: inherit; resize: vertical; min-height: 80px;"/g, 'class="panel-input panel-textarea"'],
  [/style="width: 100%; padding: 8px; background: var\(--bg-secondary\); color: var\(--text-primary\); border: 1px solid var\(--border-light\); border-radius: 4px;"/g, 'class="panel-select"'],
  [/style="padding: 10px; background: var\(--accent\); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;"/g, 'class="panel-btn"'],
  [/style="display: none; flex-direction: column; gap: 5px; margin-top: 10px;"/g, 'class="panel-output-area"'],
  [/style="width: 100%; box-sizing: border-box; height: 150px; background: var\(--bg-secondary\); color: var\(--text-primary\); border: 1px solid var\(--border-light\); border-radius: 4px; padding: 8px; resize: vertical; font-family: monospace;"/g, 'class="panel-output-box"']
];

let modifiedCount = 0;
for (const file of files) {
  const filePath = path.join(uiDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const [regex, replace] of replacements) {
    content = content.replace(regex, replace);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    modifiedCount++;
    console.log(`Modified: ${file}`);
  }
}
console.log(`Total files modified: ${modifiedCount}`);
