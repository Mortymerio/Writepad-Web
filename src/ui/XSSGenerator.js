import { xssData } from '../data/xss.js';

export const XSSGenerator = {
  callbacks: {},
  payload: 'alert(1)',
  
  init(callbacks) {
    this.callbacks = callbacks;
  },
  
  insertPayload(payload) {
    const editor = this.callbacks.getEditor();
    if (!editor) return;
    
    const selection = editor.getSelection();
    editor.executeEdits('xss-generator', [{
      range: selection,
      text: payload,
      forceMoveMarkers: true
    }]);
    editor.focus();
  },
  
  renderSidebar(container) {
    container.innerHTML = `
      <div class="panel-container">
        <div style="padding: 10px; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
          <div style="margin-bottom: 5px;">
            <label style="font-size: 0.8em; color: var(--text-primary); font-weight: bold;">Inner JS Payload:</label>
            <input type="text" id="xss-payload" value="${this.payload}" placeholder="e.g. fetch('http://ip/')" style="width: 100%; box-sizing: border-box; margin-top: 2px; padding: 4px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none;">
          </div>
        </div>
        <div id="xss-list" style="flex: 1; overflow-y: auto; padding: 5px;"></div>
      </div>
    `;
    
    document.getElementById('xss-payload').oninput = (e) => {
      this.payload = e.target.value || 'alert(1)';
      this.renderList();
    };
    
    this.renderList();
  },
  
  renderList() {
    const listEl = document.getElementById('xss-list');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    xssData.forEach(categoryObj => {
      const categoryHeader = document.createElement('div');
      categoryHeader.style.cssText = 'padding: 8px 5px; font-weight: bold; color: #58a6ff; font-size: 0.9em; border-bottom: 1px solid var(--border-color); margin-top: 10px; cursor: pointer;';
      categoryHeader.innerText = '▼ ' + categoryObj.category;
      
      const itemsContainer = document.createElement('div');
      itemsContainer.style.display = 'block';
      
      categoryHeader.onclick = () => {
        const isVisible = itemsContainer.style.display !== 'none';
        itemsContainer.style.display = isVisible ? 'none' : 'block';
        categoryHeader.innerText = (isVisible ? '▶ ' : '▼ ') + categoryObj.category;
      };
      
      categoryObj.items.forEach(itemB64 => {
        const baseDecoded = decodeURIComponent(escape(atob(itemB64)));
        const finalPayload = baseDecoded.replace(/alert\(1\)/g, this.payload);
        
        const itemDiv = document.createElement('div');
        itemDiv.style.cssText = 'margin: 8px 0; border: 1px solid var(--border-color); background: var(--bg-primary); border-radius: 4px; padding: 0; display: flex; flex-direction: column; overflow: hidden;';
        
        const pre = document.createElement('pre');
        pre.style.cssText = 'font-size: 0.75em; font-family: monospace; color: #c9d1d9; background: #0d1117; padding: 8px; margin: 0; white-space: pre-wrap; word-break: break-all;';
        pre.innerText = finalPayload;
        
        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'padding: 4px 8px; background: var(--bg-secondary); border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end;';
        
        const btn = document.createElement('button');
        btn.innerText = 'Inject';
        btn.style.cssText = 'background: #238636; color: white; border: none; border-radius: 4px; padding: 4px 12px; cursor: pointer; font-size: 0.8em; font-weight: bold;';
        btn.onclick = () => this.insertPayload(finalPayload);
        
        btnContainer.appendChild(btn);
        itemDiv.appendChild(pre);
        itemDiv.appendChild(btnContainer);
        itemsContainer.appendChild(itemDiv);
      });
      
      listEl.appendChild(categoryHeader);
      listEl.appendChild(itemsContainer);
    });
  }
};
