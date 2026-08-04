var e={callbacks:{},init(e){this.callbacks=e},renderSidebar(e){e.innerHTML=`
      <div style="display: flex; flex-direction: column; height: 100%; padding: 10px; box-sizing: border-box; background: var(--bg-primary); color: var(--text-primary); overflow-y: auto;">
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 5px 0; font-size: 1.1em; color: var(--accent);">TTY Shell Stabilizer</h3>
          <p style="margin: 0; font-size: 0.8em; color: var(--text-status);">Follow these steps to upgrade a dumb reverse shell into a fully interactive TTY.</p>
        </div>

        ${[{title:`Step 1: Spawn a PTY`,desc:`Run this inside your initial reverse shell.`,code:`python3 -c 'import pty; pty.spawn("/bin/bash")'`},{title:`Step 2: Background the shell`,desc:`Press this keyboard shortcut.`,code:`Ctrl + Z`},{title:`Step 3: Fix terminal settings`,desc:`Run this on your ATTACKER machine.`,code:`stty raw -echo; fg`},{title:`Step 4: Restore environment`,desc:`Run this inside the restored reverse shell.`,code:`export TERM=xterm
export SHELL=/bin/bash`}].map((e,t)=>`
      <div style="margin-bottom: 15px; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px;">
        <h4 style="margin: 0 0 5px 0; color: var(--accent); font-size: 0.9em;">${e.title}</h4>
        <p style="margin: 0 0 8px 0; font-size: 0.8em; color: var(--text-status);">${e.desc}</p>
        <div style="display: flex; gap: 5px;">
          <input type="text" readonly value="${e.code.replace(/"/g,`&quot;`)}" style="flex: 1; padding: 5px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; font-family: monospace; font-size: 0.8em;" />
          <button class="tty-copy-btn" data-code="${e.code.replace(/"/g,`&quot;`)}" style="padding: 5px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer; font-size: 0.8em;">Copy</button>
        </div>
      </div>
    `).join(``)}

        <div style="margin-top: 10px; padding: 10px; border-top: 1px solid var(--border-color);">
          <h4 style="margin: 0 0 5px 0; color: var(--accent); font-size: 0.9em;">Alternatives for Step 1</h4>
          <ul style="font-size: 0.8em; padding-left: 15px; margin: 0; color: var(--text-status);">
            <li style="margin-bottom: 5px;"><code>script /dev/null -c bash</code></li>
            <li style="margin-bottom: 5px;"><code>python -c 'import pty; pty.spawn("/bin/bash")'</code></li>
            <li><code>/usr/bin/script -qc /bin/bash /dev/null</code></li>
          </ul>
        </div>
      </div>
    `,e.querySelectorAll(`.tty-copy-btn`).forEach(e=>{e.onclick=()=>{navigator.clipboard.writeText(e.getAttribute(`data-code`));let t=e.innerText;e.innerText=`Copied!`,setTimeout(()=>e.innerText=t,1500)}})}};export{e as TTYStabilizerPanel};