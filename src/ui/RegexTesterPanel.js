export const RegexTesterPanel = {
  callbacks: {},
  container: null,
  decorations: [],

  init(callbacks) {
    this.callbacks = callbacks;
  },

  renderSidebar(container) {
    this.container = container;
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; box-sizing: border-box; background: var(--bg-primary); color: var(--text-primary); padding: 10px;">
        <label style="font-weight: bold; margin-bottom: 5px;">Regex Pattern:</label>
        <div style="display: flex; gap: 5px; margin-bottom: 10px;">
          <span style="padding: 5px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-right: none; color: var(--text-secondary);">/</span>
          <input type="text" id="regex-pattern" placeholder="\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b" style="flex: 1; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; font-family: monospace;" />
          <span style="padding: 5px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-left: none; color: var(--text-secondary);">/</span>
          <input type="text" id="regex-flags" value="gi" placeholder="gi" style="width: 40px; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; font-family: monospace;" />
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <span id="regex-matches-count" style="font-size: 0.85em; color: var(--text-secondary);">0 matches</span>
          <button id="btn-regex-clear" style="padding: 3px 8px; font-size: 0.8em; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer;">Clear Highlight</button>
        </div>

        <div style="flex: 1; overflow-y: auto;">
          <ul id="regex-matches-list" style="list-style: none; padding: 0; margin: 0; font-size: 0.85em; font-family: monospace;">
          </ul>
          
          <div id="regex-examples-container" style="margin-top: 15px;">
            <div style="font-weight: bold; margin-bottom: 8px; color: var(--text-primary); border-bottom: 1px solid var(--border-light); padding-bottom: 3px;">Common Examples</div>
            <ul id="regex-examples-list" style="list-style: none; padding: 0; margin: 0; font-size: 0.85em;">
              <!-- Injected dynamically -->
            </ul>
          </div>
        </div>
      </div>
    `;

    const inputPattern = document.getElementById('regex-pattern');
    const inputFlags = document.getElementById('regex-flags');
    const btnClear = document.getElementById('btn-regex-clear');

    const updateHighlight = () => this.highlightRegex();
    inputPattern.addEventListener('input', updateHighlight);
    inputFlags.addEventListener('input', updateHighlight);
    
    btnClear.onclick = () => {
      inputPattern.value = '';
      this.clearDecorations();
    };
    
    // Add CSS for highlight if not exists
    if (!document.getElementById('regex-highlight-style')) {
      const style = document.createElement('style');
      style.id = 'regex-highlight-style';
      style.innerHTML = `
        .regex-highlight {
          background-color: rgba(255, 255, 0, 0.4);
          outline: 1px solid rgba(255, 255, 0, 0.8);
        }
        .regex-example-item {
          padding: 8px 6px; border-bottom: 1px solid var(--border-light); cursor: pointer; color: var(--text-secondary); display: flex; flex-direction: column; gap: 4px; align-items: flex-start;
        }
        .regex-example-item:hover { background: var(--bg-active); color: var(--text-primary); }
        .regex-example-code { color: #e3b341; font-family: monospace; font-size: 0.9em; background: rgba(227, 179, 65, 0.1); padding: 2px 4px; border-radius: 3px; }
      `;
      document.head.appendChild(style);
    }
    
    this.renderExamples();
  },

  renderExamples() {
    const examples = [
      { name: "Email", pattern: "\\\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\\\.[A-Za-z]{2,}\\\\b", flags: "g" },
      { name: "IPv4 Address", pattern: "\\\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\\\b", flags: "g" },
      { name: "IPv6 Address", pattern: "\\\\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\\\\b", flags: "gi" },
      { name: "URL (http/https)", pattern: "https?:\\\\/\\\\/(www\\\\.)?[-a-zA-Z0-9@:%._\\\\+~#=]{1,256}\\\\.[a-zA-Z0-9()]{1,6}\\\\b([-a-zA-Z0-9()@:%_\\\\+.~#?&//=]*)", flags: "gi" },
      { name: "MAC Address", pattern: "\\\\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\\\\b", flags: "g" },
      { name: "MD5 Hash", pattern: "\\\\b[A-Fa-f0-9]{32}\\\\b", flags: "g" },
      { name: "SHA-1 Hash", pattern: "\\\\b[A-Fa-f0-9]{40}\\\\b", flags: "g" },
      { name: "SHA-256 Hash", pattern: "\\\\b[A-Fa-f0-9]{64}\\\\b", flags: "g" },
      { name: "Base64 String", pattern: "(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?", flags: "g" },
      { name: "Credit Card (Any)", pattern: "\\\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\\\\d{3})\\\\d{11})\\\\b", flags: "g" },
      { name: "HTML Tags", pattern: "<\\\\/?(?:[A-Za-z]+)(?:[^>]*)\\\\/?>", flags: "gi" },
      { name: "UUID / GUID", pattern: "\\\\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\\\b", flags: "g" },
      { name: "Dates (YYYY-MM-DD)", pattern: "\\\\b\\\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\\\d|3[01])\\\\b", flags: "g" },
      { name: "JWT Token", pattern: "eyJ[A-Za-z0-9-_=]+\\\\.eyJ[A-Za-z0-9-_=]+\\\\.?[A-Za-z0-9-_.+/=]*", flags: "g" }
    ];

    const list = document.getElementById('regex-examples-list');
    if (!list) return;

    list.innerHTML = '';
    examples.forEach(ex => {
      const li = document.createElement('li');
      li.className = 'regex-example-item';
      li.innerHTML = `<span style="font-weight: 500;">${ex.name}</span><span class="regex-example-code">/${ex.pattern}/${ex.flags}</span>`;
      li.onclick = () => {
        document.getElementById('regex-pattern').value = ex.pattern.replace(/\\\\\\\\/g, '\\\\');
        document.getElementById('regex-flags').value = ex.flags;
        this.highlightRegex();
      };
      list.appendChild(li);
    });
  },

  highlightRegex() {
    const editor = this.callbacks.getEditor();
    const model = editor.getModel();
    if (!model) return;

    this.clearDecorations();
    const pattern = document.getElementById('regex-pattern').value;
    const flags = document.getElementById('regex-flags').value;
    const countEl = document.getElementById('regex-matches-count');
    const listEl = document.getElementById('regex-matches-list');
    
    listEl.innerHTML = '';

    const examplesContainer = document.getElementById('regex-examples-container');

    if (!pattern) {
      countEl.innerText = '0 matches';
      if (examplesContainer) examplesContainer.style.display = 'block';
      return;
    }

    if (examplesContainer) examplesContainer.style.display = 'none';

    try {
      const regex = new RegExp(pattern, flags);
      const matches = model.findMatches(pattern, false, true, false, null, true);
      
      const newDecorations = matches.map(m => ({
        range: m.range,
        options: { inlineClassName: 'regex-highlight' }
      }));
      
      this.decorations = editor.deltaDecorations([], newDecorations);
      countEl.innerText = `${matches.length} match${matches.length === 1 ? '' : 'es'}`;

      // Render top 50 matches in the list
      const limit = Math.min(matches.length, 50);
      let html = '';
      for(let i=0; i<limit; i++) {
        const m = matches[i];
        const matchText = model.getValueInRange(m.range);
        html += `<li style="padding: 4px; border-bottom: 1px solid var(--border-light); cursor: pointer;" data-line="${m.range.startLineNumber}" data-col="${m.range.startColumn}">
          <span style="color: var(--text-secondary); margin-right: 5px;">Ln ${m.range.startLineNumber}</span>
          <span style="color: #e3b341;">${this.escapeHtml(matchText)}</span>
        </li>`;
      }
      if (matches.length > 50) {
        html += `<li style="padding: 4px; color: var(--text-secondary); text-align: center;">... and ${matches.length - 50} more</li>`;
      }
      
      listEl.innerHTML = html;
      
      listEl.querySelectorAll('li[data-line]').forEach(li => {
        li.onclick = () => {
          const line = parseInt(li.getAttribute('data-line'), 10);
          const col = parseInt(li.getAttribute('data-col'), 10);
          editor.revealPositionInCenter({ lineNumber: line, column: col });
          editor.setPosition({ lineNumber: line, column: col });
          editor.focus();
        };
      });
      
    } catch (e) {
      countEl.innerText = 'Invalid Regex';
      listEl.innerHTML = `<li style="color: #f85149;">${this.escapeHtml(e.message)}</li>`;
    }
  },

  clearDecorations() {
    const editor = this.callbacks.getEditor();
    if (this.decorations.length > 0) {
      this.decorations = editor.deltaDecorations(this.decorations, []);
    }
    const countEl = document.getElementById('regex-matches-count');
    if (countEl) countEl.innerText = '0 matches';
    const listEl = document.getElementById('regex-matches-list');
    if (listEl) listEl.innerHTML = '';
    
    const examplesContainer = document.getElementById('regex-examples-container');
    if (examplesContainer) examplesContainer.style.display = 'block';
  },
  
  escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
  }
};
