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
    const exportAgent = { 
      ...agent,
      description: description || "Sin descripción",
      author: "GitHub User" // Se sobreescribirá en el Action
    };
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
    container.className = "hub-container";
    
    const header = document.createElement("div");
    header.className = "hub-header";
    header.innerHTML = `
      <div class="hub-header__top">
        <h3 class="hub-header__title">🌐 Hub Comunitario (Oficial)</h3>
      </div>
      <p style="margin: 0; font-size: 0.85em; color: var(--text-secondary);">
        Agentes verificados alojados en el repositorio oficial de GitHub.
      </p>
    `;
    container.appendChild(header);

    const list = document.createElement("div");
    list.className = "hub-list";
    container.appendChild(list);

    list.innerHTML = "<div class='hub-loading'>Cargando agentes de GitHub...</div>";

    let registry = [];
    try {
      registry = await this.getRegistry();
    } catch(e) {
      list.innerHTML = "<div class='hub-loading' style='color: var(--danger);'>Error al cargar el Hub. Asegurate de tener conexión.</div>";
      return;
    }
    
    list.innerHTML = "";

    for (const agent of registry) {
      const card = document.createElement("div");
      card.className = "hub-card";

      const topRow = document.createElement("div");
      topRow.className = "hub-card__header";
      topRow.innerHTML = `
        <div class="hub-card__name">${agent.name} <span class="hub-card__author">by @${agent.author}</span></div>
        <div class="hub-card__badge">${agent.model}</div>
      `;

      const desc = document.createElement("div");
      desc.className = "hub-card__desc";
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
      <div class="modal-content hub-modal">
        <h3>Conectando con GitHub...</h3>
      </div>
    `;

    const stats = await this.getIssueData(agent.issue_number);
    
    let toolsHtml = (agent.tools || []).map(t => `<span class="hub-tool-badge">${t}</span>`).join('');
    if (!toolsHtml) toolsHtml = '<span class="text-muted">Ninguna</span>';

    const initialTaskHtml = agent.initialPrompt ? `
      <div>
        <h4>Initial Task</h4>
        <pre class="hub-code-block">${agent.initialPrompt}</pre>
      </div>
    ` : '';

    const discussHtml = agent.issue_number ? `
      <button id="btn-gh-discuss" class="hub-btn hub-btn--secondary">
         Abrir Hilo de Discusión (#${agent.issue_number})
      </button>
    ` : `
      <p class="text-danger">Este agente oficial no tiene un hilo de discusión vinculado.</p>
    `;

    modal.innerHTML = `
      <div class="modal-content hub-modal">
        <div class="modal-header">
          <div>
            <h3>${agent.name}</h3>
            <span class="text-muted">by @${agent.author}</span>
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
              ${toolsHtml}
            </div>
          </div>

          <div>
            <h4>System Prompt</h4>
            <pre class="hub-code-block">${agent.systemPrompt}</pre>
          </div>

          ${initialTaskHtml}

          <div class="flex-row">
            <button id="btn-import-agent" class="hub-btn hub-btn--primary">
              ⬇️ Importar a Local (Forzar Ask)
            </button>
          </div>

          <hr class="hub-divider">

          <div>
            <h4 class="flex-between">
              <span>Comunidad de GitHub</span>
              <span class="text-muted">${stats.votes} 👍 | ${stats.comments} 💬</span>
            </h4>
            
            <div class="hub-discussion-box">
              <p class="text-muted">Los comentarios y votos se administran en el repositorio oficial de GitHub para garantizar la seguridad y evitar spam.</p>
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
      discussBtn.onclick = () => {
        window.open(this.repoIssuesUrl + "/" + agent.issue_number, '_blank');
      };
    }
  }
};
