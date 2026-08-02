import { lfiData } from '../data/lfi.js';

export const LFIWiki = {
  callbacks: {},
  
  init(callbacks) {
    this.callbacks = callbacks;
  },
  
  insertPayload(payload) {
    const editor = this.callbacks.getEditor();
    if (!editor) return;
    
    const selection = editor.getSelection();
    editor.executeEdits('lfi-wiki', [{
      range: selection,
      text: payload,
      forceMoveMarkers: true
    }]);
    editor.focus();
  },
  
  renderSidebar(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; padding: 0;">
        <div style="padding: 10px; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
          <input type="text" id="lfi-search" placeholder="Search payloads..." style="width: 100%; box-sizing: border-box; padding: 6px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; border-radius: 4px;">
        </div>
        <div id="lfi-list" style="flex: 1; overflow-y: auto; padding: 5px;"></div>
      </div>
    `;
    
    document.getElementById('lfi-search').oninput = (e) => {
      this.renderList(e.target.value.toLowerCase());
    };
    
    this.renderList('');
  },
  
  renderList(filterText) {
    const listEl = document.getElementById('lfi-list');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    lfiData.forEach(categoryObj => {
      const filteredItems = categoryObj.items.filter(itemB64 => {
        const decoded = decodeURIComponent(escape(atob(itemB64)));
        return decoded.toLowerCase().includes(filterText) || categoryObj.category.toLowerCase().includes(filterText);
      });
      
      if (filteredItems.length === 0) return;
      
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
      
      filteredItems.forEach(itemB64 => {
        const decoded = decodeURIComponent(escape(atob(itemB64)));
        
        const itemDiv = document.createElement('div');
        itemDiv.style.cssText = 'margin: 5px 0; border: 1px solid var(--border-color); background: var(--bg-primary); border-radius: 4px; padding: 6px; display: flex; align-items: center; justify-content: space-between;';
        
        const code = document.createElement('code');
        code.style.cssText = 'font-size: 0.8em; font-family: monospace; color: #c9d1d9; word-break: break-all;';
        code.innerText = decoded;
        
        const btn = document.createElement('button');
        btn.innerText = 'Inject';
        btn.style.cssText = 'background: #238636; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 0.75em; font-weight: bold; margin-left: 10px; flex-shrink: 0;';
        btn.onclick = () => this.insertPayload(decoded);
        
        itemDiv.appendChild(code);
        itemDiv.appendChild(btn);
        itemsContainer.appendChild(itemDiv);
      });
      
      listEl.appendChild(categoryHeader);
      listEl.appendChild(itemsContainer);
    });
  }
};
