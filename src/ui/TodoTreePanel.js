export const TodoTreePanel = {
  callbacks: {},
  container: null,
  disposable: null,

  init(callbacks) {
    this.callbacks = callbacks;
  },

  renderSidebar(container) {
    this.container = container;
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; box-sizing: border-box;">
        <div style="padding: 10px; background: var(--bg-secondary); border-bottom: 1px solid var(--border-light); font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
          <span>TODO Tree</span>
          <button id="btn-refresh-todo" style="background: none; border: none; cursor: pointer; color: var(--text-primary);"><i data-lucide="refresh-cw" width="14" height="14"></i></button>
        </div>
        <div id="todo-list-content" style="flex: 1; padding: 10px; overflow-y: auto; line-height: 1.6; font-size: 0.9em;">
        </div>
      </div>
    `;
    
    // Lucide icons might need to be recreated, but for now just text or wait for global icons update
    if (window.lucide) {
      window.lucide.createIcons();
    }

    document.getElementById('btn-refresh-todo').onclick = () => this.updateTree();

    this.updateTree();

    const editor = this.callbacks.getEditor();
    if (this.disposable) this.disposable.dispose();
    
    // Debounce updates on model change
    let timeout;
    this.disposable = editor.onDidChangeModelContent(() => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (this.container && this.container.isConnected) {
          this.updateTree();
        }
      }, 1000);
    });
  },

  updateTree() {
    if (!this.container || !document.getElementById('todo-list-content')) return;
    
    const editor = this.callbacks.getEditor();
    const contentBox = document.getElementById('todo-list-content');
    
    const activeTabIndex = this.callbacks.getActiveTabIndex();
    if (activeTabIndex === -1) {
      contentBox.innerHTML = '<i style="color: var(--text-secondary);">No active document.</i>';
      return;
    }

    const text = editor.getValue();
    const lines = text.split('\n');
    
    // Patterns to look for
    const patterns = [
      { regex: /\b(TODO):?(.*)/i, color: '#e3b341', name: 'TODO' },
      { regex: /\b(FIXME):?(.*)/i, color: '#f85149', name: 'FIXME' },
      { regex: /\b(BUG):?(.*)/i, color: '#f85149', name: 'BUG' },
      { regex: /\b(HACK):?(.*)/i, color: '#d2a8ff', name: 'HACK' },
      { regex: /\b(NOTE):?(.*)/i, color: '#58a6ff', name: 'NOTE' },
      { regex: /(\[\s\])\s(.*)/i, color: '#e3b341', name: '[ ]' },
      { regex: /(\[x\])\s(.*)/i, color: '#89d185', name: '[X]' }
    ];

    let results = [];
    
    lines.forEach((line, index) => {
      for (const p of patterns) {
        const match = line.match(p.regex);
        if (match) {
          // If the word matched is exactly what we want, or close
          const keyword = match[1].toUpperCase();
          if (p.name === keyword) {
            results.push({
              line: index + 1,
              keyword: keyword,
              text: match[2].trim() || '(no description)',
              color: p.color
            });
            break; // Only match one pattern per line
          }
        }
      }
    });

    if (results.length === 0) {
      contentBox.innerHTML = '<i style="color: var(--text-secondary);">No TODOs found.</i>';
      return;
    }

    // Render
    let html = '<ul style="list-style: none; padding: 0; margin: 0;">';
    results.forEach(res => {
      html += `
        <li class="todo-item" data-line="${res.line}" style="margin-bottom: 8px; cursor: pointer; padding: 4px; border-radius: 4px; border: 1px solid transparent;" onmouseover="this.style.background='var(--bg-active)'; this.style.borderColor='var(--border-light)';" onmouseout="this.style.background='transparent'; this.style.borderColor='transparent';">
          <span style="color: ${res.color}; font-weight: bold; font-size: 0.85em; background: ${res.color}22; padding: 2px 4px; border-radius: 3px;">${res.keyword}</span>
          <span style="color: var(--text-secondary); margin-left: 5px; font-size: 0.85em;">Ln ${res.line}</span>
          <div style="margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-primary);">${res.text}</div>
        </li>
      `;
    });
    html += '</ul>';

    contentBox.innerHTML = html;

    // Attach click events to jump
    contentBox.querySelectorAll('.todo-item').forEach(item => {
      item.onclick = () => {
        const line = parseInt(item.getAttribute('data-line'), 10);
        editor.revealLineInCenter(line);
        editor.setPosition({ lineNumber: line, column: 1 });
        editor.focus();
      };
    });
  }
};
