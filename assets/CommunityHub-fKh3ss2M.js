const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/ToastManager-Db86LBLx.js","assets/editor.api-D7OB3-Nf.js","assets/editor-DYpEHO_6.css"])))=>i.map(i=>d[i]);
import{t as e}from"./preload-helper-8MtV_aQO.js";var t={registryUrl:`https://raw.githubusercontent.com/Mortymerio/Writepad-Web/master/public/agents_registry.json`,repoApiUrl:`https://api.github.com/repos/Mortymerio/Writepad-Web`,repoIssuesUrl:`https://github.com/Mortymerio/Writepad-Web/issues`,async getRegistry(){try{let e=await fetch(this.registryUrl+`?t=`+Date.now());if(!e.ok)throw Error(`Network error`);return await e.json()}catch(e){console.warn(`Fallo al leer de GitHub, usando fallback`,e);let t=window.location.pathname.includes(`/Writepad-Web`)?`/Writepad-Web/`:`/`;return await(await fetch(t+`agents_registry.json`)).json()}},publishAgent(e,t){let n=encodeURIComponent(`[Agent Submission]: `+e.name),r={...e,description:t||`Sin descripción`,author:`GitHub User`};delete r.id;let i=encodeURIComponent(`### 🤖 Descripción del Agente
`+t+`

### ⚙️ Agent JSON Payload
\`\`\`json
`+JSON.stringify(r,null,2)+"\n```\n"),a=this.repoIssuesUrl+`/new?title=`+n+`&body=`+i+`&labels=agent-submission`;window.open(a,`_blank`)},async getIssueData(e){if(!e)return{votes:0,comments:0};try{let t=await fetch(this.repoApiUrl+`/issues/`+e);if(!t.ok)return{votes:0,comments:0};let n=await t.json();return{votes:n.reactions?n.reactions[`+1`]:0,comments:n.comments||0}}catch{return{votes:0,comments:0}}},async render(e,t){e.innerHTML=``,e.className=`hub-container`;let n=document.createElement(`div`);n.className=`hub-header`,n.innerHTML=`
      <div class="hub-header__top">
        <h3 class="hub-header__title">🌐 Hub Comunitario (Oficial)</h3>
      </div>
      <p style="margin: 0; font-size: 0.85em; color: var(--text-secondary);">
        Agentes verificados alojados en el repositorio oficial de GitHub.
      </p>
    `,e.appendChild(n);let r=document.createElement(`div`);r.className=`hub-list`,e.appendChild(r),r.innerHTML=`<div class='hub-loading'>Cargando agentes de GitHub...</div>`;let i=[];try{i=await this.getRegistry()}catch{r.innerHTML=`<div class='hub-loading' style='color: var(--danger);'>Error al cargar el Hub. Asegurate de tener conexión.</div>`;return}r.innerHTML=``;for(let e of i){let n=document.createElement(`div`);n.className=`hub-card`;let i=document.createElement(`div`);i.className=`hub-card__header`,i.innerHTML=`
        <div class="hub-card__name">${e.name} <span class="hub-card__author">by @${e.author}</span></div>
        <div class="hub-card__badge">${e.model}</div>
      `;let a=document.createElement(`div`);a.className=`hub-card__desc`,a.innerText=e.description;let o=document.createElement(`div`);o.style.cssText=`display: flex; gap: 5px; flex-wrap: wrap;`,(e.tools||[]).forEach(e=>{let t=document.createElement(`span`);t.innerText=e,t.style.cssText=`background: rgba(210, 168, 255, 0.1); color: #d2a8ff; border: 1px solid rgba(210, 168, 255, 0.4); padding: 2px 6px; border-radius: 10px; font-size: 0.7em; font-family: monospace;`,o.appendChild(t)}),n.appendChild(i),n.appendChild(a),n.appendChild(o),n.onclick=()=>this.showAgentDetails(e,t),r.appendChild(n)}},async showAgentDetails(t,n){let r=document.getElementById(`hub-details-modal`);r||(r=document.createElement(`div`),r.id=`hub-details-modal`,r.className=`modal-overlay`,document.body.appendChild(r)),r.style.display=`flex`,r.innerHTML=`
      <div class="modal-content hub-modal">
        <h3>Conectando con GitHub...</h3>
      </div>
    `;let i=await this.getIssueData(t.issue_number),a=(t.tools||[]).map(e=>`<span class="hub-tool-badge">${e}</span>`).join(``);a||=`<span class="text-muted">Ninguna</span>`;let o=t.initialPrompt?`
      <div>
        <h4>Initial Task</h4>
        <pre class="hub-code-block">${t.initialPrompt}</pre>
      </div>
    `:``,s=t.issue_number?`
      <button id="btn-gh-discuss" class="hub-btn hub-btn--secondary">
         Abrir Hilo de Discusión (#${t.issue_number})
      </button>
    `:`
      <p class="text-danger">Este agente oficial no tiene un hilo de discusión vinculado.</p>
    `;r.innerHTML=`
      <div class="modal-content hub-modal">
        <div class="modal-header">
          <div>
            <h3>${t.name}</h3>
            <span class="text-muted">by @${t.author}</span>
          </div>
          <button id="btn-close-hub-details" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body hub-modal__body">
          
          <div class="alert alert-danger">
            <strong>Advertencia de Seguridad:</strong> Asegúrese de que no contenga instrucciones maliciosas. Este agente se importará forzosamente en modo Ask.
          </div>

          <div>
            <h4>Herramientas (Permisos Solicitados)</h4>
            <div class="flex-wrap">
              ${a}
            </div>
          </div>

          <div>
            <h4>System Prompt</h4>
            <pre class="hub-code-block">${t.systemPrompt}</pre>
          </div>

          ${o}

          <div class="flex-row">
            <button id="btn-import-agent" class="hub-btn hub-btn--primary">
              ⬇️ Importar a Local (Forzar Ask)
            </button>
          </div>

          <hr class="hub-divider">

          <div>
            <h4 class="flex-between">
              <span>Comunidad de GitHub</span>
              <span class="text-muted">${i.votes} 👍 | ${i.comments} 💬</span>
            </h4>
            
            <div class="hub-discussion-box">
              <p class="text-muted">Los comentarios y votos se administran en el repositorio oficial de GitHub para garantizar la seguridad y evitar spam.</p>
              ${s}
            </div>
          </div>
        </div>
      </div>
    `;let c=()=>{r.style.display=`none`};document.getElementById(`btn-close-hub-details`).onclick=c,r.onclick=e=>{e.target===r&&c()},document.getElementById(`btn-import-agent`).onclick=async()=>{let r={...t,id:`agent_`+Date.now(),name:t.name+` (Imported)`,autonomy:`ask`},{AgentStore:i}=await e(async()=>{let{AgentStore:e}=await import(`./AgentStore-DURPF8Wv.js`);return{AgentStore:e}},[]);i.saveAgent(r);let{ToastManager:a}=await e(async()=>{let{ToastManager:e}=await import(`./ToastManager-Db86LBLx.js`).then(e=>e.n);return{ToastManager:e}},__vite__mapDeps([0,1,2]));a.success(`Agente importado forzosamente en modo Ask.`),c(),n&&n()};let l=document.getElementById(`btn-gh-discuss`);l&&(l.onclick=()=>{window.open(this.repoIssuesUrl+`/`+t.issue_number,`_blank`)})}};export{t as CommunityHub};