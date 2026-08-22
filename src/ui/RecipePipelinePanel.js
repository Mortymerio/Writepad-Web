export const RecipePipelinePanel = {
  callbacks: {},
  pipeline: [],
  
  operations: {
    'B64Enc': (input) => btoa(input),
    'B64Dec': (input) => atob(input),
    'URLEnc': (input) => encodeURIComponent(input),
    'URLDec': (input) => decodeURIComponent(input),
    'HexEnc': (input) => Array.from(input).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
    'HexDec': (input) => {
      let hex = input.replace(/\\s/g, '');
      let str = '';
      for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      return str;
    },
    'HTML Enc': (input) => input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
    'HTML Dec': (input) => {
      const txt = document.createElement("textarea");
      txt.innerHTML = input;
      return txt.value;
    }
  },

  init(callbacks) {
    this.callbacks = callbacks;
    this.pipeline = [];
  },

  renderSidebar(container) {
    const opKeys = Object.keys(this.operations);
    const opOptions = opKeys.map(k => `<option value="${k}">${k}</option>`).join('');

    container.innerHTML = `
      <div class="panel-container">
        <div class="panel-group">
          <h3 style="margin: 0 0 5px 0; font-size: 1.1em; color: var(--accent);">Recipe Pipeline</h3>
          <p style="margin: 0; font-size: 0.8em; color: var(--text-status);">Chain encoding/decoding operations (CyberChef style).</p>
        </div>

        <!-- Input -->
        <div style="margin-bottom: 10px; flex: 1; display: flex; flex-direction: column; min-height: 100px;">
          <label style="font-weight: bold; font-size: 0.85em; margin-bottom: 5px;">Input:</label>
          <textarea id="recipe-input" style="flex: 1; width: 100%; padding: 8px; box-sizing: border-box; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.85em;"></textarea>
        </div>

        <!-- Pipeline Controls -->
        <div style="margin-bottom: 10px; background: var(--bg-secondary); padding: 5px; border: 1px solid var(--border-color);">
          <div style="display: flex; gap: 5px; align-items: center; margin-bottom: 5px;">
            <select id="recipe-op-select" style="flex: 1; padding: 5px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none;">
              ${opOptions}
            </select>
            <button id="recipe-btn-add" style="padding: 5px 10px; background: var(--accent); color: white; border: none; cursor: pointer; font-weight: bold;">Add Step</button>
          </div>
          <div id="recipe-pipeline-list" style="display: flex; flex-direction: column; gap: 5px; max-height: 120px; overflow-y: auto;">
            <!-- Pipeline steps will appear here -->
          </div>
        </div>

        <!-- Output -->
        <div style="flex: 1; display: flex; flex-direction: column; min-height: 100px;">
          <label style="font-weight: bold; font-size: 0.85em; margin-bottom: 5px;">Output:</label>
          <textarea id="recipe-output" readonly style="flex: 1; width: 100%; padding: 8px; box-sizing: border-box; background: var(--bg-secondary); color: var(--accent); border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.85em;"></textarea>
        </div>
      </div>
    `;

    document.getElementById('recipe-btn-add').onclick = () => {
      const op = document.getElementById('recipe-op-select').value;
      this.pipeline.push(op);
      this.renderPipelineList();
      this.processPipeline();
    };

    document.getElementById('recipe-input').oninput = () => this.processPipeline();

    this.renderPipelineList();
  },

  renderPipelineList() {
    const listEl = document.getElementById('recipe-pipeline-list');
    listEl.innerHTML = '';

    if (this.pipeline.length === 0) {
      listEl.innerHTML = '<span style="font-size: 0.8em; color: var(--text-secondary); font-style: italic;">No operations yet. Add a step above.</span>';
      return;
    }

    this.pipeline.forEach((op, index) => {
      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.justifyContent = 'space-between';
      div.style.alignItems = 'center';
      div.style.padding = '3px 5px';
      div.style.background = 'var(--bg-primary)';
      div.style.border = '1px solid var(--border-color)';
      div.style.fontSize = '0.85em';

      const label = document.createElement('span');
      label.innerText = `${index + 1}. ${op}`;
      
      const btnRemove = document.createElement('button');
      btnRemove.innerText = '✖';
      btnRemove.style.background = 'none';
      btnRemove.style.border = 'none';
      btnRemove.style.color = 'var(--text-secondary)';
      btnRemove.style.cursor = 'pointer';
      
      btnRemove.onclick = () => {
        this.pipeline.splice(index, 1);
        this.renderPipelineList();
        this.processPipeline();
      };

      div.appendChild(label);
      div.appendChild(btnRemove);
      listEl.appendChild(div);
    });
  },

  processPipeline() {
    const input = document.getElementById('recipe-input').value;
    const outputEl = document.getElementById('recipe-output');

    if (!input) {
      outputEl.value = '';
      return;
    }

    let currentData = input;

    try {
      for (const op of this.pipeline) {
        if (this.operations[op]) {
          currentData = this.operations[op](currentData);
        }
      }
      outputEl.value = currentData;
      outputEl.style.color = 'var(--accent)';
    } catch (e) {
      outputEl.value = 'Error: ' + e.message;
      outputEl.style.color = '#f85149';
    }
  }
};
