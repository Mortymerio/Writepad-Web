import * as monaco from 'monaco-editor';
import gtfobinsData from '../data/gtfobins.json';

export const GTFOBinsWiki = {
  callbacks: {},
  binaries: [],
  
  init(callbacks) {
    this.callbacks = callbacks;
    this.binaries = Object.keys(gtfobinsData).sort();
  },
  
  renderSidebar(container) {
    container.innerHTML = `
      <div class="panel-container">
        <input type="text" id="gtfobins-search" placeholder="Search binary (e.g. nmap)..." style="margin: 5px; padding: 5px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none;">
        <div id="gtfobins-list" style="flex: 1; overflow-y: auto; padding: 5px;"></div>
      </div>
    `;
    
    const searchInput = document.getElementById('gtfobins-search');
    if (searchInput) {
      searchInput.oninput = (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = this.binaries.filter(b => b.toLowerCase().includes(term));
        this.renderList(filtered);
      };
    }
    
    this.renderList(this.binaries);
  },
  
  renderList(bins) {
    const listEl = document.getElementById('gtfobins-list');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    if (bins.length === 0) {
      listEl.innerHTML = '<div style="padding: 10px; color: #888; text-align: center;">No binaries found.</div>';
      return;
    }
    
    bins.forEach(binName => {
      const container = document.createElement('div');
      container.className = 'gtfo-bin-item';
      container.style.cssText = 'margin-bottom: 5px; border: 1px solid var(--border-color); background: var(--bg-primary); border-radius: 4px; color: var(--text-primary);';
      
      const header = document.createElement('div');
      header.style.cssText = 'padding: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary); border-radius: 4px;';
      
      const title = document.createElement('strong');
      title.innerText = binName;
      
      const funcs = Object.keys(gtfobinsData[binName]);
      const badge = document.createElement('span');
      badge.style.cssText = 'font-size: 0.7em; background: #a5d6ff; color: #0d1117; padding: 2px 6px; border-radius: 10px;';
      badge.innerText = funcs.length;
      
      header.appendChild(title);
      header.appendChild(badge);
      
      const body = document.createElement('div');
      body.style.cssText = 'padding: 8px; display: none; border-top: 1px solid var(--border-color);';
      
      funcs.forEach(funcName => {
        const funcBlock = document.createElement('div');
        funcBlock.style.cssText = 'margin-bottom: 8px;';
        
        const funcTitle = document.createElement('div');
        funcTitle.style.cssText = 'font-weight: bold; font-size: 0.85em; color: #7ee787; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;';
        funcTitle.innerText = funcName.toUpperCase();
        
        const injectBtn = document.createElement('button');
        injectBtn.innerText = 'Inject';
        injectBtn.style.cssText = 'background: #238636; color: white; border: none; border-radius: 4px; padding: 2px 6px; cursor: pointer; font-size: 0.8em;';
        
        const payloads = gtfobinsData[binName][funcName];
        let fullPayloadCode = '';
        payloads.forEach(p => fullPayloadCode += p.code + '\n');
        
        injectBtn.onclick = (e) => {
          e.stopPropagation();
          this.insertPayload(fullPayloadCode);
        };
        
        funcTitle.appendChild(injectBtn);
        funcBlock.appendChild(funcTitle);
        
        const pre = document.createElement('pre');
        pre.style.cssText = 'background: #0d1117; padding: 5px; border-radius: 4px; font-size: 0.75em; overflow-x: auto; margin: 0; color: #c9d1d9;';
        pre.innerText = fullPayloadCode.trim();
        
        funcBlock.appendChild(pre);
        body.appendChild(funcBlock);
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
    editor.executeEdits("GTFOBins", [{
      range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
      text: text,
      forceMoveMarkers: true
    }]);
    editor.focus();
  }
};
