export const ImportAgentModal = {
  show(onImportSuccess) {
    let modal = document.getElementById('import-agent-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'import-agent-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content" style="width: 600px; max-width: 90vw; background: #1e1e1e; border: 1px solid #444; border-radius: 8px; color: #c9d1d9; display: flex; flex-direction: column; font-family: sans-serif;">
          <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #444; background: #2d333b; border-radius: 8px 8px 0 0;">
            <h3 style="margin: 0; font-size: 1.2em; color: #58a6ff;">🤖 Importar Agente (Agent-Fu)</h3>
            <button id="btn-close-import" style="background: transparent; border: none; color: #8b949e; font-size: 1.5em; cursor: pointer;">&times;</button>
          </div>
          <div class="modal-body" style="padding: 20px; line-height: 1.6;">
            <p style="margin-top: 0;">Los agentes son entidades de Inteligencia Artificial configuradas con <strong>Prompts</strong>, <strong>Modelos</strong> y <strong>Herramientas (Tools)</strong> específicas.</p>
            <p>Al importar un agente, estás clonando su <em>"ADN"</em> exacto. Esto incluye:</p>
            <ul style="color: #8b949e; padding-left: 20px;">
              <li>El <strong>System Prompt</strong> (la personalidad y reglas base del agente).</li>
              <li>El <strong>Initial Prompt</strong> (las instrucciones que ejecuta al arrancar).</li>
              <li>Las <strong>Herramientas</strong> que tiene permitidas usar (acceso a disco, terminal, etc).</li>
              <li>Su nivel de autonomía (Full-Auto, Ask, etc).</li>
            </ul>
            <div style="margin-top: 20px;">
              <label for="agent-import-string" style="display: block; margin-bottom: 8px; font-weight: bold;">Pega aquí el código del Agente (agent://...):</label>
              <textarea id="agent-import-string" style="width: 100%; box-sizing: border-box; height: 100px; background: #0d1117; color: #58a6ff; border: 1px solid #555; border-radius: 4px; padding: 10px; font-family: monospace; resize: vertical;" placeholder="agent://eyJpZCI6..."></textarea>
            </div>
            <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
              <button id="btn-cancel-import" style="padding: 8px 16px; background: transparent; border: 1px solid #555; color: #c9d1d9; border-radius: 4px; cursor: pointer;">Cancelar</button>
              <button id="btn-confirm-import" style="padding: 8px 16px; background: #2ea043; border: none; color: white; border-radius: 4px; cursor: pointer; font-weight: bold;">Importar Agente</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const close = () => { modal.style.display = 'none'; };
      document.getElementById('btn-close-import').onclick = close;
      document.getElementById('btn-cancel-import').onclick = close;
      
      modal.onclick = (e) => { if (e.target === modal) close(); };

      document.getElementById('btn-confirm-import').onclick = async () => {
        const str = document.getElementById('agent-import-string').value.trim();
        if (!str) return;
        try {
          const b64 = str.replace('agent://', '');
          const data = JSON.parse(decodeURIComponent(atob(b64)));
          if (!data.name || !data.systemPrompt) throw new Error('Formato inválido');
          const newAgent = { ...data, id: 'agent_' + Date.now() };
          const { AgentStore } = await import('../core/AgentStore.js');
          AgentStore.saveAgent(newAgent);
          const { ToastManager } = await import('../ui/ToastManager.js');
          ToastManager.success('Agente importado correctamente! 🚀');
          close();
          if (onImportSuccess) onImportSuccess(newAgent);
        } catch(e) {
          const { ToastManager } = await import('../ui/ToastManager.js');
          ToastManager.error('El código del agente es inválido o está corrupto.');
        }
      };
    }
    document.getElementById('agent-import-string').value = '';
    modal.style.display = 'flex';
  }
};

