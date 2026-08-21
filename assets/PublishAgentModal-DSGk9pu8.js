var e={show(e,t){let n=document.getElementById(`publish-agent-modal`);if(!n){n=document.createElement(`div`),n.id=`publish-agent-modal`,n.className=`modal-overlay`,n.style.display=`none`,n.innerHTML=`
        <div class="modal-content" style="width: 500px; max-width: 90vw; background: #1e1e1e; border: 1px solid #444; border-radius: 8px; color: #c9d1d9; display: flex; flex-direction: column; font-family: sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
          <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #444; background: #2d333b; border-radius: 8px 8px 0 0;">
            <h3 style="margin: 0; font-size: 1.1em; color: #58a6ff;">☁️ Publicar en el Hub Comunitario</h3>
            <button id="btn-close-publish-modal" style="background: transparent; border: none; color: #8b949e; font-size: 1.5em; cursor: pointer;">&times;</button>
          </div>
          <div class="modal-body" style="padding: 20px; display: flex; flex-direction: column; gap: 15px;">
            <div>
              <div style="margin-bottom: 8px; font-weight: bold; color: #c9d1d9;">Agente a publicar: <span style="color: #3fb950;">${e.name}</span></div>
              <div style="font-size: 0.85em; color: #8b949e;">Comparte tu agente con el resto del equipo. Escribe una descripción clara para que sepan de qué es capaz.</div>
            </div>
            
            <textarea id="publish-agent-desc" placeholder="Describe brevemente para qué sirve tu agente..." style="width: 100%; height: 100px; padding: 10px; background: #0d1117; border: 1px solid #30363d; color: #c9d1d9; border-radius: 6px; box-sizing: border-box; resize: vertical; font-family: inherit; font-size: 0.95em;"></textarea>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 5px;">
              <button id="btn-cancel-publish" style="padding: 8px 16px; background: transparent; border: 1px solid #555; color: #c9d1d9; border-radius: 6px; cursor: pointer;">Cancelar</button>
              <button id="btn-confirm-publish" style="padding: 8px 16px; background: #238636; border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: bold;">☁️ Publicar</button>
            </div>
          </div>
        </div>
      `,document.body.appendChild(n);let t=()=>{n.style.display=`none`};document.getElementById(`btn-close-publish-modal`).onclick=t,document.getElementById(`btn-cancel-publish`).onclick=t,n.onclick=e=>{e.target===n&&t()}}let r=document.getElementById(`publish-agent-desc`);r.value=e.description||``;let i=document.getElementById(`btn-confirm-publish`),a=i.cloneNode(!0);i.parentNode.replaceChild(a,i),a.onclick=()=>{let e=r.value.trim();n.style.display=`none`,t&&t(e)},n.style.display=`flex`,setTimeout(()=>r.focus(),100)}};export{e as PublishAgentModal};