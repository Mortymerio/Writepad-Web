var e={callbacks:{},init(e){this.callbacks=e},renderSidebar(e){e.innerHTML=`
      <div style="display: flex; flex-direction: column; height: 100%; padding: 10px; box-sizing: border-box; background: var(--bg-primary); color: var(--text-primary);">
        <div style="margin-bottom: 10px;">
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
    `,document.getElementById(`btn-nmap-parse`).onclick=()=>this.parseAndInject()},parseAndInject(){let e=document.getElementById(`nmap-raw-input`).value,t=document.getElementById(`nmap-target-ip`).value.trim()||`TARGET_IP`,n=this.callbacks.getEditor();if(!n){alert(`No active editor found.`);return}if(t===`TARGET_IP`){let n=e.match(/Nmap scan report for (?:.*?\s*\()?([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)\)?/);n&&n[1]&&(t=n[1],document.getElementById(`nmap-target-ip`).value=t)}let r=/^([0-9]+)\/tcp\s+open\s+([\w\.-]+)/gm,i,a=[];for(;(i=r.exec(e))!==null;)a.push({port:i[1],service:i[2].toLowerCase()});if(a.length===0){alert(`No open TCP ports found in the provided nmap output.`);return}let o=`\n## 🎯 Enumeration Checklist (${t})\n\n`;a.forEach(e=>{o+=`### Port ${e.port} (${e.service})\n`,o+=this.getCommandsForService(e.port,e.service,t),o+=`
`});let s=n.getPosition();n.executeEdits(`nmap-parser`,[{range:new monaco.Range(s.lineNumber,s.column,s.lineNumber,s.column),text:o,forceMoveMarkers:!0}]),n.focus()},getCommandsForService(e,t,n){let r=[];if(t.includes(`ftp`)||e===`21`)r.push(`- [ ] Anonymous login check: \`ftp ${n}\``),r.push(`- [ ] Nmap FTP scripts: \`nmap -p${e} -sC -sV ${n}\``);else if(t.includes(`ssh`)||e===`22`)r.push(`- [ ] Check SSH version for known vulnerabilities`),r.push(`- [ ] Try weak creds (if usernames found): \`hydra -l user -P words.txt ${n} ssh\``);else if(t.includes(`http`)||[`80`,`443`,`8080`,`8443`].includes(e)){let i=e===`443`||e===`8443`||t.includes(`https`)?`https`:`http`;r.push(`- [ ] Visit ${i}://${n}:${e}/`),r.push(`- [ ] Check Wappalyzer / source code`),r.push(`- [ ] Directory fuzzing: \`ffuf -w /usr/share/seclists/Discovery/Web-Content/raft-small-words.txt -u ${i}://${n}:${e}/FUZZ\``),r.push(`- [ ] Nikto scan: \`nikto -h ${i}://${n}:${e}\``)}else t.includes(`smb`)||t.includes(`microsoft-ds`)||t.includes(`netbios`)||[`139`,`445`].includes(e)?(r.push(`- [ ] Null session check: \`smbclient -N -L //${n}\``),r.push(`- [ ] Enumerate shares: \`smbmap -H ${n}\``),r.push(`- [ ] Enum4linux: \`enum4linux -a ${n}\``)):t.includes(`mysql`)||e===`3306`?r.push(`- [ ] Try root without password: \`mysql -h ${n} -u root\``):(r.push(`- [ ] Searchsploit for version: \`searchsploit ${t}\``),r.push(`- [ ] Google default credentials for ${t}`));return r.join(`
`)}};export{e as NmapParserPanel};