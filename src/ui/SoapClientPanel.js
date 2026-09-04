// ─────────────────────────────────────────────────────────────────────────────
//  SoapClientPanel.js  –  Full SoapUI-like SOAP client for Writepad
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'writepad_soap_projects';

// ── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function prettyXml(xmlStr) {
  try {
    const PADDING = '  ';
    let formatted = '';
    let indent = 0;
    const str = xmlStr.replace(/>\s*</g, '><').trim();
    str.split(/(?<=>)(?=<)|(?<=<[^?!][^>]*[^/])(?=>)/).forEach(node => {
      if (node.match(/^<\/\w/)) indent--;
      formatted += PADDING.repeat(Math.max(0, indent)) + node + '\n';
      if (node.match(/^<\w[^>]*[^/]>.*$/) && !node.match(/<.*\/>/)) indent++;
    });
    return formatted.trim();
  } catch {
    return xmlStr;
  }
}

function prettyXmlV2(xml) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    if (doc.querySelector('parsererror')) return xml;
    const xs = new XMLSerializer();
    // re-serialize and indent manually
    let out = xs.serializeToString(doc);
    // Simple indent
    let level = 0;
    return out
      .replace(/></g, '>\n<')
      .split('\n')
      .map(line => {
        if (line.match(/^<\//) || line.match(/\/>/)) level = Math.max(0, level - 1);
        const indented = '  '.repeat(level) + line;
        if (line.match(/^<[^/?!][^>]*[^/]>/) && !line.match(/<.*>.*<\//)) level++;
        return indented;
      })
      .join('\n');
  } catch {
    return xml;
  }
}

// ── WSDL Parser ──────────────────────────────────────────────────────────────

function parseWsdl(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('Invalid XML in WSDL');

  const ns = (el, local) => el.getElementsByTagNameNS('*', local);

  // Collect types (elements)
  const elements = {};
  doc.querySelectorAll('element').forEach(el => {
    const name = el.getAttribute('name');
    if (name) elements[name] = el;
  });

  // Collect messages
  const messages = {};
  Array.from(ns(doc, 'message')).forEach(msg => {
    const name = msg.getAttribute('name');
    if (!name) return;
    const parts = [];
    Array.from(ns(msg, 'part')).forEach(p => {
      parts.push({ name: p.getAttribute('name'), element: p.getAttribute('element'), type: p.getAttribute('type') });
    });
    messages[name] = parts;
  });

  // Collect portTypes / operations
  const portTypes = {};
  Array.from(ns(doc, 'portType')).forEach(pt => {
    const ptName = pt.getAttribute('name');
    const ops = {};
    Array.from(ns(pt, 'operation')).forEach(op => {
      const opName = op.getAttribute('name');
      const inputMsg = op.querySelector('input')?.getAttribute('message')?.split(':').pop();
      const outputMsg = op.querySelector('output')?.getAttribute('message')?.split(':').pop();
      ops[opName] = { input: inputMsg, output: outputMsg };
    });
    portTypes[ptName] = ops;
  });

  // Collect bindings (to get SOAPAction)
  const bindings = {};
  Array.from(ns(doc, 'binding')).forEach(b => {
    const bName = b.getAttribute('name');
    const type = b.getAttribute('type')?.split(':').pop();
    const ops = {};
    // Detect SOAP version
    let soapVersion = '1.1';
    if (b.querySelector('[xmlns\\:soap12]') || b.getElementsByTagNameNS('http://schemas.xmlsoap.org/wsdl/soap12/', 'binding').length) {
      soapVersion = '1.2';
    }
    Array.from(ns(b, 'operation')).forEach(op => {
      const opName = op.getAttribute('name');
      // Try to find soap:operation soapAction
      let soapAction = '';
      const soapOp = op.querySelector('operation');
      if (soapOp) soapAction = soapOp.getAttribute('soapAction') || '';
      ops[opName] = { soapAction, soapVersion };
    });
    bindings[bName] = { portType: type, ops, soapVersion };
  });

  // Collect services / ports
  const services = [];
  Array.from(ns(doc, 'service')).forEach(svc => {
    const svcName = svc.getAttribute('name');
    const ports = [];
    Array.from(ns(svc, 'port')).forEach(port => {
      const portName = port.getAttribute('name');
      const bindingName = port.getAttribute('binding')?.split(':').pop();
      const address = port.querySelector('address')?.getAttribute('location') || '';
      const binding = bindings[bindingName] || {};
      const portTypeOps = portTypes[binding.portType] || {};
      const ops = Object.keys(portTypeOps).map(opName => {
        const bindingOp = binding.ops?.[opName] || {};
        const msgName = portTypeOps[opName].input;
        const msgParts = messages[msgName] || [];
        const skeleton = buildSoapEnvelope(opName, msgParts, bindingOp.soapVersion || '1.1');
        return {
          id: uid(),
          name: opName,
          soapAction: bindingOp.soapAction || '',
          soapVersion: bindingOp.soapVersion || '1.1',
          requestBody: skeleton,
          requests: [],
        };
      });
      ports.push({ id: uid(), name: portName, binding: bindingName, endpoint: address, ops });
    });
    services.push({ id: uid(), name: svcName, ports });
  });

  return services;
}

function buildSoapEnvelope(operationName, parts, soapVersion = '1.1') {
  const env11 = 'http://schemas.xmlsoap.org/soap/envelope/';
  const env12 = 'http://www.w3.org/2003/05/soap-envelope';
  const envNs = soapVersion === '1.2' ? env12 : env11;
  const prefix = 'soapenv';
  const tns = 'http://tempuri.org/';

  let bodyContent = '';
  if (parts.length === 0) {
    bodyContent = `      <tns:${operationName} xmlns:tns="${tns}"/>\n`;
  } else {
    bodyContent = `      <tns:${operationName} xmlns:tns="${tns}">\n`;
    parts.forEach(p => {
      const elName = p.element?.split(':').pop() || p.name || 'param';
      bodyContent += `        <tns:${elName}>?<\/tns:${elName}>\n`;
    });
    bodyContent += `      <\/tns:${operationName}>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<${prefix}:Envelope xmlns:${prefix}="${envNs}">
  <${prefix}:Header/>
  <${prefix}:Body>
${bodyContent}  <\/${prefix}:Body>
<\/${prefix}:Envelope>`;
}

// ── Project Store ─────────────────────────────────────────────────────────────

const ProjectStore = {
  load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  },
  save(projects) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  },
};

// ── Panel ─────────────────────────────────────────────────────────────────────

export const SoapClientPanel = {
  callbacks: {},
  projects: [],
  selectedProjectId: null,
  selectedPortId: null,
  selectedOpId: null,

  init(callbacks) {
    this.callbacks = callbacks;
    this.projects = ProjectStore.load();
  },

  renderSidebar(container) {
    this.projects = ProjectStore.load();
    container.innerHTML = this._html();
    this._bind(container);
  },

  _html() {
    return `
<div class="soap-panel" style="display:flex;flex-direction:column;height:100%;overflow:hidden;font-size:0.88em;">

  <!-- Toolbar -->
  <div style="display:flex;gap:4px;padding:6px;border-bottom:1px solid var(--border-color);flex-shrink:0;flex-wrap:wrap;">
    <button id="soap-btn-new-project" title="New Project" style="${btnStyle('var(--accent-color)')}">＋ New Project</button>
    <button id="soap-btn-import-wsdl" title="Import from WSDL" style="${btnStyle()}">📄 Import WSDL</button>
    <button id="soap-btn-export" title="Export all projects as JSON" style="${btnStyle()}">⬇ Export</button>
    <button id="soap-btn-import-json" title="Import projects from JSON" style="${btnStyle()}">⬆ Import</button>
    <input type="file" id="soap-file-import" accept=".json" style="display:none">
  </div>

  <!-- Main area: tree + editor -->
  <div style="display:flex;flex:1;overflow:hidden;">

    <!-- Projects tree -->
    <div id="soap-tree" style="width:200px;min-width:140px;max-width:300px;border-right:1px solid var(--border-color);overflow-y:auto;flex-shrink:0;padding:4px 0;">
      ${this._treeHtml()}
    </div>

    <!-- Request / Response editor -->
    <div id="soap-editor" style="flex:1;display:flex;flex-direction:column;overflow:hidden;padding:8px;gap:6px;">
      ${this._editorHtml()}
    </div>

  </div>

  <!-- WSDL Import modal -->
  <div id="soap-wsdl-modal" style="display:none;position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;align-items:center;justify-content:center;">
    <div style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:8px;padding:20px;width:90%;max-width:560px;">
      <div style="font-weight:bold;margin-bottom:10px;font-size:1.05em;">Import WSDL</div>
      <label style="font-size:0.85em;color:var(--text-secondary);">Project name</label>
      <input id="soap-wsdl-projname" type="text" placeholder="My SOAP Project" style="${inputStyle()};width:100%;box-sizing:border-box;margin:4px 0 10px;">
      <label style="font-size:0.85em;color:var(--text-secondary);">WSDL URL (will be fetched) or paste XML below</label>
      <input id="soap-wsdl-url" type="text" placeholder="https://example.com/service?wsdl" style="${inputStyle()};width:100%;box-sizing:border-box;margin:4px 0 6px;">
      <button id="soap-wsdl-fetch-btn" style="${btnStyle()}">Fetch from URL</button>
      <div style="margin:8px 0;text-align:center;color:var(--text-secondary);font-size:0.8em;">— or paste WSDL XML directly —</div>
      <textarea id="soap-wsdl-xml" rows="8" placeholder="&lt;?xml version=&quot;1.0&quot;?&gt;&lt;wsdl:definitions ...&gt;..." style="${textareaStyle()};width:100%;box-sizing:border-box;"></textarea>
      <div id="soap-wsdl-error" style="color:#f85149;font-size:0.82em;margin-top:4px;"></div>
      <div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end;">
        <button id="soap-wsdl-cancel" style="${btnStyle()}">Cancel</button>
        <button id="soap-wsdl-import-btn" style="${btnStyle('var(--accent-color)')}">Import</button>
      </div>
    </div>
  </div>

  <!-- New manual project modal -->
  <div id="soap-newproj-modal" style="display:none;position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;align-items:center;justify-content:center;">
    <div style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:8px;padding:20px;width:90%;max-width:420px;">
      <div style="font-weight:bold;margin-bottom:10px;">New Project</div>
      <label style="font-size:0.85em;color:var(--text-secondary);">Project name</label>
      <input id="soap-newproj-name" type="text" placeholder="My Project" style="${inputStyle()};width:100%;box-sizing:border-box;margin:4px 0 10px;">
      <label style="font-size:0.85em;color:var(--text-secondary);">Default endpoint</label>
      <input id="soap-newproj-endpoint" type="text" placeholder="https://example.com/service" style="${inputStyle()};width:100%;box-sizing:border-box;margin:4px 0 10px;">
      <label style="font-size:0.85em;color:var(--text-secondary);">SOAP Version</label>
      <select id="soap-newproj-version" style="${inputStyle()};width:100%;box-sizing:border-box;margin:4px 0 10px;">
        <option value="1.1">SOAP 1.1</option>
        <option value="1.2">SOAP 1.2</option>
      </select>
      <div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end;">
        <button id="soap-newproj-cancel" style="${btnStyle()}">Cancel</button>
        <button id="soap-newproj-create" style="${btnStyle('var(--accent-color)')}">Create</button>
      </div>
    </div>
  </div>

</div>`;
  },

  _treeHtml() {
    if (this.projects.length === 0) {
      return `<div style="padding:12px;color:var(--text-secondary);font-size:0.85em;">No projects yet.<br>Click "＋ New Project" or<br>"📄 Import WSDL" to start.</div>`;
    }
    let html = '';
    for (const proj of this.projects) {
      const isSelProj = proj.id === this.selectedProjectId;
      html += `
        <div class="soap-tree-proj" data-proj="${proj.id}" style="padding:4px 6px;cursor:pointer;display:flex;align-items:center;gap:4px;font-weight:bold;background:${isSelProj ? 'var(--bg-active)' : 'transparent'};border-radius:4px;margin:1px 2px;">
          <span style="color:var(--accent-color);">▶</span>
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(proj.name)}">${escapeHtml(proj.name)}</span>
          <button class="soap-tree-add-op" data-proj="${proj.id}" title="Add Operation" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;padding:0 2px;font-size:1em;" title="Add manual operation">＋</button>
          <button class="soap-tree-del-proj" data-proj="${proj.id}" title="Delete Project" style="background:none;border:none;color:#f85149;cursor:pointer;padding:0 2px;font-size:1em;">✕</button>
        </div>`;
      // Services
      if (proj.services) {
        for (const svc of proj.services) {
          html += `<div style="padding:2px 6px 2px 16px;color:var(--text-secondary);font-size:0.82em;font-style:italic;">${escapeHtml(svc.name)}</div>`;
          for (const port of svc.ports || []) {
            html += `<div style="padding:2px 6px 2px 20px;color:var(--text-secondary);font-size:0.8em;">🔌 ${escapeHtml(port.name)}</div>`;
            for (const op of port.ops || []) {
              const sel = op.id === this.selectedOpId && port.id === this.selectedPortId;
              html += `<div class="soap-tree-op" data-proj="${proj.id}" data-port="${port.id}" data-op="${op.id}" data-svc="${svc.id}"
                style="padding:3px 6px 3px 30px;cursor:pointer;border-radius:4px;margin:1px 2px;background:${sel ? 'var(--bg-active)' : 'transparent'};display:flex;align-items:center;gap:4px;">
                <span style="color:#7ee8a2;">⚡</span>
                <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(op.name)}">${escapeHtml(op.name)}</span>
              </div>`;
            }
          }
        }
      }
      // Manual operations (flat, no services)
      if (proj.ops) {
        for (const op of proj.ops) {
          const sel = op.id === this.selectedOpId && proj.id === this.selectedProjectId && !this.selectedPortId;
          html += `<div class="soap-tree-op" data-proj="${proj.id}" data-op="${op.id}"
            style="padding:3px 6px 3px 20px;cursor:pointer;border-radius:4px;margin:1px 2px;background:${sel ? 'var(--bg-active)' : 'transparent'};display:flex;align-items:center;gap:4px;">
            <span style="color:#7ee8a2;">⚡</span>
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(op.name)}">${escapeHtml(op.name)}</span>
            <button class="soap-tree-del-op" data-proj="${proj.id}" data-op="${op.id}" style="background:none;border:none;color:#f85149;cursor:pointer;padding:0 2px;font-size:0.9em;">✕</button>
          </div>`;
        }
      }
    }
    return html;
  },

  _editorHtml() {
    const op = this._getSelectedOp();
    if (!op) {
      return `<div style="color:var(--text-secondary);padding:20px;text-align:center;">
        Select an operation from the tree, or create a new project.
      </div>`;
    }
    const proj = this.projects.find(p => p.id === this.selectedProjectId);
    const defaultEndpoint = op.endpoint || (proj?.defaultEndpoint ?? '');

    return `
      <!-- Endpoint row -->
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-weight:bold;color:var(--text-secondary);white-space:nowrap;font-size:0.85em;">Endpoint</span>
        <input id="soap-endpoint" type="text" value="${escapeHtml(defaultEndpoint)}" placeholder="https://example.com/service" style="${inputStyle()};flex:1;">
        <button id="soap-save-endpoint" title="Save endpoint to operation" style="${btnStyle()}">💾</button>
      </div>

      <!-- SOAPAction + Version -->
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
        <span style="font-size:0.82em;color:var(--text-secondary);white-space:nowrap;">SOAPAction</span>
        <input id="soap-action" type="text" value="${escapeHtml(op.soapAction || '')}" placeholder="urn:MyAction" style="${inputStyle()};flex:1;min-width:120px;">
        <select id="soap-version" title="SOAP Version" style="${inputStyle()};width:90px;">
          <option value="1.1" ${op.soapVersion !== '1.2' ? 'selected' : ''}>SOAP 1.1</option>
          <option value="1.2" ${op.soapVersion === '1.2' ? 'selected' : ''}>SOAP 1.2</option>
        </select>
      </div>

      <!-- Auth row -->
      <details style="border:1px solid var(--border-color);border-radius:4px;padding:4px 8px;">
        <summary style="cursor:pointer;font-size:0.83em;color:var(--text-secondary);">🔐 Authentication (optional)</summary>
        <div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;">
          <select id="soap-auth-type" style="${inputStyle()};width:100%;">
            <option value="none">None</option>
            <option value="basic" ${op.auth?.type === 'basic' ? 'selected' : ''}>Basic Auth</option>
            <option value="wsse" ${op.auth?.type === 'wsse' ? 'selected' : ''}>WS-Security UsernameToken</option>
          </select>
          <div id="soap-auth-fields" style="display:${(op.auth?.type && op.auth.type !== 'none') ? 'flex' : 'none'};flex-direction:column;gap:4px;">
            <input id="soap-auth-user" type="text" placeholder="Username" value="${escapeHtml(op.auth?.username || '')}" style="${inputStyle()};width:100%;box-sizing:border-box;">
            <input id="soap-auth-pass" type="password" placeholder="Password" value="${escapeHtml(op.auth?.password || '')}" style="${inputStyle()};width:100%;box-sizing:border-box;">
          </div>
        </div>
      </details>

      <!-- Custom Headers -->
      <details style="border:1px solid var(--border-color);border-radius:4px;padding:4px 8px;">
        <summary style="cursor:pointer;font-size:0.83em;color:var(--text-secondary);">📋 Custom HTTP Headers</summary>
        <textarea id="soap-custom-headers" rows="3" placeholder='{"X-Custom-Header": "value"}' style="${textareaStyle()};width:100%;box-sizing:border-box;margin-top:6px;">${escapeHtml(op.customHeaders || '')}</textarea>
      </details>

      <!-- Request body -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:2px;">
        <span style="font-weight:bold;font-size:0.85em;">Request Body (XML)</span>
        <div style="display:flex;gap:4px;">
          <button id="soap-btn-validate" title="Validate request against WSDL schema" style="${btnStyle('#6e40c9')}">🔍 Validate</button>
          <button id="soap-btn-beautify-req" title="Beautify XML" style="${btnStyle()}">✦ Beautify</button>
          <button id="soap-btn-reset" title="Reset to skeleton" style="${btnStyle()}">↺ Reset</button>
        </div>
      </div>
      <textarea id="soap-request-body" spellcheck="false" style="${textareaStyle()};flex:1;min-height:140px;resize:vertical;">${escapeHtml(op.requestBody || '')}</textarea>
      <div id="soap-validation-result" style="display:none;padding:8px;border-radius:4px;font-size:0.82em;font-family:monospace;white-space:pre-wrap;border:1px solid var(--border-color);max-height:140px;overflow-y:auto;"></div>

      <!-- Send button -->
      <div style="display:flex;gap:6px;align-items:center;">
        <button id="soap-btn-send" style="${btnStyle('#238636')};font-weight:bold;padding:6px 18px;">▶ Send</button>
        <button id="soap-btn-clear-res" style="${btnStyle()}">✕ Clear</button>
        <span id="soap-status" style="font-size:0.82em;margin-left:4px;"></span>
      </div>

      <!-- Response -->
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span style="font-weight:bold;font-size:0.85em;">Response</span>
        <div style="display:flex;gap:4px;">
          <button id="soap-btn-beautify-res" title="Beautify response XML" style="${btnStyle()}">✦ Beautify</button>
          <button id="soap-btn-copy-res" style="${btnStyle()}">📋 Copy</button>
          <button id="soap-btn-open-editor" style="${btnStyle()}">↗ Open in Editor</button>
        </div>
      </div>
      <textarea id="soap-response" readonly spellcheck="false" style="${textareaStyle()};flex:1;min-height:120px;resize:vertical;color:var(--text-secondary);"></textarea>
    `;
  },

  _getSelectedOp() {
    const proj = this.projects.find(p => p.id === this.selectedProjectId);
    if (!proj) return null;

    // Check flat ops
    if (!this.selectedPortId && this.selectedOpId && proj.ops) {
      return proj.ops.find(o => o.id === this.selectedOpId) || null;
    }

    // Check service/port ops
    if (this.selectedPortId && proj.services) {
      for (const svc of proj.services) {
        const port = svc.ports?.find(p => p.id === this.selectedPortId);
        if (port) return port.ops?.find(o => o.id === this.selectedOpId) || null;
      }
    }
    return null;
  },

  _saveSelectedOp(patch) {
    const proj = this.projects.find(p => p.id === this.selectedProjectId);
    if (!proj) return;

    if (!this.selectedPortId && this.selectedOpId && proj.ops) {
      const op = proj.ops.find(o => o.id === this.selectedOpId);
      if (op) Object.assign(op, patch);
    } else if (this.selectedPortId && proj.services) {
      for (const svc of proj.services) {
        const port = svc.ports?.find(p => p.id === this.selectedPortId);
        if (port) {
          const op = port.ops?.find(o => o.id === this.selectedOpId);
          if (op) Object.assign(op, patch);
        }
      }
    }
    ProjectStore.save(this.projects);
  },

  _refreshTree(container) {
    const tree = container.querySelector('#soap-tree');
    if (tree) tree.innerHTML = this._treeHtml();
    this._bindTree(container);
  },

  _refreshEditor(container) {
    const editor = container.querySelector('#soap-editor');
    if (editor) editor.innerHTML = this._editorHtml();
    this._bindEditor(container);
  },

  _bind(container) {
    this._bindToolbar(container);
    this._bindTree(container);
    this._bindEditor(container);
    this._bindModals(container);
  },

  _bindToolbar(container) {
    container.querySelector('#soap-btn-new-project').onclick = () => {
      const modal = container.querySelector('#soap-newproj-modal');
      modal.style.display = 'flex';
      container.querySelector('#soap-newproj-name').focus();
    };

    container.querySelector('#soap-btn-import-wsdl').onclick = () => {
      const modal = container.querySelector('#soap-wsdl-modal');
      modal.style.display = 'flex';
      container.querySelector('#soap-wsdl-url').focus();
    };

    container.querySelector('#soap-btn-export').onclick = () => {
      const json = JSON.stringify(this.projects, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'writepad-soap-projects.json';
      a.click();
      URL.revokeObjectURL(a.href);
    };

    container.querySelector('#soap-btn-import-json').onclick = () => {
      container.querySelector('#soap-file-import').click();
    };

    container.querySelector('#soap-file-import').onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const imported = JSON.parse(ev.target.result);
          if (!Array.isArray(imported)) throw new Error('Expected array of projects');
          this.projects.push(...imported);
          ProjectStore.save(this.projects);
          this._refreshTree(container);
          alert(`Imported ${imported.length} project(s).`);
        } catch (err) {
          alert('Import failed: ' + err.message);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    };
  },

  _bindTree(container) {
    // Select operation
    container.querySelectorAll('.soap-tree-op').forEach(el => {
      el.onclick = (e) => {
        if (e.target.classList.contains('soap-tree-del-op')) return;
        this.selectedProjectId = el.dataset.proj;
        this.selectedPortId = el.dataset.port || null;
        this.selectedOpId = el.dataset.op;
        // Save request body of previous op before switching
        this._refreshTree(container);
        this._refreshEditor(container);
      };
    });

    // Delete project
    container.querySelectorAll('.soap-tree-del-proj').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        if (!confirm('Delete project?')) return;
        this.projects = this.projects.filter(p => p.id !== btn.dataset.proj);
        if (this.selectedProjectId === btn.dataset.proj) {
          this.selectedProjectId = null;
          this.selectedPortId = null;
          this.selectedOpId = null;
        }
        ProjectStore.save(this.projects);
        this._refreshTree(container);
        this._refreshEditor(container);
      };
    });

    // Delete manual op
    container.querySelectorAll('.soap-tree-del-op').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const proj = this.projects.find(p => p.id === btn.dataset.proj);
        if (!proj || !proj.ops) return;
        proj.ops = proj.ops.filter(o => o.id !== btn.dataset.op);
        if (this.selectedOpId === btn.dataset.op) {
          this.selectedOpId = null;
          this.selectedPortId = null;
        }
        ProjectStore.save(this.projects);
        this._refreshTree(container);
        this._refreshEditor(container);
      };
    });

    // Add manual operation to project
    container.querySelectorAll('.soap-tree-add-op').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const proj = this.projects.find(p => p.id === btn.dataset.proj);
        if (!proj) return;
        const name = prompt('Operation name:');
        if (!name) return;
        if (!proj.ops) proj.ops = [];
        const newOp = {
          id: uid(),
          name,
          soapAction: '',
          soapVersion: '1.1',
          endpoint: proj.defaultEndpoint || '',
          requestBody: buildSoapEnvelope(name, [], '1.1'),
          auth: { type: 'none' },
          customHeaders: '',
        };
        proj.ops.push(newOp);
        this.selectedProjectId = proj.id;
        this.selectedPortId = null;
        this.selectedOpId = newOp.id;
        ProjectStore.save(this.projects);
        this._refreshTree(container);
        this._refreshEditor(container);
      };
    });
  },

  _bindEditor(container) {
    const op = this._getSelectedOp();
    if (!op) return;

    // Save request body on change
    const reqBody = container.querySelector('#soap-request-body');
    if (reqBody) reqBody.oninput = () => this._saveSelectedOp({ requestBody: reqBody.value });

    // Save endpoint
    container.querySelector('#soap-save-endpoint')?.addEventListener('click', () => {
      const ep = container.querySelector('#soap-endpoint').value.trim();
      this._saveSelectedOp({ endpoint: ep });
    });

    // Save SOAPAction + version on change
    container.querySelector('#soap-action')?.addEventListener('change', e => {
      this._saveSelectedOp({ soapAction: e.target.value });
    });
    container.querySelector('#soap-version')?.addEventListener('change', e => {
      this._saveSelectedOp({ soapVersion: e.target.value });
    });

    // Auth type toggle
    const authType = container.querySelector('#soap-auth-type');
    const authFields = container.querySelector('#soap-auth-fields');
    if (authType && authFields) {
      authType.onchange = () => {
        authFields.style.display = authType.value !== 'none' ? 'flex' : 'none';
        this._saveSelectedOp({ auth: { type: authType.value, username: container.querySelector('#soap-auth-user').value, password: container.querySelector('#soap-auth-pass').value } });
      };
    }

    // Beautify request
    container.querySelector('#soap-btn-beautify-req')?.addEventListener('click', () => {
      if (!reqBody) return;
      reqBody.value = prettyXmlV2(reqBody.value);
      this._saveSelectedOp({ requestBody: reqBody.value });
    });

    // Reset request body
    container.querySelector('#soap-btn-reset')?.addEventListener('click', () => {
      if (!reqBody) return;
      if (!confirm('Reset request body to skeleton?')) return;
      reqBody.value = buildSoapEnvelope(op.name, [], op.soapVersion || '1.1');
      this._saveSelectedOp({ requestBody: reqBody.value });
    });

    // Validate request against WSDL
    container.querySelector('#soap-btn-validate')?.addEventListener('click', () => {
      this._validateRequest(container);
    });

    // Send
    container.querySelector('#soap-btn-send')?.addEventListener('click', () => this._sendRequest(container));

    // Clear response
    container.querySelector('#soap-btn-clear-res')?.addEventListener('click', () => {
      const res = container.querySelector('#soap-response');
      if (res) res.value = '';
      const status = container.querySelector('#soap-status');
      if (status) { status.innerText = ''; status.style.color = ''; }
    });

    // Beautify response
    container.querySelector('#soap-btn-beautify-res')?.addEventListener('click', () => {
      const res = container.querySelector('#soap-response');
      if (res) res.value = prettyXmlV2(res.value);
    });

    // Copy response
    container.querySelector('#soap-btn-copy-res')?.addEventListener('click', () => {
      const txt = container.querySelector('#soap-response')?.value;
      if (txt) navigator.clipboard.writeText(txt);
    });

    // Open in editor
    container.querySelector('#soap-btn-open-editor')?.addEventListener('click', () => {
      const txt = container.querySelector('#soap-response')?.value;
      if (!txt) return;
      if (this.callbacks.createTab) this.callbacks.createTab('response.xml', txt);
    });
  },

  _validateRequest(container) {
    const resultEl = container.querySelector('#soap-validation-result');
    const reqBody = container.querySelector('#soap-request-body')?.value || '';
    const op = this._getSelectedOp();
    const proj = this.projects.find(p => p.id === this.selectedProjectId);

    const show = (msg, ok) => {
      resultEl.style.display = 'block';
      resultEl.style.background = ok ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)';
      resultEl.style.borderColor = ok ? '#3fb950' : '#f85149';
      resultEl.style.color = ok ? '#3fb950' : '#f85149';
      resultEl.innerText = msg;
    };

    // Step 1: Well-formed XML
    const parser = new DOMParser();
    const reqDoc = parser.parseFromString(reqBody, 'application/xml');
    const parseErr = reqDoc.querySelector('parsererror');
    if (parseErr) {
      show('❌ XML Parse Error:\n' + parseErr.textContent.trim(), false);
      return;
    }

    const errors = [];
    const warnings = [];

    // Step 2: SOAP Envelope structure
    const envelope = reqDoc.documentElement;
    if (envelope.localName !== 'Envelope') {
      errors.push(`Root element must be "Envelope" but found "${envelope.localName}"`);
    }
    const envNs = envelope.namespaceURI || '';
    if (!['http://schemas.xmlsoap.org/soap/envelope/', 'http://www.w3.org/2003/05/soap-envelope'].includes(envNs)) {
      errors.push(`Unknown SOAP namespace: "${envNs}"\n  Expected SOAP 1.1 or 1.2 namespace`);
    }

    const bodyEl = Array.from(envelope.children).find(c => c.localName === 'Body');
    if (!bodyEl) {
      errors.push('Missing <Body> element inside Envelope');
    }

    // Step 3: Operation element in Body
    if (bodyEl && op) {
      const bodyChildren = Array.from(bodyEl.children);
      if (bodyChildren.length === 0) {
        errors.push('Body is empty — expected an operation element');
      } else {
        const opEl = bodyChildren[0];
        if (opEl.localName !== op.name) {
          warnings.push(`Body contains "<${opEl.localName}>" but selected operation is "${op.name}"`);
        }
      }
    }

    // Step 4: WSDL schema validation
    if (!proj?.wsdlXml) {
      warnings.push('No WSDL schema stored for this project.\nImport via "📄 Import WSDL" to enable full schema validation.');
    } else {
      try {
        const wsdlDoc = parser.parseFromString(proj.wsdlXml, 'application/xml');
        const XSD = 'http://www.w3.org/2001/XMLSchema';
        const schemas = wsdlDoc.getElementsByTagNameNS(XSD, 'schema');

        if (schemas.length === 0) {
          warnings.push('No XSD schema found in WSDL <types> — skipping deep validation');
        } else {
          // Resolve input message → element name for this operation
          let inputElementName = null;
          const portTypes = wsdlDoc.getElementsByTagNameNS('*', 'portType');
          outer: for (const pt of portTypes) {
            for (const ptOp of Array.from(pt.getElementsByTagNameNS('*', 'operation'))) {
              if (ptOp.getAttribute('name') === op?.name) {
                const inputMsgName = ptOp.querySelector('input')?.getAttribute('message')?.split(':').pop();
                if (inputMsgName) {
                  const msgs = wsdlDoc.getElementsByTagNameNS('*', 'message');
                  for (const msg of msgs) {
                    if (msg.getAttribute('name') === inputMsgName) {
                      const part = msg.querySelector('part');
                      inputElementName = part?.getAttribute('element')?.split(':').pop() || part?.getAttribute('type')?.split(':').pop();
                      break;
                    }
                  }
                }
                break outer;
              }
            }
          }

          if (!inputElementName) {
            warnings.push('Could not resolve input element from WSDL — skipping deep validation');
          } else {
            // Find xsd:element definition
            let xsdElement = null;
            for (const schema of schemas) {
              for (const el of Array.from(schema.getElementsByTagNameNS(XSD, 'element'))) {
                if (el.getAttribute('name') === inputElementName && el.parentNode === schema) {
                  xsdElement = el; break;
                }
              }
              if (xsdElement) break;
            }

            if (!xsdElement) {
              warnings.push(`XSD element "${inputElementName}" not found in WSDL schema`);
            } else {
              const bodyOpEl = bodyEl ? Array.from(bodyEl.children)[0] : null;
              if (bodyOpEl) {
                this._validateXsdElement(xsdElement, bodyOpEl, '', errors, warnings, schemas, XSD);
              }
            }
          }
        }
      } catch (e) {
        warnings.push('Error reading WSDL for validation: ' + e.message);
      }
    }

    // Result
    if (errors.length === 0 && warnings.length === 0) {
      show('✅ Valid — No errors or warnings found.\nThe request XML matches the expected WSDL structure.', true);
    } else {
      let msg = '';
      if (errors.length) msg += errors.map(e => `❌ ${e}`).join('\n') + '\n';
      if (warnings.length) msg += warnings.map(w => `⚠️  ${w}`).join('\n');
      show(msg.trim(), errors.length === 0);
    }
  },

  _validateXsdElement(xsdEl, xmlEl, path, errors, warnings, schemas, XSD) {
    const complexType = Array.from(xsdEl.children).find(c =>
      c.localName === 'complexType' && c.namespaceURI === XSD
    );
    if (!complexType) return;

    const group = Array.from(complexType.children).find(c =>
      (c.localName === 'sequence' || c.localName === 'all') && c.namespaceURI === XSD
    );
    if (!group) return;

    const currentPath = path ? `${path}/${xmlEl.localName}` : xmlEl.localName;
    const expectedChildren = Array.from(group.children).filter(c =>
      c.localName === 'element' && c.namespaceURI === XSD
    );

    for (const expected of expectedChildren) {
      const name = expected.getAttribute('name');
      if (!name) continue;
      const minOccurs = parseInt(expected.getAttribute('minOccurs') ?? '1', 10);
      const nillable = expected.getAttribute('nillable') === 'true';
      const found = Array.from(xmlEl.children).filter(c => c.localName === name);

      if (found.length === 0 && minOccurs > 0 && !nillable) {
        errors.push(`Missing required element <${name}> in <${currentPath}>`);
      } else {
        found.forEach(fc => {
          if (fc.children.length === 0 && fc.textContent.trim() === '?') {
            warnings.push(`<${currentPath}/${name}> still has placeholder value "?"`);
          }
        });
      }
    }

    // Unexpected elements
    const expectedNames = new Set(expectedChildren.map(e => e.getAttribute('name')).filter(Boolean));
    Array.from(xmlEl.children).forEach(child => {
      if (!expectedNames.has(child.localName)) {
        warnings.push(`Unexpected element <${child.localName}> inside <${currentPath}>`);
      }
    });
  },

  async _sendRequest(container) {
    const op = this._getSelectedOp();
    if (!op) return;

    const endpoint = container.querySelector('#soap-endpoint')?.value.trim();
    const soapAction = container.querySelector('#soap-action')?.value.trim() || '';
    const soapVersion = container.querySelector('#soap-version')?.value || '1.1';
    const body = container.querySelector('#soap-request-body')?.value || '';
    const customHeadersStr = container.querySelector('#soap-custom-headers')?.value.trim() || '';
    const authType = container.querySelector('#soap-auth-type')?.value || 'none';
    const authUser = container.querySelector('#soap-auth-user')?.value || '';
    const authPass = container.querySelector('#soap-auth-pass')?.value || '';

    const resEl = container.querySelector('#soap-response');
    const statusEl = container.querySelector('#soap-status');

    // Save op state
    this._saveSelectedOp({
      endpoint, soapAction, soapVersion, requestBody: body, customHeaders: customHeadersStr,
      auth: { type: authType, username: authUser, password: authPass },
    });

    if (!endpoint) {
      resEl.value = 'Error: Endpoint is required.';
      return;
    }

    statusEl.innerText = 'Sending...';
    statusEl.style.color = 'var(--text-secondary)';
    resEl.value = '';

    // Build headers
    const headers = {};
    if (soapVersion === '1.2') {
      headers['Content-Type'] = `application/soap+xml; charset=utf-8${soapAction ? `; action="${soapAction}"` : ''}`;
    } else {
      headers['Content-Type'] = 'text/xml; charset=utf-8';
      if (soapAction) headers['SOAPAction'] = `"${soapAction}"`;
    }

    // Auth headers
    if (authType === 'basic' && authUser) {
      headers['Authorization'] = 'Basic ' + btoa(`${authUser}:${authPass}`);
    } else if (authType === 'wsse') {
      // Inject WS-Security header into SOAP body
      // We'll prepend it in the request body pre-processing
    }

    // Custom headers
    if (customHeadersStr) {
      try {
        const custom = JSON.parse(customHeadersStr);
        Object.assign(headers, custom);
      } catch {
        resEl.value = 'Error: Custom headers must be valid JSON.';
        statusEl.innerText = 'Error';
        statusEl.style.color = '#f85149';
        return;
      }
    }

    // WS-Security body injection
    let requestBody = body;
    if (authType === 'wsse' && authUser) {
      const wsseHeader = `<wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" mustUnderstand="1"><wsse:UsernameToken><wsse:Username>${escapeHtml(authUser)}</wsse:Username><wsse:Password>${escapeHtml(authPass)}</wsse:Password></wsse:UsernameToken></wsse:Security>`;
      requestBody = requestBody.replace(/<(\w+:)?Header\s*\/>/, `<$1Header>${wsseHeader}</$1Header>`);
      if (requestBody === body) {
        // Fallback: try to inject after header opening tag
        requestBody = requestBody.replace(/(<(\w+:)?Header>)/, `$1${wsseHeader}`);
      }
    }

    try {
      const t0 = performance.now();
      const response = await fetch(endpoint, { method: 'POST', headers, body: requestBody });
      const elapsed = Math.round(performance.now() - t0);
      const text = await response.text();

      const color = response.ok ? '#3fb950' : '#f85149';
      statusEl.innerText = `${response.status} ${response.statusText} — ${elapsed}ms`;
      statusEl.style.color = color;
      resEl.value = prettyXmlV2(text);
    } catch (err) {
      statusEl.innerText = 'Request failed';
      statusEl.style.color = '#f85149';
      resEl.value = `Request Failed:\n${err.message}\n\n(If this is a CORS error, the remote service does not allow browser requests. This will work without CORS restrictions in the Desktop app.)`;
    }
  },

  _bindModals(container) {
    // ── WSDL modal ──────────────────────────────────────────────────────────
    const wsdlModal = container.querySelector('#soap-wsdl-modal');
    const wsdlError = container.querySelector('#soap-wsdl-error');

    container.querySelector('#soap-wsdl-cancel').onclick = () => { wsdlModal.style.display = 'none'; };

    container.querySelector('#soap-wsdl-fetch-btn').onclick = async () => {
      const url = container.querySelector('#soap-wsdl-url').value.trim();
      if (!url) { wsdlError.innerText = 'URL is required'; return; }
      wsdlError.innerText = 'Fetching...';
      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        container.querySelector('#soap-wsdl-xml').value = await resp.text();
        wsdlError.innerText = '✓ WSDL fetched. Click "Import" to continue.';
        wsdlError.style.color = '#3fb950';
      } catch (err) {
        wsdlError.innerText = `Fetch failed: ${err.message} (CORS may block this in browser)`;
        wsdlError.style.color = '#f85149';
      }
    };

    container.querySelector('#soap-wsdl-import-btn').onclick = () => {
      const projName = container.querySelector('#soap-wsdl-projname').value.trim() || 'Imported Project';
      const xml = container.querySelector('#soap-wsdl-xml').value.trim();
      if (!xml) { wsdlError.innerText = 'Please provide WSDL XML (fetch or paste)'; return; }
      try {
        const services = parseWsdl(xml);
        const proj = { id: uid(), name: projName, services, wsdlXml: xml, defaultEndpoint: services[0]?.ports?.[0]?.endpoint || '' };
        this.projects.push(proj);
        ProjectStore.save(this.projects);
        wsdlModal.style.display = 'none';
        // Auto-select first op
        const firstPort = services[0]?.ports?.[0];
        const firstOp = firstPort?.ops?.[0];
        if (firstOp) {
          this.selectedProjectId = proj.id;
          this.selectedPortId = firstPort.id;
          this.selectedOpId = firstOp.id;
        }
        this._refreshTree(container);
        this._refreshEditor(container);
        // Clear modal fields
        container.querySelector('#soap-wsdl-url').value = '';
        container.querySelector('#soap-wsdl-xml').value = '';
        container.querySelector('#soap-wsdl-projname').value = '';
        wsdlError.innerText = '';
      } catch (err) {
        wsdlError.innerText = 'Parse error: ' + err.message;
        wsdlError.style.color = '#f85149';
      }
    };

    // ── New project modal ────────────────────────────────────────────────────
    const newProjModal = container.querySelector('#soap-newproj-modal');
    container.querySelector('#soap-newproj-cancel').onclick = () => { newProjModal.style.display = 'none'; };
    container.querySelector('#soap-newproj-create').onclick = () => {
      const name = container.querySelector('#soap-newproj-name').value.trim() || 'New Project';
      const endpoint = container.querySelector('#soap-newproj-endpoint').value.trim();
      const version = container.querySelector('#soap-newproj-version').value;
      const proj = { id: uid(), name, defaultEndpoint: endpoint, ops: [], services: [] };
      this.projects.push(proj);
      this.selectedProjectId = proj.id;
      this.selectedPortId = null;
      this.selectedOpId = null;
      ProjectStore.save(this.projects);
      newProjModal.style.display = 'none';
      container.querySelector('#soap-newproj-name').value = '';
      container.querySelector('#soap-newproj-endpoint').value = '';
      this._refreshTree(container);
      this._refreshEditor(container);
    };
  },
};

// ── Shared style helpers ──────────────────────────────────────────────────────
function btnStyle(bg = 'var(--bg-secondary)') {
  return `padding:4px 9px;background:${bg};color:var(--text-primary);border:1px solid var(--border-color);border-radius:4px;cursor:pointer;font-size:0.82em;`;
}
function inputStyle() {
  return `padding:4px 7px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border-color);border-radius:4px;outline:none;font-size:0.85em;`;
}
function textareaStyle() {
  return `padding:6px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border-color);border-radius:4px;outline:none;font-family:monospace;font-size:0.85em;resize:vertical;`;
}
