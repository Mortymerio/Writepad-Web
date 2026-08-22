var e={callbacks:{},init(e){this.callbacks=e},renderSidebar(e){e.innerHTML=`
      <div class="panel-container">
        <div class="panel-group">
          <h3 style="margin: 0 0 5px 0; font-size: 1.1em; color: var(--accent);">PEAS Auto-Analyzer</h3>
          <p style="margin: 0; font-size: 0.8em; color: var(--text-status);">Extract high-probability PrivEsc vectors.</p>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; margin-bottom: 10px;">
          <label style="font-size: 0.85em; font-weight: bold; margin-bottom: 5px;">Raw LinPEAS/WinPEAS Output:</label>
          <textarea id="peas-raw-input" style="flex: 1; width: 100%; min-height: 200px; box-sizing: border-box; padding: 8px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.8em;" placeholder="Paste PEAS output here...

Hint: The parser looks for RED/YELLOW ansi color indicators or keywords like SUID, Capabilities, CVEs..."></textarea>
        </div>

        <button id="btn-peas-parse" style="padding: 8px; background: var(--accent); color: white; border: none; cursor: pointer; font-weight: bold; border-radius: 3px;">Analyze & Inject to Editor</button>
      </div>
    `,document.getElementById(`btn-peas-parse`).onclick=()=>this.parseAndInject()},parseAndInject(){let e=document.getElementById(`peas-raw-input`).value,t=this.callbacks.getEditor();if(!t){alert(`No active editor found.`);return}if(!e.trim()){alert(`Please paste PEAS output first.`);return}let n=[],r=e.match(/CVE-\d{4}-\d{4,}/gi);if(r){let e=[...new Set(r)];n.push(`### 🐛 Vulnerable CVEs Detected`),e.forEach(e=>{n.push(`- [ ] Exploit ${e}: [Search Exploit](https://github.com/nomi-sec/PoC-in-GitHub) | \`searchsploit ${e}\``)}),n.push(``)}(/SUID - Check easy privesc/i.test(e)||/Interesting SUID/i.test(e))&&(n.push(`### 🛡️ SUID/SGID Binaries`),n.push(`- [ ] Review SUID binaries listed in output.`),n.push(`- [ ] Check GTFOBins for bypasses: [GTFOBins](https://gtfobins.github.io/)`),n.push(``)),/Capabilities/i.test(e)&&(n.push(`### 🔧 Linux Capabilities`),n.push("- [ ] Review binaries with capabilities (e.g. `cap_setuid+ep`)."),n.push("- [ ] `getcap -r / 2>/dev/null`"),n.push(``)),(/Cron jobs/i.test(e)||/systemd timers/i.test(e))&&(n.push(`### ⏰ Scheduled Tasks (Cron/Timers)`),n.push(`- [ ] Check for writable scripts executed by root.`),n.push("- [ ] Check for wildcard (`*`) injections in cron commands."),n.push(``)),(/passwords/i.test(e)||/credentials/i.test(e)||/password=/i.test(e))&&(n.push(`### 🔑 Credentials Found`),n.push(`- [ ] Check config files, history files, and memory dumps for plaintext passwords.`),n.push(`- [ ] Try password reuse for root or other users.`),n.push(``)),n.length===0&&(n.push(`### ⚠️ No automated high-probability findings extracted.`),n.push(`- [ ] Manual review of PEAS output required.`),n.push("- [ ] Check kernel version for known exploits (`uname -a`)."),n.push("- [ ] Check internal open ports (`netstat -tulpn`)."));let i=`
## 🧠 PEAS PrivEsc Analysis

`+n.join(`
`)+`
`,a=t.getPosition();t.executeEdits(`peas-analyzer`,[{range:new monaco.Range(a.lineNumber,a.column,a.lineNumber,a.column),text:i,forceMoveMarkers:!0}]),t.focus()}};export{e as PeasAnalyzerPanel};