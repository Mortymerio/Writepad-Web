export const NmapParserPanel = {
  callbacks: {},

  init(callbacks) {
    this.callbacks = callbacks;
  },

  renderSidebar(container) {
    container.innerHTML = `
      <div class="panel-container">
        <div class="panel-group">
          <h3 style="margin: 0 0 5px 0; font-size: 1.1em; color: var(--accent);">Nmap Auto-Parser</h3>
          <p style="margin: 0; font-size: 0.8em; color: var(--text-status);">Paste Nmap output to generate a checklist.</p>
        </div>

        <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 5px;">
          <span style="font-weight: bold; font-size: 0.85em;">Target IP:</span>
          <input type="text" id="nmap-target-ip" placeholder="10.10.10.X" style="flex: 1; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none;" />
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; margin-bottom: 10px;">
          <label style="font-size: 0.85em; font-weight: bold; margin-bottom: 5px;">Raw Scan Output:</label>
          <textarea id="nmap-raw-input" style="flex: 1; width: 100%; box-sizing: border-box; padding: 8px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.85em;" placeholder="Paste nmap scan output here...
Example:
22/tcp open  ssh
80/tcp open  http"></textarea>
        </div>

        <button id="btn-nmap-parse" style="padding: 8px; background: var(--accent); color: white; border: none; cursor: pointer; font-weight: bold; border-radius: 3px;">Parse & Inject to Editor</button>
      </div>
    `;

    document.getElementById('btn-nmap-parse').onclick = () => this.parseAndInject();
  },

  parseAndInject() {
    const rawInput = document.getElementById('nmap-raw-input').value;
    let targetIp = document.getElementById('nmap-target-ip').value.trim() || 'TARGET_IP';
    const editor = this.callbacks.getEditor();
    
    if (!editor) {
      alert("No active editor found.");
      return;
    }

    // Try to auto-detect IP from nmap output if not provided
    if (targetIp === 'TARGET_IP') {
      const ipMatch = rawInput.match(/Nmap scan report for (?:.*?\s*\()?([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)\)?/);
      if (ipMatch && ipMatch[1]) {
        targetIp = ipMatch[1];
        document.getElementById('nmap-target-ip').value = targetIp;
      }
    }

    // Regex to match "80/tcp open http"
    const portRegex = /^([0-9]+)\/tcp\s+open\s+([\w\.-]+)/gm;
    let match;
    const openPorts = [];
    
    while ((match = portRegex.exec(rawInput)) !== null) {
      openPorts.push({ port: match[1], service: match[2].toLowerCase() });
    }

    if (openPorts.length === 0) {
      alert("No open TCP ports found in the provided nmap output.");
      return;
    }

    let checklist = `\n## 🎯 Enumeration Checklist (${targetIp})\n\n`;

    openPorts.forEach(p => {
      checklist += `### Port ${p.port} (${p.service})\n`;
      checklist += this.getCommandsForService(p.port, p.service, targetIp);
      checklist += `\n`;
    });

    // Inject into editor
    const position = editor.getPosition();
    editor.executeEdits("nmap-parser", [{
      range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
      text: checklist,
      forceMoveMarkers: true
    }]);
    editor.focus();
  },

  getCommandsForService(port, service, ip) {
    let tasks = [];

    if (service.includes('ftp') || port === '21') {
      tasks.push(`- [ ] Anonymous login check: \`ftp ${ip}\``);
      tasks.push(`- [ ] Nmap FTP scripts: \`nmap -p${port} -sC -sV ${ip}\``);
    }
    else if (service.includes('ssh') || port === '22') {
      tasks.push(`- [ ] Check SSH version for known vulnerabilities`);
      tasks.push(`- [ ] Try weak creds (if usernames found): \`hydra -l user -P words.txt ${ip} ssh\``);
    }
    else if (service.includes('http') || ['80', '443', '8080', '8443'].includes(port)) {
      const scheme = (port === '443' || port === '8443' || service.includes('https')) ? 'https' : 'http';
      tasks.push(`- [ ] Visit ${scheme}://${ip}:${port}/`);
      tasks.push(`- [ ] Check Wappalyzer / source code`);
      tasks.push(`- [ ] Directory fuzzing: \`ffuf -w /usr/share/seclists/Discovery/Web-Content/raft-small-words.txt -u ${scheme}://${ip}:${port}/FUZZ\``);
      tasks.push(`- [ ] Nikto scan: \`nikto -h ${scheme}://${ip}:${port}\``);
    }
    else if (service.includes('smb') || service.includes('microsoft-ds') || service.includes('netbios') || ['139', '445'].includes(port)) {
      tasks.push(`- [ ] Null session check: \`smbclient -N -L //${ip}\``);
      tasks.push(`- [ ] Enumerate shares: \`smbmap -H ${ip}\``);
      tasks.push(`- [ ] Enum4linux: \`enum4linux -a ${ip}\``);
    }
    else if (service.includes('mysql') || port === '3306') {
      tasks.push(`- [ ] Try root without password: \`mysql -h ${ip} -u root\``);
    }
    else {
      tasks.push(`- [ ] Searchsploit for version: \`searchsploit ${service}\``);
      tasks.push(`- [ ] Google default credentials for ${service}`);
    }

    return tasks.join('\n');
  }
};
