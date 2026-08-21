const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/AgentStore-B4ncxzgk.js","assets/AgentPanel-RLAOG_PJ.js","assets/editor.api-D7OB3-Nf.js","assets/editor-DYpEHO_6.css","assets/preload-helper-8MtV_aQO.js","assets/ToastManager-Db86LBLx.js","assets/index-BdSrIbIc.js","assets/index-AJxxvGoq.css"])))=>i.map(i=>d[i]);
import{t as e}from"./preload-helper-8MtV_aQO.js";var t={defaultRegistry:[{id:`hub_architect_001`,name:`Vibecoder Architect`,author:`Mortymerio`,description:`Genera la estructura de un proyecto (SPECS.md, ROADMAP.md) a partir de una idea.`,systemPrompt:`Eres un Ingeniero de Software Senior especializado en desarrollo moderno y arquitectura de sistemas. Tu objetivo es leer la idea inicial del usuario y diseñar una estructura de proyecto robusta, generando especificaciones (SPECS.md) y una hoja de ruta (ROADMAP.md). Pide confirmación paso a paso.`,initialPrompt:`Paso 1: Analiza la pestaña actual. Paso 2: Genera los archivos de arquitectura.`,model:`gemini-1.5-pro`,tools:[`read_current_tab`,`create_document`],autonomy:`ask`},{id:`hub_security_002`,name:`Red Teamer (Auditor)`,author:`Anonymous`,description:`Audita tu código actual buscando vulnerabilidades OWASP.`,systemPrompt:`Eres un experto en ciberseguridad ofensiva (Red Team). Tu objetivo es auditar el código provisto, buscando vulnerabilidades como XSS, SQLi, LFI, etc. Escribe comentarios de advertencia en el código original sobre las líneas vulnerables.`,initialPrompt:`Revisa mi pestaña actual y anota las vulnerabilidades.`,model:`gemini-1.5-pro`,tools:[`read_current_tab`,`inject_to_editor`],autonomy:`ask`}],getRegistry(){let e=localStorage.getItem(`hub_registry`);return e?JSON.parse(e):this.defaultRegistry},publishAgent(e,t){let n=this.getRegistry();n.push({id:`hub_custom_`+Date.now(),name:e.name,author:`Local Developer`,description:t||`Agente subido desde el editor local.`,systemPrompt:e.systemPrompt,initialPrompt:e.initialPrompt,model:e.model,tools:e.tools,autonomy:`ask`}),localStorage.setItem(`hub_registry`,JSON.stringify(n))},getVotes(e){return parseInt(localStorage.getItem(`hub_votes_${e}`)||`0`)},setVote(e){let t=this.getVotes(e);localStorage.setItem(`hub_votes_${e}`,t+1)},getComments(e){let t=localStorage.getItem(`hub_comments_${e}`);return t?JSON.parse(t):[]},addComment(e,t,n){let r=this.getComments(e);r.push({author:t||`Anonymous`,text:n,date:new Date().toLocaleDateString()}),localStorage.setItem(`hub_comments_${e}`,JSON.stringify(r))},render(e,t){e.innerHTML=``;let n=document.createElement(`div`);n.style.cssText=`padding: 10px; background: rgba(88, 166, 255, 0.1); border-bottom: 1px solid #58a6ff; color: #58a6ff; font-weight: bold; text-align: center; border-radius: 4px;`,n.innerHTML=`Hub de Agentes (Local PoC)`,e.appendChild(n);let r=document.createElement(`div`);r.style.cssText=`flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 15px;`,this.getRegistry().forEach(e=>{let n=document.createElement(`div`);n.style.cssText=`background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 12px; display: flex; flex-direction: column; gap: 8px; cursor: pointer; transition: border-color 0.2s;`,n.onmouseover=()=>n.style.borderColor=`#8b949e`,n.onmouseout=()=>n.style.borderColor=`#30363d`;let i=document.createElement(`div`);i.style.cssText=`display: flex; justify-content: space-between; align-items: flex-start;`;let a=document.createElement(`div`);a.innerHTML=`<div style="font-weight: bold; color: #58a6ff; font-size: 1.1em;">${e.name}</div><div style="font-size: 0.8em; color: #8b949e;">by @${e.author}</div>`;let o=document.createElement(`div`);o.innerHTML=`Upvotes: ${this.getVotes(e.id)}`,o.style.cssText=`background: #2d333b; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; color: #c9d1d9;`,i.appendChild(a),i.appendChild(o);let s=document.createElement(`div`);s.style.cssText=`font-size: 0.9em; color: #c9d1d9;`,s.innerText=e.description;let c=document.createElement(`div`);c.style.cssText=`display: flex; gap: 5px; flex-wrap: wrap;`,e.tools.forEach(e=>{let t=document.createElement(`span`);t.innerText=e,t.style.cssText=`background: rgba(210, 168, 255, 0.1); color: #d2a8ff; border: 1px solid rgba(210, 168, 255, 0.4); padding: 2px 6px; border-radius: 10px; font-size: 0.7em; font-family: monospace;`,c.appendChild(t)}),n.appendChild(i),n.appendChild(s),n.appendChild(c),n.onclick=()=>this.showAgentDetails(e,t),r.appendChild(n)}),e.appendChild(r)},async showAgentDetails(t,n){let r=document.getElementById(`hub-details-modal`);r&&r.remove(),r=document.createElement(`div`),r.id=`hub-details-modal`,r.className=`modal-overlay`,r.innerHTML=`
      <div class="modal-content" style="width: 700px; max-width: 95vw; height: 85vh; background: #0d1117; border: 1px solid #444; border-radius: 8px; color: #c9d1d9; display: flex; flex-direction: column;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #30363d; background: #161b22; border-radius: 8px 8px 0 0;">
          <div>
            <h3 style="margin: 0; color: #58a6ff;">${t.name}</h3>
            <span style="font-size: 0.85em; color: #8b949e;">by @${t.author}</span>
          </div>
          <button id="btn-close-hub-details" style="background: transparent; border: none; color: #8b949e; font-size: 1.5em; cursor: pointer;">x</button>
        </div>
        
        <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px;">
          
          <div style="background: rgba(248, 81, 73, 0.1); border-left: 4px solid #f85149; padding: 10px; border-radius: 4px;">
            <strong style="color: #ff7b72;">Advertencia de Seguridad:</strong> Asegurese de que no contenga instrucciones maliciosas. Este agente se importara forzosamente en modo Ask.
          </div>

          <div>
            <h4 style="margin: 0 0 8px 0; color: #c9d1d9;">Herramientas (Permisos Solicitados)</h4>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${(t.tools||[]).map(e=>`<span style="background: rgba(210, 168, 255, 0.1); color: #d2a8ff; border: 1px solid rgba(210, 168, 255, 0.4); padding: 4px 10px; border-radius: 12px; font-size: 0.85em; font-family: monospace;">${e}</span>`).join(``)}
              ${!t.tools||t.tools.length===0?`<span style="color:#8b949e; font-style:italic;">Ninguna</span>`:``}
            </div>
          </div>

          <div>
            <h4 style="margin: 0 0 8px 0; color: #c9d1d9;">System Prompt</h4>
            <pre style="background: #161b22; padding: 15px; border-radius: 6px; border: 1px solid #30363d; white-space: pre-wrap; font-family: monospace; font-size: 0.9em; color: #a5d6ff;">${t.systemPrompt}</pre>
          </div>

          ${t.initialPrompt?`
          <div>
            <h4 style="margin: 0 0 8px 0; color: #c9d1d9;">Initial Task</h4>
            <pre style="background: #161b22; padding: 15px; border-radius: 6px; border: 1px solid #30363d; white-space: pre-wrap; font-family: monospace; font-size: 0.9em; color: #7ee787;">${t.initialPrompt}</pre>
          </div>
          `:``}

          <div style="display: flex; gap: 10px;">
            <button id="btn-upvote-agent" style="flex: 1; padding: 10px; background: #21262d; border: 1px solid #30363d; color: #c9d1d9; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">
              Votar Positivo (${this.getVotes(t.id)})
            </button>
            <button id="btn-import-agent" style="flex: 2; padding: 10px; background: #238636; border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">
              Importar a Local (Forzar Ask)
            </button>
          </div>

          <hr style="border: none; border-top: 1px solid #30363d; width: 100%; margin: 10px 0;">

          <div>
            <h4 style="margin: 0 0 15px 0; color: #c9d1d9;">Comentarios de la Comunidad</h4>
            <div id="hub-comments-list" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;"></div>
            
            <div style="background: #161b22; padding: 15px; border-radius: 6px; border: 1px solid #30363d;">
              <input type="text" id="hub-comment-author" placeholder="Tu nombre (opcional - enter para Anonymous)" style="width: 100%; padding: 8px; margin-bottom: 8px; background: #0d1117; border: 1px solid #30363d; color: #c9d1d9; border-radius: 4px; box-sizing: border-box;">
              <textarea id="hub-comment-text" placeholder="Escribe tu comentario aqui..." style="width: 100%; padding: 8px; background: #0d1117; border: 1px solid #30363d; color: #c9d1d9; border-radius: 4px; box-sizing: border-box; resize: vertical; min-height: 60px;"></textarea>
              <button id="btn-post-comment" style="margin-top: 8px; padding: 6px 15px; background: #1f6feb; border: none; color: white; border-radius: 4px; cursor: pointer; float: right;">Publicar</button>
              <div style="clear: both;"></div>
            </div>
          </div>

        </div>
      </div>
    `,document.body.appendChild(r);let i=()=>r.remove();document.getElementById(`btn-close-hub-details`).onclick=i,r.onclick=e=>{e.target===r&&i()},document.getElementById(`btn-import-agent`).onclick=async()=>{let r={...t,id:`agent_`+Date.now(),name:t.name+` (Imported)`,autonomy:`ask`},{AgentStore:a}=await e(async()=>{let{AgentStore:e}=await import(`./AgentStore-B4ncxzgk.js`);return{AgentStore:e}},__vite__mapDeps([0,1,2,3,4,5,6,7]));a.saveAgent(r);let{ToastManager:o}=await e(async()=>{let{ToastManager:e}=await import(`./ToastManager-Db86LBLx.js`).then(e=>e.n);return{ToastManager:e}},__vite__mapDeps([5,2,3]));o.success(`Agente importado forzosamente en modo Ask.`),i(),n&&n()};let a=document.getElementById(`btn-upvote-agent`);a.onclick=()=>{this.setVote(t.id),a.innerHTML=`Votar Positivo (${this.getVotes(t.id)})`,a.style.background=`#238636`,setTimeout(()=>a.style.background=`#21262d`,1e3)};let o=()=>{let e=document.getElementById(`hub-comments-list`);e.innerHTML=``;let n=this.getComments(t.id);if(n.length===0){e.innerHTML=`<div style='color: #8b949e; font-style: italic; font-size: 0.9em;'>Se el primero en comentar...</div>`;return}n.forEach(t=>{let n=document.createElement(`div`);n.style.cssText=`background: #21262d; border-radius: 6px; padding: 10px; font-size: 0.9em;`,n.innerHTML=`<div style="color: #8b949e; margin-bottom: 4px;"><strong>${t.author}</strong> - ${t.date}</div><div style="color: #c9d1d9; white-space: pre-wrap;">${t.text}</div>`,e.appendChild(n)})};o(),document.getElementById(`btn-post-comment`).onclick=()=>{let e=document.getElementById(`hub-comment-text`).value.trim();if(!e)return;let n=document.getElementById(`hub-comment-author`).value.trim();n||=`Anonymous`,this.addComment(t.id,n,e),document.getElementById(`hub-comment-text`).value=``,o()},r.style.display=`flex`}};export{t as CommunityHub};