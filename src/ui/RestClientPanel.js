export const RestClientPanel = {
  callbacks: {},

  init(callbacks) {
    this.callbacks = callbacks;
  },

  renderSidebar(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; padding: 10px; box-sizing: border-box; background: var(--bg-primary); color: var(--text-primary);">
        <div style="margin-bottom: 10px; display: flex; gap: 5px;">
          <select id="rest-method" style="padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none;">
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>PATCH</option>
            <option>DELETE</option>
            <option>OPTIONS</option>
            <option>HEAD</option>
          </select>
          <input type="text" id="rest-url" placeholder="https://api.example.com/v1/users" style="flex: 1; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none;" />
          <button id="rest-btn-send" style="padding: 5px 10px; background: var(--bg-active); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer; font-weight: bold;">Send</button>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 0.8em; font-weight: bold; cursor: pointer;" id="rest-headers-toggle">▶ Headers (JSON)</label>
          <textarea id="rest-headers" placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}' style="display: none; width: 100%; height: 80px; box-sizing: border-box; margin-top: 5px; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.9em;"></textarea>
        </div>

        <div style="margin-bottom: 10px;">
          <label style="font-size: 0.8em; font-weight: bold; cursor: pointer;" id="rest-body-toggle">▶ Body</label>
          <textarea id="rest-body" placeholder="Raw body data..." style="display: none; width: 100%; height: 100px; box-sizing: border-box; margin-top: 5px; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.9em;"></textarea>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px;">
          <span style="font-size: 0.85em; font-weight: bold;">Response</span>
          <div>
            <span id="rest-status" style="font-size: 0.85em; margin-right: 10px;"></span>
            <button id="rest-btn-copy" style="padding: 3px 8px; font-size: 0.8em; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer;">Copy</button>
            <button id="rest-btn-editor" style="padding: 3px 8px; font-size: 0.8em; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer;">Open in Editor</button>
          </div>
        </div>

        <div style="flex: 1; margin-top: 5px; border: 1px solid var(--border-color); position: relative;">
          <textarea id="rest-response" readonly style="width: 100%; height: 100%; box-sizing: border-box; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: none; outline: none; resize: none; font-family: monospace; font-size: 0.9em;"></textarea>
        </div>
      </div>
    `;

    // Toggles
    const setupToggle = (toggleId, contentId) => {
      const toggle = document.getElementById(toggleId);
      const content = document.getElementById(contentId);
      toggle.onclick = () => {
        const isHidden = content.style.display === 'none';
        content.style.display = isHidden ? 'block' : 'none';
        toggle.innerText = (isHidden ? '▼ ' : '▶ ') + toggle.innerText.substring(2);
      };
    };
    setupToggle('rest-headers-toggle', 'rest-headers');
    setupToggle('rest-body-toggle', 'rest-body');

    // Action
    document.getElementById('rest-btn-send').onclick = async () => {
      const method = document.getElementById('rest-method').value;
      const url = document.getElementById('rest-url').value.trim();
      const headersStr = document.getElementById('rest-headers').value.trim();
      const body = document.getElementById('rest-body').value;
      const resEl = document.getElementById('rest-response');
      const statusEl = document.getElementById('rest-status');

      if (!url) {
        resEl.value = 'Error: URL is required';
        return;
      }

      let headers = {};
      if (headersStr) {
        try {
          headers = JSON.parse(headersStr);
        } catch (e) {
          resEl.value = 'Error parsing Headers JSON: ' + e.message;
          return;
        }
      }

      resEl.value = 'Sending request...';
      statusEl.innerText = '';
      statusEl.style.color = 'inherit';

      try {
        const startTime = performance.now();
        const opts = { method, headers };
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
          opts.body = body;
        }

        const response = await fetch(url, opts);
        const endTime = performance.now();
        const timeMs = Math.round(endTime - startTime);

        const statusColor = response.ok ? '#3fb950' : '#f85149';
        statusEl.innerText = `${response.status} ${response.statusText} - ${timeMs}ms`;
        statusEl.style.color = statusColor;

        const contentType = response.headers.get('content-type');
        let dataStr = '';
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          dataStr = JSON.stringify(data, null, 2);
        } else {
          dataStr = await response.text();
        }

        // Include response headers in output
        let resHeaders = '--- Response Headers ---\n';
        for (let [key, value] of response.headers.entries()) {
          resHeaders += `${key}: ${value}\n`;
        }
        resHeaders += '\n--- Body ---\n';

        resEl.value = resHeaders + dataStr;
      } catch (err) {
        statusEl.innerText = 'Error';
        statusEl.style.color = '#f85149';
        resEl.value = 'Request Failed:\n' + err.message + '\n\n(Note: If this is a CORS error, you cannot bypass it from the browser without a proxy extension).';
      }
    };

    document.getElementById('rest-btn-copy').onclick = () => {
      const txt = document.getElementById('rest-response').value;
      if (txt) navigator.clipboard.writeText(txt);
    };

    document.getElementById('rest-btn-editor').onclick = () => {
      const txt = document.getElementById('rest-response').value;
      if (!txt) return;
      if (this.callbacks.createTab) {
        this.callbacks.createTab('response.json', txt);
      }
    };
  }
};
