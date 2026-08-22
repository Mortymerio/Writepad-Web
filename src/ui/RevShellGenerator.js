import * as monaco from 'monaco-editor';
import { revshellsData } from '../data/revshells.js';

export const RevShellGenerator = {
  callbacks: {},
  ip: '10.10.10.10',
  port: '4444',
  
  init(callbacks) {
    this.callbacks = callbacks;
  },
  
  renderSidebar(container) {
    container.innerHTML = `
      <div class="panel-container">
        <div style="padding: 10px; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
          <div style="margin-bottom: 5px;">
            <label style="font-size: 0.8em; color: var(--text-primary); font-weight: bold;">LHOST (IP):</label>
            <input type="text" id="revshell-ip" value="${this.ip}" style="width: 100%; box-sizing: border-box; margin-top: 2px; padding: 4px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none;">
          </div>
          <div>
            <label style="font-size: 0.8em; color: var(--text-primary); font-weight: bold;">LPORT (Puerto):</label>
            <input type="text" id="revshell-port" value="${this.port}" style="width: 100%; box-sizing: border-box; margin-top: 2px; padding: 4px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none;">
          </div>
        </div>
        <div id="revshell-list" style="flex: 1; overflow-y: auto; padding: 5px;"></div>
      </div>
    `;
    
    document.getElementById('revshell-ip').oninput = (e) => {
      this.ip = e.target.value || '10.10.10.10';
      this.renderList();
    };
    
    document.getElementById('revshell-port').oninput = (e) => {
      this.port = e.target.value || '4444';
      this.renderList();
    };
    
    this.renderList();
  },
  
  renderList() {
    const listEl = document.getElementById('revshell-list');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    revshellsData.forEach(shell => {
      const container = document.createElement('div');
      container.style.cssText = 'margin-bottom: 8px; border: 1px solid var(--border-color); background: var(--bg-primary); border-radius: 4px; color: var(--text-primary);';
      
      const header = document.createElement('div');
      header.style.cssText = 'padding: 6px 8px; display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);';
      
      const title = document.createElement('strong');
      title.style.fontSize = '0.9em';
      title.innerText = shell.name;
      
      const injectBtn = document.createElement('button');
      injectBtn.innerText = 'Inject';
      injectBtn.style.cssText = 'background: #238636; color: white; border: none; border-radius: 4px; padding: 2px 6px; cursor: pointer; font-size: 0.8em;';
      
      const rawCmd = atob(shell.command_b64);
      let payloadCode = rawCmd.replace(/\[IP\]/g, this.ip).replace(/\[PORT\]/g, this.port);
      
      injectBtn.onclick = (e) => {
        e.stopPropagation();
        this.insertPayload(payloadCode);
      };
      
      header.appendChild(title);
      header.appendChild(injectBtn);
      
      const body = document.createElement('div');
      body.style.cssText = 'padding: 6px;';
      
      const pre = document.createElement('pre');
      pre.style.cssText = 'background: #0d1117; padding: 6px; border-radius: 4px; font-size: 0.75em; overflow-x: auto; margin: 0; color: #c9d1d9; font-family: monospace; white-space: pre-wrap; word-wrap: break-word;';
      pre.innerText = payloadCode;
      
      body.appendChild(pre);
      container.appendChild(header);
      container.appendChild(body);
      listEl.appendChild(container);
    });
  },
  
  insertPayload(text) {
    const editor = this.callbacks.getEditor();
    if (!editor) return;
    
    const position = editor.getPosition();
    editor.executeEdits("RevShell", [{
      range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
      text: text,
      forceMoveMarkers: true
    }]);
    editor.focus();
  }
};
