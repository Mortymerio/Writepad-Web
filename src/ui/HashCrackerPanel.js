import { hashData } from '../data/hashData.js';

export const HashCrackerPanel = {
  callbacks: {},
  
  init(callbacks) {
    this.callbacks = callbacks;
  },
  
  renderSidebar(container) {
    container.innerHTML = `
      <div class="panel-container">
        <div class="panel-group">
          <label class="panel-label">Paste Hash:</label>
          <textarea id="hash-input" placeholder="e.g. 5d41402abc4b2a76b9719d911017c592" style="width: 100%; height: 80px; box-sizing: border-box; margin-top: 5px; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.9em;"></textarea>
          <button id="hash-btn-selection" class="panel-btn" style="background:var(--bg-secondary); color:var(--text-primary);">Get Editor Selection</button>
        </div>
        
        <div id="hash-results" style="flex: 1; overflow-y: auto; padding-top: 10px; border-top: 1px solid var(--border-color);">
          <div style="color: #888; font-size: 0.9em; text-align: center; margin-top: 20px;">Enter a hash to identify it.</div>
        </div>
      </div>
    `;
    
    const inputEl = document.getElementById('hash-input');
    const resultsEl = document.getElementById('hash-results');
    
    const analyzeHash = () => {
      const h = inputEl.value.trim();
      if (!h) {
        resultsEl.innerHTML = '<div style="color: #888; font-size: 0.9em; text-align: center; margin-top: 20px;">Enter a hash to identify it.</div>';
        return;
      }
      
      const matches = hashData.filter(d => d.regex.test(h));
      
      if (matches.length === 0) {
        resultsEl.innerHTML = '<div style="color: #ff7b72; font-size: 0.9em; text-align: center; margin-top: 20px;">Unknown Hash Format</div>';
        return;
      }
      
      let html = '';
      matches.forEach(m => {
        html += `
          <div style="margin-bottom: 15px; border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 4px; padding: 8px;">
            <div style="font-weight: bold; font-size: 1.1em; color: #58a6ff;">${m.name}</div>
            ${m.note ? `<div style="font-size: 0.8em; color: #8b949e; margin-top: 4px;">Note: ${m.note}</div>` : ''}
            
            <div style="margin-top: 10px; font-size: 0.85em; font-weight: bold; color: #c9d1d9;">Hashcat Mode: <span style="color: #ff7b72;">${m.mode}</span></div>
            
            <div style="margin-top: 8px;">
              <div style="font-size: 0.8em; color: #8b949e; margin-bottom: 4px;">Example Hashcat Command:</div>
              <pre style="margin: 0; background: var(--bg-primary); padding: 6px; border-radius: 4px; font-size: 0.85em; overflow-x: auto; font-family: monospace; border: 1px solid var(--border-color); color: #a5d6ff;">hashcat -a 0 -m ${m.mode} hash.txt /usr/share/wordlists/rockyou.txt</pre>
            </div>
            <div style="margin-top: 8px;">
              <div style="font-size: 0.8em; color: #8b949e; margin-bottom: 4px;">Example John Command:</div>
              <pre style="margin: 0; background: var(--bg-primary); padding: 6px; border-radius: 4px; font-size: 0.85em; overflow-x: auto; font-family: monospace; border: 1px solid var(--border-color); color: #a5d6ff;">john --format=Raw-${m.name.replace(/[^a-zA-Z0-9]/g,'')} --wordlist=/usr/share/wordlists/rockyou.txt hash.txt</pre>
            </div>
          </div>
        `;
      });
      resultsEl.innerHTML = html;
    };
    
    inputEl.addEventListener('input', analyzeHash);
    
    document.getElementById('hash-btn-selection').onclick = () => {
      const editor = this.callbacks.getEditor();
      if (!editor) return;
      const selection = editor.getSelection();
      const text = editor.getModel().getValueInRange(selection);
      if (text) {
        inputEl.value = text.trim();
        analyzeHash();
      }
    };
  }
};
