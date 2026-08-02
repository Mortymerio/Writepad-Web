export const EncoderPanel = {
  callbacks: {},
  
  init(callbacks) {
    this.callbacks = callbacks;
  },
  
  renderSidebar(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; padding: 10px; box-sizing: border-box; background: var(--bg-primary); color: var(--text-primary);">
        <div style="margin-bottom: 10px;">
          <label style="font-size: 0.8em; font-weight: bold;">Input:</label>
          <textarea id="encoder-input" style="width: 100%; height: 100px; box-sizing: border-box; margin-top: 5px; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.9em;"></textarea>
          <button id="encoder-btn-selection" style="margin-top: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer; padding: 4px; border-radius: 4px; font-size: 0.8em; width: 100%;">Get Editor Selection</button>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 0.8em; font-weight: bold;">Operation:</label>
          <select id="encoder-operation" style="width: 100%; box-sizing: border-box; margin-top: 5px; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; font-size: 0.9em;">
            <option value="b64-enc">Base64 Encode</option>
            <option value="b64-dec">Base64 Decode</option>
            <option value="url-enc">URL Encode</option>
            <option value="url-dec">URL Decode</option>
            <option value="hex-enc">Hex Encode</option>
            <option value="hex-dec">Hex Decode</option>
            <option value="html-enc">HTML Encode</option>
            <option value="html-dec">HTML Decode</option>
            <option value="rot13">ROT13</option>
          </select>
        </div>
        
        <div style="margin-bottom: 10px; flex: 1; display: flex; flex-direction: column;">
          <label style="font-size: 0.8em; font-weight: bold;">Output:</label>
          <textarea id="encoder-output" readonly style="width: 100%; flex: 1; box-sizing: border-box; margin-top: 5px; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; resize: none; font-family: monospace; font-size: 0.9em;"></textarea>
          <button id="encoder-btn-insert" style="margin-top: 5px; background: #238636; color: white; border: none; cursor: pointer; padding: 6px; border-radius: 4px; font-size: 0.9em; width: 100%; font-weight: bold;">Insert at Cursor</button>
        </div>
      </div>
    `;
    
    const inputEl = document.getElementById('encoder-input');
    const outputEl = document.getElementById('encoder-output');
    const opEl = document.getElementById('encoder-operation');
    
    const processOutput = () => {
      const text = inputEl.value;
      const op = opEl.value;
      let res = '';
      try {
        if (!text) {
          outputEl.value = '';
          return;
        }
        if (op === 'b64-enc') res = btoa(unescape(encodeURIComponent(text)));
        else if (op === 'b64-dec') res = decodeURIComponent(escape(atob(text)));
        else if (op === 'url-enc') res = encodeURIComponent(text);
        else if (op === 'url-dec') res = decodeURIComponent(text);
        else if (op === 'rot13') {
          res = text.replace(/[a-zA-Z]/g, c => {
            const base = c <= 'Z' ? 65 : 97;
            return String.fromCharCode((c.charCodeAt(0) - base + 13) % 26 + base);
          });
        }
        else if (op === 'hex-enc') {
          res = text.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
        }
        else if (op === 'hex-dec') {
          const hex = text.replace(/[^0-9A-Fa-f]/g, '');
          for (let i = 0; i < hex.length; i += 2) {
            res += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
          }
        }
        else if (op === 'html-enc') {
          const div = document.createElement('div');
          div.innerText = text;
          res = div.innerHTML;
        }
        else if (op === 'html-dec') {
          const div = document.createElement('div');
          div.innerHTML = text;
          res = div.innerText;
        }
        outputEl.value = res;
      } catch (e) {
        outputEl.value = "Error: Invalid input for this operation.";
      }
    };
    
    inputEl.addEventListener('input', processOutput);
    opEl.addEventListener('change', processOutput);
    
    document.getElementById('encoder-btn-selection').onclick = () => {
      const editor = this.callbacks.getEditor();
      if (!editor) return;
      const selection = editor.getSelection();
      const text = editor.getModel().getValueInRange(selection);
      if (text) {
        inputEl.value = text;
        processOutput();
      }
    };
    
    document.getElementById('encoder-btn-insert').onclick = () => {
      const editor = this.callbacks.getEditor();
      if (!editor || !outputEl.value || outputEl.value.startsWith('Error:')) return;
      
      const selection = editor.getSelection();
      editor.executeEdits('encoder', [{
        range: selection,
        text: outputEl.value,
        forceMoveMarkers: true
      }]);
      editor.focus();
    };
  }
};
