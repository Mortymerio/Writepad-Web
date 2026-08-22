export const PeasAnalyzerPanel = {
  callbacks: {},

  init(callbacks) {
    this.callbacks = callbacks;
  },

  renderSidebar(container) {
    container.innerHTML = `
      <div class="panel-container">
        <div class="panel-group">
          <h3 style="margin: 0 0 5px 0; font-size: 1.1em; color: var(--accent);">PEAS Auto-Analyzer</h3>
          <p style="margin: 0; font-size: 0.8em; color: var(--text-status);">Extract high-probability PrivEsc vectors.</p>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; margin-bottom: 10px;">
          <label style="font-size: 0.85em; font-weight: bold; margin-bottom: 5px;">Raw LinPEAS/WinPEAS Output:</label>
          <textarea id="peas-raw-input" style="flex: 1; width: 100%; min-height: 200px; box-sizing: border-box; padding: 8px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.8em;" placeholder="Paste PEAS output here...\n\nHint: The parser looks for RED/YELLOW ansi color indicators or keywords like SUID, Capabilities, CVEs..."></textarea>
        </div>

        <button id="btn-peas-parse" style="padding: 8px; background: var(--accent); color: white; border: none; cursor: pointer; font-weight: bold; border-radius: 3px;">Analyze & Inject to Editor</button>
      </div>
    `;

    document.getElementById('btn-peas-parse').onclick = () => this.parseAndInject();
  },

  parseAndInject() {
    const rawInput = document.getElementById('peas-raw-input').value;
    const editor = this.callbacks.getEditor();
    
    if (!editor) {
      alert("No active editor found.");
      return;
    }

    if (!rawInput.trim()) {
      alert("Please paste PEAS output first.");
      return;
    }

    let findings = [];

    // Basic heuristic regexes for PrivEsc vectors in raw text
    // (since copy-paste usually loses ANSI colors, we match common headers and keywords)

    // 1. CVEs
    const cveMatches = rawInput.match(/CVE-\d{4}-\d{4,}/gi);
    if (cveMatches) {
      const uniqueCves = [...new Set(cveMatches)];
      findings.push(`### 🐛 Vulnerable CVEs Detected`);
      uniqueCves.forEach(cve => {
        findings.push(`- [ ] Exploit ${cve}: [Search Exploit](https://github.com/nomi-sec/PoC-in-GitHub) | \`searchsploit ${cve}\``);
      });
      findings.push("");
    }

    // 2. SUID/SGID Binaries
    if (/SUID - Check easy privesc/i.test(rawInput) || /Interesting SUID/i.test(rawInput)) {
      findings.push(`### 🛡️ SUID/SGID Binaries`);
      findings.push(`- [ ] Review SUID binaries listed in output.`);
      findings.push(`- [ ] Check GTFOBins for bypasses: [GTFOBins](https://gtfobins.github.io/)`);
      findings.push("");
    }

    // 3. Capabilities
    if (/Capabilities/i.test(rawInput)) {
      findings.push(`### 🔧 Linux Capabilities`);
      findings.push(`- [ ] Review binaries with capabilities (e.g. \`cap_setuid+ep\`).`);
      findings.push(`- [ ] \`getcap -r / 2>/dev/null\``);
      findings.push("");
    }

    // 4. Cron Jobs / Timers
    if (/Cron jobs/i.test(rawInput) || /systemd timers/i.test(rawInput)) {
      findings.push(`### ⏰ Scheduled Tasks (Cron/Timers)`);
      findings.push(`- [ ] Check for writable scripts executed by root.`);
      findings.push(`- [ ] Check for wildcard (\`*\`) injections in cron commands.`);
      findings.push("");
    }

    // 5. Passwords / Credentials
    if (/passwords/i.test(rawInput) || /credentials/i.test(rawInput) || /password=/i.test(rawInput)) {
      findings.push(`### 🔑 Credentials Found`);
      findings.push(`- [ ] Check config files, history files, and memory dumps for plaintext passwords.`);
      findings.push(`- [ ] Try password reuse for root or other users.`);
      findings.push("");
    }

    if (findings.length === 0) {
      findings.push(`### ⚠️ No automated high-probability findings extracted.`);
      findings.push(`- [ ] Manual review of PEAS output required.`);
      findings.push(`- [ ] Check kernel version for known exploits (\`uname -a\`).`);
      findings.push(`- [ ] Check internal open ports (\`netstat -tulpn\`).`);
    }

    let report = `\n## 🧠 PEAS PrivEsc Analysis\n\n` + findings.join('\n') + `\n`;

    // Inject into editor
    const position = editor.getPosition();
    editor.executeEdits("peas-analyzer", [{
      range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
      text: report,
      forceMoveMarkers: true
    }]);
    editor.focus();
  }
};
