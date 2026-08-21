export const CommunityHub = {
  registryUrl: "https://raw.githubusercontent.com/Mortymerio/Writepad-Web/master/public/agents_registry.json",
  repoApiUrl: "https://api.github.com/repos/Mortymerio/Writepad-Web",
  repoIssuesUrl: "https://github.com/Mortymerio/Writepad-Web/issues",

  async getRegistry() {
    try {
      const res = await fetch(this.registryUrl + "?t=" + Date.now());
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch (e) {
      console.warn("Fallo al leer de GitHub, usando fallback", e);
      const basePath = window.location.pathname.includes('/Writepad-Web') ? '/Writepad-Web/' : '/';
      const localRes = await fetch(basePath + 'agents_registry.json');
      return await localRes.json();
    }
  },

  publishAgent(agent, description) {
    const title = encodeURIComponent("[Agent Submission]: " + agent.name);
    const exportAgent = { ...agent };
    delete exportAgent.id;
    
    const body = encodeURIComponent(
      "### 🤖 Descripción del Agente\n" + description + "\n\n" +
      "### ⚙️ Agent JSON Payload\n```json\n" + JSON.stringify(exportAgent, null, 2) + "\n```\n"
    );

    const url = this.repoIssuesUrl + "/new?title=" + title + "&body=" + body + "&labels=agent-submission";
    window.open(url, '_blank');
  },

  async getIssueData(issueNumber) {
    if (!issueNumber) return { votes: 0, comments: 0 };
    try {
      const res = await fetch(this.repoApiUrl + "/issues/" + issueNumber);
      if (!res.ok) return { votes: 0, comments: 0 };
      const data = await res.json();
      return {
        votes: data.reactions ? data.reactions['+1'] : 0,
        comments: data.comments || 0
      };
    } catch (e) {
      return { votes: 0, comments: 0 };
    }
  },

  async render(container, onImport) {
    container.innerHTML = "";
    
    const header = document.createElement("div");
    header.style.cssText = "padding: 15px; border-bottom: 1px solid #30363d; background: #0d1117;";
    header.innerHTML = `
      <h3 style="margin: 0; color: #58a6ff; display: flex; align-items: center; gap: 8px;">
        🌐 Hub Comunitario (Oficial)
      </h3>
      <p style="margin: 5px 0 0 0; font-size: 0.85em; color: #8b949e;">
        Agentes verificados alojados en el repositorio oficial de GitHub.
      </p>
    `;
    container.appendChild(header);

    const list = document.createElement("div");
    list.style.cssText = "flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 15px;";
    container.appendChild(list);

    list.innerHTML = "<div style=\"padding:20px; color:#8b949e; text-align:center;\">Cargando agentes de GitHub...</div>";

    let registry = [];
    try {
      registry = await this.getRegistry();
    } catch(e) {
      list.innerHTML = "<div style=\"padding:20px; color:#f85149; text-align:center;\">Error al cargar el Hub. Asegurate de tener conexión.</div>";
      return;
    }
    
    list.innerHTML = "";

    for (const agent of registry) {
      const card = document.createElement("div");
      card.style.cssText = "background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 12px; display: flex; flex-direction: column; gap: 8px; cursor: pointer; transition: border-color 0.2s;";
      card.onmouseover = () => card.style.borderColor = "#8b949e";
      card.onmouseout = () => card.style.borderColor = "#30363d";

      const topRow = document.createElement("div");
      topRow.style.cssText = "display: flex; justify-content: space-between; align-items: center;";
      topRow.innerHTML = `
        <div style="font-weight: bold; color: #c9d1d9;">${agent.name} <span style="font-size:0.8em; font-weight:normal; color:#8b949e;">by @${agent.author}</span></div>
        <div style="font-size: 0.8em; background: rgba(56, 139, 253, 0.15); color: #58a6ff; padding: 2px 6px; border-radius: 10px;">${agent.model}</div>
      `;

      const desc = document.createElement("div");
      desc.style.cssText = "font-size: 0.9em; color: #c9d1d9;";
      desc.innerText = agent.description;

      const toolsDiv = document.createElement("div");
      toolsDiv.style.cssText = "display: flex; gap: 5px; flex-wrap: wrap;";
      (agent.tools || []).forEach(t => {
        const badge = document.createElement("span");
        badge.innerText = t;
        badge.style.cssText = "background: rgba(210, 168, 255, 0.1); color: #d2a8ff; border: 1px solid rgba(210, 168, 255, 0.4); padding: 2px 6px; border-radius: 10px; font-size: 0.7em; font-family: monospace;";
        toolsDiv.appendChild(badge);
      });

      card.appendChild(topRow);
      card.appendChild(desc);
      card.appendChild(toolsDiv);

      card.onclick = () => this.showAgentDetails(agent, onImport);
      list.appendChild(card);
    }
  },

  async showAgentDetails(agent, onImport) {
    let modal = document.getElementById('hub-details-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'hub-details-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content" style="width: 700px; max-width: 95vw; height: 85vh; background: #0d1117; border: 1px solid #444; border-radius: 8px; color: #c9d1d9; display: flex; justify-content: center; align-items: center;">
        <h3 style="color: #8b949e;">Conectando con GitHub...</h3>
      </div>
    `;

    const stats = await this.getIssueData(agent.issue_number);
    
    let toolsHtml = (agent.tools || []).map(t => `<span style="background: rgba(210, 168, 255, 0.1); color: #d2a8ff; border: 1px solid rgba(210, 168, 255, 0.4); padding: 4px 10px; border-radius: 12px; font-size: 0.85em; font-family: monospace;">${t}</span>`).join('');
    if (!toolsHtml) toolsHtml = '<span style="color:#8b949e; font-style:italic;">Ninguna</span>';

    const initialTaskHtml = agent.initialPrompt ? `
      <div>
        <h4 style="margin: 0 0 8px 0; color: #c9d1d9;">Initial Task</h4>
        <pre style="background: #161b22; padding: 15px; border-radius: 6px; border: 1px solid #30363d; white-space: pre-wrap; font-family: monospace; font-size: 0.9em; color: #7ee787;">${agent.initialPrompt}</pre>
      </div>
    ` : '';

    const discussHtml = agent.issue_number ? `
      <button id="btn-gh-discuss" style="padding: 10px 20px; background: #21262d; border: 1px solid #30363d; color: #c9d1d9; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">
         Abrir Hilo de Discusión (#${agent.issue_number})
      </button>
    ` : `
      <p style="color: #ff7b72; font-size: 0.9em;">Este agente oficial no tiene un hilo de discusión vinculado.</p>
    `;

    modal.innerHTML = `
      <div class="modal-content" style="width: 700px; max-width: 95vw; height: 85vh; background: #0d1117; border: 1px solid #444; border-radius: 8px; color: #c9d1d9; display: flex; flex-direction: column;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #30363d; background: #161b22; border-radius: 8px 8px 0 0;">
          <div>
            <h3 style="margin: 0; color: #58a6ff;">${agent.name}</h3>
            <span style="font-size: 0.85em; color: #8b949e;">by @${agent.author}</span>
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
              ${toolsHtml}
            </div>
          </div>

          <div>
            <h4 style="margin: 0 0 8px 0; color: #c9d1d9;">System Prompt</h4>
            <pre style="background: #161b22; padding: 15px; border-radius: 6px; border: 1px solid #30363d; white-space: pre-wrap; font-family: monospace; font-size: 0.9em; color: #a5d6ff;">${agent.systemPrompt}</pre>
          </div>

          ${initialTaskHtml}

          <div style="display: flex; gap: 10px;">
            <button id="btn-import-agent" style="flex: 2; padding: 10px; background: #238636; border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">
              ⬇️ Importar a Local (Forzar Ask)
            </button>
          </div>

          <hr style="border: none; border-top: 1px solid #30363d; width: 100%; margin: 10px 0;">

          <div>
            <h4 style="margin: 0 0 15px 0; color: #c9d1d9; display:flex; justify-content:space-between;">
              <span>Comunidad de GitHub</span>
              <span style="font-size:0.8em; color:#8b949e;">${stats.votes} 👍 | ${stats.comments} 💬</span>
            </h4>
            
            <div style="background: #161b22; padding: 20px; border-radius: 6px; border: 1px solid #30363d; text-align: center;">
              <p style="color: #8b949e; margin-bottom: 15px;">Los comentarios y votos se administran en el repositorio oficial de GitHub para garantizar la seguridad y evitar spam.</p>
              ${discussHtml}
            </div>
          </div>
        </div>
      </div>
    `;

    const close = () => { modal.style.display = 'none'; };
    document.getElementById('btn-close-hub-details').onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };

    document.getElementById('btn-import-agent').onclick = async () => {
      const newAgent = {
        ...agent,
        id: 'agent_' + Date.now(),
        name: agent.name + " (Imported)",
        autonomy: 'ask'
      };
      
      const { AgentStore } = await import('../core/AgentStore.js');
      AgentStore.saveAgent(newAgent);
      
      const { ToastManager } = await import('../ui/ToastManager.js');
      ToastManager.success('Agente importado forzosamente en modo Ask.');
      
      close();
      if (onImport) onImport();
    };

    const discussBtn = document.getElementById('btn-gh-discuss');
    if (discussBtn) {
      discussBtn.onmouseover = () => discussBtn.style.background = '#30363d';
      discussBtn.onmouseout = () => discussBtn.style.background = '#21262d';
      discussBtn.onclick = () => {
        window.open(this.repoIssuesUrl + "/" + agent.issue_number, '_blank');
      };
    }
  }
};
