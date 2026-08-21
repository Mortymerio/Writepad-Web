var e={show(e){let t=document.getElementById(`community-disclaimer-modal`);t||(t=document.createElement(`div`),t.id=`community-disclaimer-modal`,t.className=`modal-overlay`,t.style.display=`none`,t.innerHTML=`
        <div class="modal-content" style="width: 600px; max-width: 90vw; background: #1e1e1e; border: 1px solid #f85149; border-radius: 8px; color: #c9d1d9; display: flex; flex-direction: column; font-family: sans-serif; box-shadow: 0 0 20px rgba(248, 81, 73, 0.2);">
          <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f85149; background: rgba(248, 81, 73, 0.1); border-radius: 8px 8px 0 0;">
            <h3 style="margin: 0; font-size: 1.2em; color: #ff7b72;">⚠️ ADVERTENCIA DE SEGURIDAD EXTREMA</h3>
          </div>
          <div class="modal-body" style="padding: 20px; line-height: 1.6;">
            <p style="margin-top: 0; font-weight: bold; color: #ff7b72;">Estás a punto de entrar al Hub Comunitario de Agentes.</p>
            <p>Los agentes creados por la comunidad son poderosos y pueden contener <strong>Instrucciones Maliciosas (Prompt Injection)</strong> diseñadas para borrar tus archivos, filtrar información o ejecutar comandos en tu terminal.</p>
            <ul style="color: #8b949e; padding-left: 20px;">
              <li>Nosotros <strong>mostramos el System Prompt completo</strong> de cada agente. <strong style="color:#c9d1d9;">ES TU RESPONSABILIDAD LEERLO</strong> antes de importarlo.</li>
              <li>Cualquier agente descargado será forzado al modo <strong>"Ask" (Confirmación Manual)</strong> por seguridad. Nunca lo cambies a Full-Auto si no confías plenamente en el código.</li>
              <li>Las descargas se realizan <strong>bajo tu propio riesgo</strong>. El autor de este software no se hace responsable por daños causados por agentes de terceros.</li>
            </ul>
            <div style="margin-top: 25px; display: flex; justify-content: flex-end; gap: 10px;">
              <button id="btn-cancel-disclaimer" style="padding: 8px 16px; background: transparent; border: 1px solid #555; color: #c9d1d9; border-radius: 4px; cursor: pointer;">Cancelar</button>
              <button id="btn-accept-disclaimer" style="padding: 8px 16px; background: #da3633; border: none; color: white; border-radius: 4px; cursor: pointer; font-weight: bold;">He leído y asumo el riesgo</button>
            </div>
          </div>
        </div>
      `,document.body.appendChild(t),document.getElementById(`btn-cancel-disclaimer`).onclick=()=>{t.style.display=`none`},document.getElementById(`btn-accept-disclaimer`).onclick=()=>{localStorage.setItem(`community_disclaimer_accepted`,`true`),t.style.display=`none`,e&&e()}),t.style.display=`flex`}};export{e as CommunityDisclaimerModal};