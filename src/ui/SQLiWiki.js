import * as monaco from 'monaco-editor';
import sqliData from '../data/sqli.json';

export const SQLiWiki = {
  callbacks: {},
  engines: [],
  
  init(callbacks) {
    this.callbacks = callbacks;
    this.engines = Object.keys(sqliData).sort();
  },
  
  renderSidebar(container) {
    container.innerHTML = `
      <div class="panel-container">
        <input type="text" id="sqli-search" placeholder="Search engine (e.g. MySQL)..." style="margin: 5px; padding: 5px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none;">
        <div id="sqli-list" style="flex: 1; overflow-y: auto; padding: 5px;"></div>
      </div>
    `;
    
    const searchInput = document.getElementById('sqli-search');
    if (searchInput) {
      searchInput.oninput = (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = this.engines.filter(b => b.toLowerCase().includes(term));
        this.renderList(filtered);
      };
    }
    
    this.renderList(this.engines);
  },
  
  renderList(engines) {
    const listEl = document.getElementById('sqli-list');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    if (engines.length === 0) {
      listEl.innerHTML = '<div style="padding: 10px; color: #888; text-align: center;">No engines found.</div>';
      return;
    }
    
    engines.forEach(engineName => {
      const container = document.createElement('div');
      container.className = 'sqli-item';
      container.style.cssText = 'margin-bottom: 5px; border: 1px solid var(--border-color); background: var(--bg-primary); border-radius: 4px; color: var(--text-primary);';
      
      const header = document.createElement('div');
      header.style.cssText = 'padding: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary); border-radius: 4px;';
      
      const title = document.createElement('strong');
      title.innerText = engineName;
      
      const categories = Object.keys(sqliData[engineName]);
      const badge = document.createElement('span');
      badge.style.cssText = 'font-size: 0.7em; background: #a5d6ff; color: #0d1117; padding: 2px 6px; border-radius: 10px;';
      badge.innerText = categories.length + " cats";
      
      header.appendChild(title);
      header.appendChild(badge);
      
      const body = document.createElement('div');
      body.style.cssText = 'padding: 8px; display: none; border-top: 1px solid var(--border-color);';
      
      categories.forEach(catName => {
        const catBlock = document.createElement('div');
        catBlock.style.cssText = 'margin-bottom: 8px;';
        
        const catTitle = document.createElement('div');
        catTitle.style.cssText = 'font-weight: bold; font-size: 0.85em; color: #ff7b72; margin-bottom: 4px;';
        catTitle.innerText = catName.toUpperCase();
        
        catBlock.appendChild(catTitle);
        
        const payloads = sqliData[engineName][catName];
        payloads.forEach(p => {
            const row = document.createElement('div');
            row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;';
            
            const pre = document.createElement('pre');
            pre.style.cssText = 'flex: 1; background: #0d1117; padding: 5px; border-radius: 4px; font-size: 0.75em; overflow-x: auto; margin: 0; margin-right: 4px; color: #c9d1d9; font-family: monospace;';
            pre.innerText = p;
            
            const injectBtn = document.createElement('button');
            injectBtn.innerText = 'Inject';
            injectBtn.style.cssText = 'background: #238636; color: white; border: none; border-radius: 4px; padding: 4px; cursor: pointer; font-size: 0.75em; flex-shrink: 0;';
            
            injectBtn.onclick = (e) => {
              e.stopPropagation();
              this.insertPayload(p);
            };
            
            row.appendChild(pre);
            row.appendChild(injectBtn);
            catBlock.appendChild(row);
        });
        
        body.appendChild(catBlock);
      });
      
      header.onclick = () => {
        const isVisible = body.style.display === 'block';
        body.style.display = isVisible ? 'none' : 'block';
      };
      
      container.appendChild(header);
      container.appendChild(body);
      listEl.appendChild(container);
    });
  },
  
  insertPayload(text) {
    const editor = this.callbacks.getEditor();
    if (!editor) return;
    
    const position = editor.getPosition();
    editor.executeEdits("SQLi", [{
      range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
      text: text,
      forceMoveMarkers: true
    }]);
    editor.focus();
  }
};
