const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/AgentStore-CvzeJcX-.js","assets/AgentPanel-SweqYAm-.js","assets/editor.api-D7OB3-Nf.js","assets/editor-DYpEHO_6.css","assets/preload-helper-8MtV_aQO.js","assets/ToastManager-Db86LBLx.js","assets/index-DyLEP9nV.js","assets/index-AJxxvGoq.css"])))=>i.map(i=>d[i]);
import{t as e}from"./preload-helper-8MtV_aQO.js";var t={registryUrl:`https://raw.githubusercontent.com/Mortymerio/Writepad-Web/master/public/agents_registry.json`,repoApiUrl:`https://api.github.com/repos/Mortymerio/Writepad-Web`,repoIssuesUrl:`https://github.com/Mortymerio/Writepad-Web/issues`,async getRegistry(){try{let e=await fetch(this.registryUrl+`?t=`+Date.now());if(!e.ok)throw Error(`Network error`);return await e.json()}catch(e){console.warn(`Fallo al leer de GitHub, usando fallback`,e);let t=window.location.pathname.includes(`/Writepad-Web`)?`/Writepad-Web/`:`/`;return await(await fetch(t+`agents_registry.json`)).json()}},publishAgent(e,t){let n=encodeURIComponent(`[Agent Submission]: `+e.name),r={...e};delete r.id;let i=encodeURIComponent(`### 🤖 Descripción del Agente
`+t+`

### ⚙️ Agent JSON Payload
\`\`\`json
`+JSON.stringify(r,null,2)+"\n```\n"),a=this.repoIssuesUrl+`/new?title=`+n+`&body=`+i+`&labels=agent-submission`;window.open(a,`_blank`)},async getIssueData(e){if(!e)return{votes:0,comments:0};try{let t=await fetch(this.repoApiUrl+`/issues/`+e);if(!t.ok)return{votes:0,comments:0};let n=await t.json();return{votes:n.reactions?n.reactions[`+1`]:0,comments:n.comments||0}}catch{return{votes:0,comments:0}}},async render(e,t){e.innerHTML=``;let n=document.createElement(`div`);n.style.cssText=`padding: 15px; border-bottom: 1px solid #30363d; background: #0d1117;`,n.innerHTML=`
      <h3 style="margin: 0; color: #58a6ff; display: flex; align-items: center; gap: 8px;">
        🌐 Hub Comunitario (Oficial)
      </h3>
      <p style="margin: 5px 0 0 0; font-size: 0.85em; color: #8b949e;">
        Agentes verificados alojados en el repositorio oficial de GitHub.
      </p>
    `,e.appendChild(n);let r=document.createElement(`div`);r.style.cssText=`flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 15px;`,e.appendChild(r),r.innerHTML=`<div style="padding:20px; color:#8b949e; text-align:center;">Cargando agentes de GitHub...</div>`;let i=[];try{i=await this.getRegistry()}catch{r.innerHTML=`<div style="padding:20px; color:#f85149; text-align:center;">Error al cargar el Hub. Asegurate de tener conexión.</div>`;return}r.innerHTML=``;for(let e of i){let n=document.createElement(`div`);n.style.cssText=`background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 12px; display: flex; flex-direction: column; gap: 8px; cursor: pointer; transition: border-color 0.2s;`,n.onmouseover=()=>n.style.borderColor=`#8b949e`,n.onmouseout=()=>n.style.borderColor=`#30363d`;let i=document.createElement(`div`);i.style.cssText=`display: flex; justify-content: space-between; align-items: center;`,i.innerHTML=`
        <div style="font-weight: bold; color: #c9d1d9;">${e.name} <span style="font-size:0.8em; font-weight:normal; color:#8b949e;">by @${e.author}</span></div>
        <div style="font-size: 0.8em; background: rgba(56, 139, 253, 0.15); color: #58a6ff; padding: 2px 6px; border-radius: 10px;">${e.model}</div>
      `;let a=document.createElement(`div`);a.style.cssText=`font-size: 0.9em; color: #c9d1d9;`,a.innerText=e.description;let o=document.createElement(`div`);o.style.cssText=`display: flex; gap: 5px; flex-wrap: wrap;`,(e.tools||[]).forEach(e=>{let t=document.createElement(`span`);t.innerText=e,t.style.cssText=`background: rgba(210, 168, 255, 0.1); color: #d2a8ff; border: 1px solid rgba(210, 168, 255, 0.4); padding: 2px 6px; border-radius: 10px; font-size: 0.7em; font-family: monospace;`,o.appendChild(t)}),n.appendChild(i),n.appendChild(a),n.appendChild(o),n.onclick=()=>this.showAgentDetails(e,t),r.appendChild(n)}},async showAgentDetails(t,n){let r=document.getElementById(`hub-details-modal`);r||(r=document.createElement(`div`),r.id=`hub-details-modal`,r.className=`modal-overlay`,document.body.appendChild(r)),r.style.display=`flex`,r.innerHTML=`
      <div class="modal-content" style="width: 700px; max-width: 95vw; height: 85vh; background: #0d1117; border: 1px solid #444; border-radius: 8px; color: #c9d1d9; display: flex; justify-content: center; align-items: center;">
        <h3 style="color: #8b949e;">Conectando con GitHub...</h3>
      </div>
    `;let i=await this.getIssueData(t.issue_number),a=(t.tools||[]).map(e=>`<span style="background: rgba(210, 168, 255, 0.1); color: #d2a8ff; border: 1px solid rgba(210, 168, 255, 0.4); padding: 4px 10px; border-radius: 12px; font-size: 0.85em; font-family: monospace;">${e}</span>`).join(``);a||=`<span style="color:#8b949e; font-style:italic;">Ninguna</span>`;let o=t.initialPrompt?`
      <div>
        <h4 style="margin: 0 0 8px 0; color: #c9d1d9;">Initial Task</h4>
        <pre style="background: #161b22; padding: 15px; border-radius: 6px; border: 1px solid #30363d; white-space: pre-wrap; font-family: monospace; font-size: 0.9em; color: #7ee787;">${t.initialPrompt}</pre>
      </div>
    `:``,s=t.issue_number?`
      <button id="btn-gh-discuss" style="padding: 10px 20px; background: #21262d; border: 1px solid #30363d; color: #c9d1d9; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">
         Abrir Hilo de Discusión (#${t.issue_number})
      </button>
    `:`
      <p style="color: #ff7b72; font-size: 0.9em;">Este agente oficial no tiene un hilo de discusión vinculado.</p>
    `;r.innerHTML=`
      <div class="modal-content" style="width: 700px; max-width: 95vw; height: 85vh; background: #0d1117; border: 1px solid #444; border-radius: 8px; color: #c9d1d9; display: flex; flex-direction: column;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #30363d; background: #161b22; border-radius: 8px 8px 0 0;">
          <div>
            <h3 style="margin: 0; color: #58a6ff;">${t.name}</h3>
            <span style="font-size: 0.85em; color: #8b949e;">by @${t.author}</span>
          </div>
          <button id="btn-close-hub-details" style="background: transparent; border: none; color: #8b949e; font-size: 1.5em; cursor: pointer;">&times;</button>
        </div>
        
        <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px;">
          
          <div style="background: rgba(248, 81, 73, 0.1); border-left: 4px solid #f85149; padding: 10px; border-radius: 4px;">
            <strong style="color: #ff7b72;">Advertencia de Seguridad:</strong> Asegúrese de que no contenga instrucciones maliciosas. Este agente se importará forzosamente en modo Ask.
          </div>

          <div>
            <h4 style="margin: 0 0 8px 0; color: #c9d1d9;">Herramientas (Permisos Solicitados)</h4>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${a}
            </div>
          </div>

          <div>
            <h4 style="margin: 0 0 8px 0; color: #c9d1d9;">System Prompt</h4>
            <pre style="background: #161b22; padding: 15px; border-radius: 6px; border: 1px solid #30363d; white-space: pre-wrap; font-family: monospace; font-size: 0.9em; color: #a5d6ff;">${t.systemPrompt}</pre>
          </div>

          ${o}

          <div style="display: flex; gap: 10px;">
            <button id="btn-import-agent" style="flex: 2; padding: 10px; background: #238636; border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">
              ⬇️ Importar a Local (Forzar Ask)
            </button>
          </div>

          <hr style="border: none; border-top: 1px solid #30363d; width: 100%; margin: 10px 0;">

          <div>
            <h4 style="margin: 0 0 15px 0; color: #c9d1d9; display:flex; justify-content:space-between;">
              <span>Comunidad de GitHub</span>
              <span style="font-size:0.8em; color:#8b949e;">${i.votes} 👍 | ${i.comments} 💬</span>
            </h4>
            
            <div style="background: #161b22; padding: 20px; border-radius: 6px; border: 1px solid #30363d; text-align: center;">
              <p style="color: #8b949e; margin-bottom: 15px;">Los comentarios y votos se administran en el repositorio oficial de GitHub para garantizar la seguridad y evitar spam.</p>
              ${s}
            </div>
          </div>
        </div>
      </div>
    `;let c=()=>{r.style.display=`none`};document.getElementById(`btn-close-hub-details`).onclick=c,r.onclick=e=>{e.target===r&&c()},document.getElementById(`btn-import-agent`).onclick=async()=>{let r={...t,id:`agent_`+Date.now(),name:t.name+` (Imported)`,autonomy:`ask`},{AgentStore:i}=await e(async()=>{let{AgentStore:e}=await import(`./AgentStore-CvzeJcX-.js`);return{AgentStore:e}},__vite__mapDeps([0,1,2,3,4,5,6,7]));i.saveAgent(r);let{ToastManager:a}=await e(async()=>{let{ToastManager:e}=await import(`./ToastManager-Db86LBLx.js`).then(e=>e.n);return{ToastManager:e}},__vite__mapDeps([5,2,3]));a.success(`Agente importado forzosamente en modo Ask.`),c(),n&&n()};let l=document.getElementById(`btn-gh-discuss`);l&&(l.onmouseover=()=>l.style.background=`#30363d`,l.onmouseout=()=>l.style.background=`#21262d`,l.onclick=()=>{window.open(this.repoIssuesUrl+`/`+t.issue_number,`_blank`)})}};export{t as CommunityHub};