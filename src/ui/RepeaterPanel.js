export const RepeaterPanel = {
  callbacks: {},

  init(callbacks) {
    this.callbacks = callbacks;
  },

  renderSidebar(container) {
    container.innerHTML = `
      <div class="panel-container">
        
        <!-- TARGET -->
        <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 5px;">
          <span style="font-weight: bold; font-size: 0.9em; white-space: nowrap;">Target:</span>
          <input type="text" id="repeater-target" placeholder="https://api.example.com" style="flex: 1; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; font-family: monospace;" />
          <button id="repeater-btn-send" style="padding: 5px 15px; background: var(--accent); color: white; border: none; cursor: pointer; font-weight: bold; border-radius: 3px;">Send</button>
        </div>
        
        <!-- RAW REQUEST -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
          <span style="font-size: 0.85em; font-weight: bold;">Raw Request</span>
          <button id="repeater-btn-format" style="padding: 2px 5px; font-size: 0.75em; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer;">Format</button>
        </div>
        <div style="flex: 1; min-height: 150px; border: 1px solid var(--border-color); margin-bottom: 10px;">
          <textarea id="repeater-request" style="width: 100%; height: 100%; box-sizing: border-box; padding: 8px; background: var(--bg-secondary); color: var(--text-primary); border: none; outline: none; resize: none; font-family: monospace; font-size: 0.9em;" placeholder="POST /api/login HTTP/1.1\nHost: api.example.com\nContent-Type: application/json\n\n{\n  \"username\": \"admin\"\n}"></textarea>
        </div>

        <!-- RAW RESPONSE -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; border-top: 1px solid var(--border-color); padding-top: 10px;">
          <span style="font-size: 0.85em; font-weight: bold;">Raw Response</span>
          <div style="display: flex; gap: 5px; align-items: center;">
            <span id="repeater-status" style="font-size: 0.85em; font-weight: bold;"></span>
            <span id="repeater-time" style="font-size: 0.8em; color: var(--text-secondary);"></span>
          </div>
        </div>
        <div style="flex: 1; min-height: 150px; border: 1px solid var(--border-color);">
          <textarea id="repeater-response" readonly style="width: 100%; height: 100%; box-sizing: border-box; padding: 8px; background: var(--bg-secondary); color: var(--text-primary); border: none; outline: none; resize: none; font-family: monospace; font-size: 0.9em;"></textarea>
        </div>
      </div>
    `;

    document.getElementById('repeater-btn-send').onclick = () => this.sendRequest();
    
    document.getElementById('repeater-btn-format').onclick = () => {
      const reqEl = document.getElementById('repeater-request');
      reqEl.value = reqEl.value.trim();
    };
  },

  async sendRequest() {
    const reqEl = document.getElementById('repeater-request');
    const resEl = document.getElementById('repeater-response');
    const statusEl = document.getElementById('repeater-status');
    const timeEl = document.getElementById('repeater-time');
    const targetBase = document.getElementById('repeater-target').value.trim();

    if (!targetBase) {
      resEl.value = "Error: Please specify a Target (e.g., https://api.example.com)";
      return;
    }

    const rawReq = reqEl.value;
    if (!rawReq.trim()) {
      resEl.value = "Error: Request cannot be empty";
      return;
    }

    resEl.value = "Sending request...";
    statusEl.innerText = "";
    timeEl.innerText = "";

    try {
      // 1. Parse Raw Request
      const parsed = this.parseRawRequest(rawReq);
      
      // 2. Construct final URL
      // Remove trailing slash from targetBase if present, and leading slash from path if present
      const base = targetBase.replace(/\/$/, '');
      const path = parsed.path.startsWith('/') ? parsed.path : '/' + parsed.path;
      const finalUrl = base + path;

      // 3. Prepare Fetch Options
      const fetchOpts = {
        method: parsed.method,
        headers: parsed.headers
      };

      // Fetch does not allow payloads for GET/HEAD
      if (['GET', 'HEAD'].includes(parsed.method)) {
        if (parsed.body && parsed.body.trim().length > 0) {
          console.warn("Repeater: GET/HEAD requests cannot have a body. Body ignored.");
        }
      } else {
        if (parsed.body) {
          fetchOpts.body = parsed.body;
        }
      }

      // 4. Send Request
      const startTime = performance.now();
      let response;
      try {
        response = await fetch(finalUrl, fetchOpts);
      } catch (err) {
        throw new Error("Network error or CORS policy blocked the request.\nDetail: " + err.message);
      }
      const endTime = performance.now();
      const timeMs = Math.round(endTime - startTime);

      // 5. Parse Response to Raw HTTP format
      let rawRes = `HTTP/1.1 ${response.status} ${response.statusText}\r\n`;
      response.headers.forEach((val, key) => {
        rawRes += `${key}: ${val}\r\n`;
      });
      rawRes += "\r\n";
      
      const bodyText = await response.text();
      rawRes += bodyText;

      // 6. Update UI
      resEl.value = rawRes;
      
      statusEl.innerText = `${response.status} ${response.statusText}`;
      statusEl.style.color = response.ok ? '#89d185' : '#f85149';
      timeEl.innerText = `${timeMs}ms`;

    } catch (e) {
      resEl.value = "Error: " + e.message;
      statusEl.innerText = "Error";
      statusEl.style.color = "#f85149";
    }
  },

  parseRawRequest(rawText) {
    // Normalize line endings to \n
    const text = rawText.replace(/\r\n/g, '\n');
    
    // Split into headers part and body part
    const parts = text.split('\n\n');
    const headerPart = parts[0];
    const body = parts.slice(1).join('\n\n') || null;

    const headerLines = headerPart.split('\n');
    if (headerLines.length === 0) throw new Error("Invalid HTTP Request: Empty");

    // Parse Request Line: METHOD PATH HTTP/VERSION
    const reqLine = headerLines[0].trim().split(' ');
    if (reqLine.length < 2) throw new Error("Invalid Request Line (e.g. POST /api HTTP/1.1)");
    
    const method = reqLine[0].toUpperCase();
    const path = reqLine[1];

    // Parse Headers
    const headers = {};
    for (let i = 1; i < headerLines.length; i++) {
      const line = headerLines[i].trim();
      if (!line) continue;
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.substring(0, colonIdx).trim();
        const val = line.substring(colonIdx + 1).trim();
        
        // Browsers block setting certain unsafe headers via fetch (like Host, Content-Length, Connection)
        // We will filter them out silently or fetch will throw an error
        const unsafeHeaders = ['host', 'connection', 'content-length', 'origin', 'referer', 'user-agent'];
        if (unsafeHeaders.includes(key.toLowerCase())) {
          console.warn(`Repeater: Header '${key}' is controlled by the browser and may be ignored or overridden by fetch.`);
        }
        
        headers[key] = val;
      }
    }

    return { method, path, headers, body };
  }
};
