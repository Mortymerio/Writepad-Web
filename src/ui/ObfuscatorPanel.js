export const ObfuscatorPanel = {
  callbacks: {},

  init(callbacks) {
    this.callbacks = callbacks;
  },

  renderSidebar(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; padding: 10px; box-sizing: border-box; background: var(--bg-primary); color: var(--text-primary); overflow-y: auto;">
        <div style="margin-bottom: 10px;">
          <h3 style="margin: 0 0 5px 0; font-size: 1.1em; color: var(--accent);">Payload Obfuscator</h3>
          <p style="margin: 0; font-size: 0.8em; color: var(--text-status);">Bypass WAFs and filters.</p>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; margin-bottom: 10px;">
          <label style="font-size: 0.85em; font-weight: bold; margin-bottom: 5px;">Raw Payload:</label>
          <textarea id="obf-raw-input" style="flex: 1; min-height: 100px; width: 100%; box-sizing: border-box; padding: 8px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.85em;" placeholder="<script>alert(1)</script>"></textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 10px;">
          <button class="obf-btn" data-type="url" style="padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-dark); cursor: pointer; border-radius: 3px; font-size: 0.8em;">URL Encode</button>
          <button class="obf-btn" data-type="url-double" style="padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-dark); cursor: pointer; border-radius: 3px; font-size: 0.8em;">URL Double</button>
          <button class="obf-btn" data-type="base64" style="padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-dark); cursor: pointer; border-radius: 3px; font-size: 0.8em;">Base64</button>
          <button class="obf-btn" data-type="hex" style="padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-dark); cursor: pointer; border-radius: 3px; font-size: 0.8em;">Hex (\\x)</button>
          <button class="obf-btn" data-type="html" style="padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-dark); cursor: pointer; border-radius: 3px; font-size: 0.8em;">HTML Entity</button>
          <button class="obf-btn" data-type="concat" style="padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-dark); cursor: pointer; border-radius: 3px; font-size: 0.8em;">SQL Concat</button>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <label style="font-size: 0.85em; font-weight: bold;">Obfuscated Result:</label>
            <button id="obf-copy" style="padding: 2px 5px; background: var(--accent); color: white; border: none; cursor: pointer; border-radius: 3px; font-size: 0.75em;">Copy</button>
          </div>
          <textarea id="obf-result" readonly style="flex: 1; min-height: 100px; width: 100%; box-sizing: border-box; padding: 8px; background: var(--bg-secondary); color: #89d185; border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.85em;"></textarea>
        </div>

        <div style="font-size: 0.75em; color: var(--text-status); border-top: 1px solid var(--border-color); padding-top: 5px;">
          <strong>Tip:</strong> Hover over buttons to see what they do. SQL Concat splits strings into 'a'.'b'.'c' for SQLi WAF evasion.
        </div>
      </div>
    `;

    const rawInput = document.getElementById('obf-raw-input');
    const resultInput = document.getElementById('obf-result');

    const encodeMap = {
      'url': (str) => encodeURIComponent(str),
      'url-double': (str) => encodeURIComponent(encodeURIComponent(str)),
      'base64': (str) => btoa(unescape(encodeURIComponent(str))),
      'hex': (str) => str.split('').map(c => '\\x' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
      'html': (str) => str.split('').map(c => '&#' + c.charCodeAt(0) + ';').join(''),
      'concat': (str) => str.split('').map(c => `'\${c}'`).join(' || ')
    };

    container.querySelectorAll('.obf-btn').forEach(btn => {
      btn.onclick = () => {
        const type = btn.getAttribute('data-type');
        const raw = rawInput.value;
        if (!raw) return;
        try {
          resultInput.value = encodeMap[type](raw);
        } catch (e) {
          resultInput.value = "Error encoding: " + e.message;
        }
      };
    });

    document.getElementById('obf-copy').onclick = () => {
      resultInput.select();
      document.execCommand('copy');
      if (window.ToastManager) {
        window.ToastManager.show('Copied to clipboard!', 'success');
      }
    };
  }
};
