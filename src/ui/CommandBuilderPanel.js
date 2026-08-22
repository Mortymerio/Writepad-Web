export const CommandBuilderPanel = {
  callbacks: {},
  
  tools: {
    ffuf: {
      name: "ffuf",
      desc: "Web fuzzer written in Go",
      fields: [
        { id: "url", label: "Target URL (include FUZZ)", type: "text", default: "http://10.10.10.X/FUZZ" },
        { id: "wordlist", label: "Wordlist", type: "text", default: "/usr/share/seclists/Discovery/Web-Content/raft-small-words.txt" },
        { id: "ext", label: "Extensions (e.g. .php,.txt)", type: "text", default: "" },
        { id: "filter", label: "Filter codes (e.g. 404,403)", type: "text", default: "404" }
      ],
      generate: (vals) => {
        let cmd = `ffuf -u ${vals.url} -w ${vals.wordlist}`;
        if (vals.ext) cmd += ` -e ${vals.ext}`;
        if (vals.filter) cmd += ` -fc ${vals.filter}`;
        return cmd;
      }
    },
    nmap: {
      name: "nmap",
      desc: "Network Mapper",
      fields: [
        { id: "target", label: "Target IP/Host", type: "text", default: "10.10.10.X" },
        { id: "type", label: "Scan Type", type: "select", options: ["Fast (-F)", "Default (-sC -sV)", "All Ports (-p-)", "UDP (-sU)"] },
        { id: "timing", label: "Timing (T1-T5)", type: "select", options: ["-T4", "-T5", "-T3"] },
        { id: "output", label: "Output format", type: "select", options: ["Normal (-oN)", "Grepable (-oG)", "XML (-oX)", "All (-oA)"] }
      ],
      generate: (vals) => {
        let cmd = `nmap ${vals.timing}`;
        if (vals.type === "Fast (-F)") cmd += " -F";
        if (vals.type === "Default (-sC -sV)") cmd += " -sC -sV";
        if (vals.type === "All Ports (-p-)") cmd += " -p-";
        if (vals.type === "UDP (-sU)") cmd += " -sU";
        
        if (vals.output.includes("-oN")) cmd += " -oN scan.txt";
        if (vals.output.includes("-oG")) cmd += " -oG scan.gnmap";
        if (vals.output.includes("-oX")) cmd += " -oX scan.xml";
        if (vals.output.includes("-oA")) cmd += " -oA scan";
        
        cmd += ` ${vals.target}`;
        return cmd;
      }
    },
    chisel: {
      name: "chisel",
      desc: "Fast TCP/UDP tunnel",
      fields: [
        { id: "mode", label: "Mode", type: "select", options: ["Server (Attacker)", "Client (Victim)"] },
        { id: "port", label: "Listen/Connect Port", type: "text", default: "8000" },
        { id: "ip", label: "Server IP (if Client)", type: "text", default: "10.10.14.X" },
        { id: "tunnel", label: "Tunnel config (e.g. R:1080:socks)", type: "text", default: "R:1080:socks" }
      ],
      generate: (vals) => {
        if (vals.mode === "Server (Attacker)") {
          return `chisel server -p ${vals.port} --reverse`;
        } else {
          return `chisel client ${vals.ip}:${vals.port} ${vals.tunnel}`;
        }
      }
    },
    sqlmap: {
      name: "sqlmap",
      desc: "Automatic SQL injection tool",
      fields: [
        { id: "url", label: "Target URL", type: "text", default: "http://10.10.10.X/item.php?id=1" },
        { id: "risk", label: "Risk (1-3)", type: "select", options: ["1", "2", "3"] },
        { id: "level", label: "Level (1-5)", type: "select", options: ["1", "2", "3", "4", "5"] },
        { id: "action", label: "Action", type: "select", options: ["Banner", "Current DB", "Dump All", "OS Shell"] }
      ],
      generate: (vals) => {
        let cmd = `sqlmap -u "${vals.url}" --risk=${vals.risk} --level=${vals.level} --batch`;
        if (vals.action === "Banner") cmd += " -b";
        if (vals.action === "Current DB") cmd += " --current-db";
        if (vals.action === "Dump All") cmd += " --dump-all";
        if (vals.action === "OS Shell") cmd += " --os-shell";
        return cmd;
      }
    }
  },

  init(callbacks) {
    this.callbacks = callbacks;
  },

  renderSidebar(container) {
    let selectOptions = Object.keys(this.tools).map(k => `<option value="${k}">${this.tools[k].name}</option>`).join('');
    
    container.innerHTML = `
      <div class="panel-container">
        <div class="panel-group">
          <h3 style="margin: 0 0 5px 0; font-size: 1.1em; color: var(--accent);">Command Builder</h3>
          <p style="margin: 0; font-size: 0.8em; color: var(--text-status);">Interactive CLI builder for common HTB tools.</p>
        </div>

        <div style="margin-bottom: 15px;">
          <label style="font-weight: bold; font-size: 0.85em;">Tool:</label>
          <select id="cmd-tool-select" style="width: 100%; padding: 5px; margin-top: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none;">
            ${selectOptions}
          </select>
        </div>

        <div id="cmd-fields-container" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px;">
          <!-- Dynamic fields go here -->
        </div>

        <div style="margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <span style="font-weight: bold; font-size: 0.85em;">Generated Command:</span>
            <button id="cmd-btn-copy" style="padding: 2px 5px; font-size: 0.75em; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer;">Copy</button>
          </div>
          <textarea id="cmd-output" readonly style="width: 100%; height: 80px; box-sizing: border-box; padding: 8px; background: var(--bg-secondary); color: var(--accent); border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.85em;"></textarea>
        </div>
      </div>
    `;

    const selectEl = document.getElementById('cmd-tool-select');
    selectEl.onchange = () => this.renderFields(selectEl.value);
    
    document.getElementById('cmd-btn-copy').onclick = () => {
      navigator.clipboard.writeText(document.getElementById('cmd-output').value);
      document.getElementById('cmd-btn-copy').innerText = "Copied!";
      setTimeout(() => document.getElementById('cmd-btn-copy').innerText = "Copy", 2000);
    };

    // Initialize first tool
    this.renderFields(selectEl.value);
  },

  renderFields(toolKey) {
    const container = document.getElementById('cmd-fields-container');
    const tool = this.tools[toolKey];
    container.innerHTML = '';

    tool.fields.forEach(f => {
      const fieldDiv = document.createElement('div');
      fieldDiv.style.display = 'flex';
      fieldDiv.style.flexDirection = 'column';
      
      const label = document.createElement('label');
      label.innerText = f.label;
      label.style.fontSize = '0.8em';
      label.style.color = 'var(--text-status)';
      fieldDiv.appendChild(label);

      let input;
      if (f.type === 'select') {
        input = document.createElement('select');
        f.options.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt;
          o.innerText = opt;
          input.appendChild(o);
        });
      } else {
        input = document.createElement('input');
        input.type = 'text';
        input.value = f.default;
      }
      
      input.id = `cmd-field-${f.id}`;
      input.style.padding = '5px';
      input.style.marginTop = '2px';
      input.style.background = 'var(--bg-primary)';
      input.style.color = 'var(--text-primary)';
      input.style.border = '1px solid var(--border-color)';
      input.style.outline = 'none';
      input.style.fontFamily = 'monospace';
      
      input.oninput = () => this.updateCommand(toolKey);
      input.onchange = () => this.updateCommand(toolKey);

      fieldDiv.appendChild(input);
      container.appendChild(fieldDiv);
    });

    this.updateCommand(toolKey);
  },

  updateCommand(toolKey) {
    const tool = this.tools[toolKey];
    const vals = {};
    tool.fields.forEach(f => {
      const el = document.getElementById(`cmd-field-${f.id}`);
      if (el) vals[f.id] = el.value;
    });

    try {
      const cmd = tool.generate(vals);
      document.getElementById('cmd-output').value = cmd;
    } catch (e) {
      document.getElementById('cmd-output').value = "Error generating command";
    }
  }
};
