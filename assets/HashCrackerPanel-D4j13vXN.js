var e=[{name:`MD5`,regex:/^[a-fA-F0-9]{32}$/,mode:0,example:`8743b52063cd84097a65d1633f5c74f5`},{name:`NTLM`,regex:/^[a-fA-F0-9]{32}$/,mode:1e3,example:`b4b9b02e6f09a9bd760f388b67351e2b`,note:`Shares length with MD5. In a Windows AD context, it's almost certainly NTLM.`},{name:`SHA-1`,regex:/^[a-fA-F0-9]{40}$/,mode:100,example:`b89eaac7e61417341b710b727768294d0e6a277b`},{name:`SHA-256`,regex:/^[a-fA-F0-9]{64}$/,mode:1400,example:`127e6fbfe24a750e72930c220a8e138275656b8e5d8f48a98c3c92df2caba935`},{name:`SHA-512`,regex:/^[a-fA-F0-9]{128}$/,mode:1700,example:`82a9dda829eb7f8ffe9fbe49e45d47d2dad9664fbb7adf72492e3c81ebd3e29134d9bc12212bf83c6840f10e8246ab1440a3e8d8ee3468579471de9996e1cc8`},{name:`bcrypt (Blowfish)`,regex:/^\$2[aby]\$[0-9]{2}\$[a-zA-Z0-9\.\/]{53}$/,mode:3200,example:`$2a$12$R9h/cIPz0gi.URNNX3rub2D9te.RzsWuT7Oq/m06C4p5x1s18a7w.`}],t={callbacks:{},init(e){this.callbacks=e},renderSidebar(t){t.innerHTML=`
      <div style="display: flex; flex-direction: column; height: 100%; padding: 10px; box-sizing: border-box; background: var(--bg-primary); color: var(--text-primary);">
        <div style="margin-bottom: 10px;">
          <label style="font-size: 0.8em; font-weight: bold;">Paste Hash:</label>
          <textarea id="hash-input" placeholder="e.g. 5d41402abc4b2a76b9719d911017c592" style="width: 100%; height: 80px; box-sizing: border-box; margin-top: 5px; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.9em;"></textarea>
          <button id="hash-btn-selection" style="margin-top: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer; padding: 4px; border-radius: 4px; font-size: 0.8em; width: 100%;">Get Editor Selection</button>
        </div>
        
        <div id="hash-results" style="flex: 1; overflow-y: auto; padding-top: 10px; border-top: 1px solid var(--border-color);">
          <div style="color: #888; font-size: 0.9em; text-align: center; margin-top: 20px;">Enter a hash to identify it.</div>
        </div>
      </div>
    `;let n=document.getElementById(`hash-input`),r=document.getElementById(`hash-results`),i=()=>{let t=n.value.trim();if(!t){r.innerHTML=`<div style="color: #888; font-size: 0.9em; text-align: center; margin-top: 20px;">Enter a hash to identify it.</div>`;return}let i=e.filter(e=>e.regex.test(t));if(i.length===0){r.innerHTML=`<div style="color: #ff7b72; font-size: 0.9em; text-align: center; margin-top: 20px;">Unknown Hash Format</div>`;return}let a=``;i.forEach(e=>{a+=`
          <div style="margin-bottom: 15px; border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 4px; padding: 8px;">
            <div style="font-weight: bold; font-size: 1.1em; color: #58a6ff;">${e.name}</div>
            ${e.note?`<div style="font-size: 0.8em; color: #8b949e; margin-top: 4px;">Note: ${e.note}</div>`:``}
            
            <div style="margin-top: 10px; font-size: 0.85em; font-weight: bold; color: #c9d1d9;">Hashcat Mode: <span style="color: #ff7b72;">${e.mode}</span></div>
            
            <div style="margin-top: 8px;">
              <div style="font-size: 0.8em; color: #8b949e; margin-bottom: 4px;">Example Hashcat Command:</div>
              <pre style="margin: 0; background: var(--bg-primary); padding: 6px; border-radius: 4px; font-size: 0.85em; overflow-x: auto; font-family: monospace; border: 1px solid var(--border-color); color: #a5d6ff;">hashcat -a 0 -m ${e.mode} hash.txt /usr/share/wordlists/rockyou.txt</pre>
            </div>
            <div style="margin-top: 8px;">
              <div style="font-size: 0.8em; color: #8b949e; margin-bottom: 4px;">Example John Command:</div>
              <pre style="margin: 0; background: var(--bg-primary); padding: 6px; border-radius: 4px; font-size: 0.85em; overflow-x: auto; font-family: monospace; border: 1px solid var(--border-color); color: #a5d6ff;">john --format=Raw-${e.name.replace(/[^a-zA-Z0-9]/g,``)} --wordlist=/usr/share/wordlists/rockyou.txt hash.txt</pre>
            </div>
          </div>
        `}),r.innerHTML=a};n.addEventListener(`input`,i),document.getElementById(`hash-btn-selection`).onclick=()=>{let e=this.callbacks.getEditor();if(!e)return;let t=e.getSelection(),r=e.getModel().getValueInRange(t);r&&(n.value=r.trim(),i())}}};export{t as HashCrackerPanel};