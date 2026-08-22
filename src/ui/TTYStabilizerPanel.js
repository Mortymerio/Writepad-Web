export const TTYStabilizerPanel = {
  callbacks: {},

  init(callbacks) {
    this.callbacks = callbacks;
  },

  renderSidebar(container) {
    const steps = [
      {
        title: "Step 1: Spawn a PTY",
        desc: "Run this inside your initial reverse shell.",
        code: `python3 -c 'import pty; pty.spawn("/bin/bash")'`
      },
      {
        title: "Step 2: Background the shell",
        desc: "Press this keyboard shortcut.",
        code: `Ctrl + Z`
      },
      {
        title: "Step 3: Fix terminal settings",
        desc: "Run this on your ATTACKER machine.",
        code: `stty raw -echo; fg`
      },
      {
        title: "Step 4: Restore environment",
        desc: "Run this inside the restored reverse shell.",
        code: `export TERM=xterm\nexport SHELL=/bin/bash`
      }
    ];

    let stepsHtml = steps.map((s, i) => `
      <div style="margin-bottom: 15px; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px;">
        <h4 style="margin: 0 0 5px 0; color: var(--accent); font-size: 0.9em;">${s.title}</h4>
        <p style="margin: 0 0 8px 0; font-size: 0.8em; color: var(--text-status);">${s.desc}</p>
        <div style="display: flex; gap: 5px;">
          <input type="text" readonly value="${s.code.replace(/"/g, '&quot;')}" style="flex: 1; padding: 5px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; font-family: monospace; font-size: 0.8em;" />
          <button class="tty-copy-btn" data-code="${s.code.replace(/"/g, '&quot;')}" style="padding: 5px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer; font-size: 0.8em;">Copy</button>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="panel-container">
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 5px 0; font-size: 1.1em; color: var(--accent);">TTY Shell Stabilizer</h3>
          <p style="margin: 0; font-size: 0.8em; color: var(--text-status);">Follow these steps to upgrade a dumb reverse shell into a fully interactive TTY.</p>
        </div>

        ${stepsHtml}

        <div style="margin-top: 10px; padding: 10px; border-top: 1px solid var(--border-color);">
          <h4 style="margin: 0 0 5px 0; color: var(--accent); font-size: 0.9em;">Alternatives for Step 1</h4>
          <ul style="font-size: 0.8em; padding-left: 15px; margin: 0; color: var(--text-status);">
            <li style="margin-bottom: 5px;"><code>script /dev/null -c bash</code></li>
            <li style="margin-bottom: 5px;"><code>python -c 'import pty; pty.spawn("/bin/bash")'</code></li>
            <li><code>/usr/bin/script -qc /bin/bash /dev/null</code></li>
          </ul>
        </div>
      </div>
    `;

    // Bind copy buttons
    container.querySelectorAll('.tty-copy-btn').forEach(btn => {
      btn.onclick = () => {
        navigator.clipboard.writeText(btn.getAttribute('data-code'));
        const originalText = btn.innerText;
        btn.innerText = "Copied!";
        setTimeout(() => btn.innerText = originalText, 1500);
      };
    });
  }
};
