export const TemplateGeneratorPanel = {
  callbacks: {},

  init(callbacks) {
    this.callbacks = callbacks;
  },

  renderSidebar(container) {
    container.innerHTML = `
      <div class="panel-container">
        <div class="panel-group">
          <h3 style="margin: 0 0 5px 0; font-size: 1.1em; color: var(--accent);">Writeup Template</h3>
          <p style="margin: 0; font-size: 0.8em; color: var(--text-status);">Generate a new markdown writeup structure.</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
          <div>
            <label style="font-weight: bold; font-size: 0.85em;">Machine Name:</label>
            <input type="text" id="tpl-name" placeholder="e.g. Lame" style="width: 100%; box-sizing: border-box; padding: 5px; margin-top: 2px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none;" />
          </div>
          <div>
            <label style="font-weight: bold; font-size: 0.85em;">Target IP:</label>
            <input type="text" id="tpl-ip" placeholder="10.10.10.X" style="width: 100%; box-sizing: border-box; padding: 5px; margin-top: 2px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none;" />
          </div>
          <div class="panel-group">
          <label style="font-size: 0.85em; font-weight: bold; color: var(--text-status);">OS:</label>
          <select id="tpl-os" style="width: 100%; box-sizing: border-box; padding: 5px; margin-top: 2px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none;">
            <option style="background: var(--bg-secondary); color: var(--text-primary);">Linux</option>
            <option style="background: var(--bg-secondary); color: var(--text-primary);">Windows</option>
          </select>
        </div>

        <div style="margin-bottom: 15px;">
          <label style="font-size: 0.85em; font-weight: bold; color: var(--text-status);">Difficulty:</label>
          <select id="tpl-diff" style="width: 100%; box-sizing: border-box; padding: 5px; margin-top: 2px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none;">
            <option style="background: var(--bg-secondary); color: var(--text-primary);">Easy</option>
            <option style="background: var(--bg-secondary); color: var(--text-primary);">Medium</option>
            <option style="background: var(--bg-secondary); color: var(--text-primary);">Hard</option>
            <option style="background: var(--bg-secondary); color: var(--text-primary);">Insane</option>
          </select>
        </div>
        </div>

        <button id="btn-tpl-generate" style="padding: 10px; background: var(--accent); color: white; border: none; cursor: pointer; font-weight: bold; border-radius: 3px;">Generate New Document</button>
      </div>
    `;

    document.getElementById('btn-tpl-generate').onclick = () => this.generateTemplate();
  },

  generateTemplate() {
    const name = document.getElementById('tpl-name').value.trim() || 'MachineName';
    const ip = document.getElementById('tpl-ip').value.trim() || '10.10.10.X';
    const os = document.getElementById('tpl-os').value;
    const diff = document.getElementById('tpl-diff').value;

    const tpl = `# Hack The Box - ${name}

## 📊 Summary
- **OS**: ${os}
- **IP**: ${ip}
- **Difficulty**: ${diff}

---

## 🔍 1. Reconnaissance & Enumeration

### Nmap Scan
\`\`\`bash
nmap -p- --min-rate 1000 -T4 ${ip}
nmap -p <PORTS> -sC -sV ${ip} -oN nmap_initial.txt
\`\`\`

**Findings:**
- [ ] Port 22 (SSH)
- [ ] Port 80 (HTTP)

---

## 🚪 2. Foothold / Initial Access

### Discovery
*How did we discover the entry point?*

### Exploitation
*Step-by-step to get the initial shell.*

\`\`\`bash
# Exploit commands here
\`\`\`

**User Flag**: \`\`

---

## 👑 3. Privilege Escalation

### Internal Enumeration
*What did we find inside the box? (LinPEAS/WinPEAS, SUID, Cron jobs)*

### Path to Root/SYSTEM
*How did we escalate?*

\`\`\`bash
# Privesc commands here
\`\`\`

**Root Flag**: \`\`

---

## 🧠 4. Lessons Learned & Tags
- 
- 
`;

    // Create a new tab with this content
    if (this.callbacks.createTab) {
      this.callbacks.createTab(`${name}.md`, tpl);
    } else {
      // Fallback if createTab is not mapped perfectly, just replace current editor content
      const editor = this.callbacks.getEditor();
      if (editor) {
        editor.setValue(tpl);
      }
    }
  }
};
