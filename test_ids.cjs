const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

const idsToCheck = [
  'btn-new', 'btn-open', 'btn-save', 'btn-save-all', 'btn-close', 'btn-close-all', 'btn-print',
  'btn-cut', 'btn-copy', 'btn-paste', 'btn-undo', 'btn-redo', 'btn-find', 'btn-replace',
  'btn-zoom-in', 'btn-zoom-out', 'btn-word-wrap', 'btn-invisibles', 'btn-minimap', 'btn-run',
  'btn-macro-record', 'btn-macro-stop', 'btn-macro-play', 'btn-macro-run-multi',
  'btn-close-macro-multi', 'btn-confirm-macro-multi', 'btn-macro-save', 'btn-close-macro-save',
  'btn-confirm-macro-save', 'btn-invisibles-arrow', 'dropdown-invisibles', 'btn-vim-mode',
  'btn-close-ai-config', 'btn-save-ai-config', 'menu-ai', 'btn-save-preferences', 'btn-close-preferences'
];

let missing = [];
for (let id of idsToCheck) {
  if (!document.getElementById(id)) {
    missing.push(id);
  }
}

console.log('Missing IDs:', missing);
