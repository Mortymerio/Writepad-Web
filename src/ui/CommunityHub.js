export const CommunityHub = {
  // Base mock data
  defaultRegistry: [
    {
      id: "hub_architect_001",
      name: "Vibecoder Architect",
      author: "Mortymerio",
      description: "Genera la estructura de un proyecto (SPECS.md, ROADMAP.md) a partir de una idea.",
      systemPrompt: "Eres un Ingeniero de Software Senior especializado en desarrollo moderno y arquitectura de sistemas. Tu objetivo es leer la idea inicial del usuario y diseñar una estructura de proyecto robusta, generando especificaciones (SPECS.md) y una hoja de ruta (ROADMAP.md). Pide confirmación paso a paso.",
      initialPrompt: "Paso 1: Analiza la pestaña actual. Paso 2: Genera los archivos de arquitectura.",
      model: "gemini-1.5-pro",
      tools: ["read_current_tab", "create_document"],
      autonomy: "ask"
    },
    {
      id: "hub_security_002",
      name: "Red Teamer (Auditor)",
      author: "Anonymous",
      description: "Audita tu código actual buscando vulnerabilidades OWASP.",
      systemPrompt: "Eres un experto en ciberseguridad ofensiva (Red Team). Tu objetivo es auditar el código provisto, buscando vulnerabilidades como XSS, SQLi, LFI, etc. Escribe comentarios de advertencia en el código original sobre las líneas vulnerables.",
      initialPrompt: "Revisa mi pestaña actual y anota las vulnerabilidades.",
      model: "gemini-1.5-pro",
      tools: ["read_current_tab", "inject_to_editor"],
      autonomy: "ask"
    }
  ],

  getRegistry() {
    const data = localStorage.getItem('hub_registry');
    if (data) return JSON.parse(data);
    return this.defaultRegistry;
  },

  publishAgent(agent, description) {
    const registry = this.getRegistry();
    registry.push({
      id: "hub_custom_" + Date.now(),
      name: agent.name,
      author: "Local Developer",
      description: description || "Agente subido desde el editor local.",
      systemPrompt: agent.systemPrompt,
      initialPrompt: agent.initialPrompt,
      model: agent.model,
      tools: agent.tools,
      autonomy: "ask" // Always force ask in the hub display
    });
    localStorage.setItem('hub_registry', JSON.stringify(registry));
  },

  getVotes(hubId) {
    return parseInt(localStorage.getItem(`hub_votes_${hubId}`) || "0");
  },

  setVote(hubId) {
    const current = this.getVotes(hubId);
    localStorage.setItem(`hub_votes_${hubId}`, current + 1);
  },

  getComments(hubId) {
    const data = localStorage.getItem(`hub_comments_${hubId}`);
    return data ? JSON.parse(data) : [];
  },

  addComment(hubId, author, text) {
    const comments = this.getComments(hubId);
    comments.push({ author: author || "Anonymous", text, date: new Date().toLocaleDateString() });
    localStorage.setItem(`hub_comments_${hubId}`, JSON.stringify(comments));
  },

  render(container, onImport) {
    container.innerHTML = "";
    
    const header = document.createElement("div");
    header.style.cssText = "padding: 10px; background: rgba(88, 166, 255, 0.1); border-bottom: 1px solid #58a6ff; color: #58a6ff; font-weight: bold; text-align: center; border-radius: 4px;";
    header.innerHTML = "Hub de Agentes (Local PoC)";
    container.appendChild(header);

    const list = document.createElement("div");
    list.style.cssText = "flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 15px;";

    this.getRegistry().forEach(agent => {
      const card = document.createElement("div");
      card.style.cssText = "background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 12px; display: flex; flex-direction: column; gap: 8px; cursor: pointer; transition: border-color 0.2s;";
      card.onmouseover = () => card.style.borderColor = "#8b949e";
      card.onmouseout = () => card.style.borderColor = "#30363d";

      const topRow = document.createElement("div");
      topRow.style.cssText = "display: flex; justify-content: space-between; align-items: flex-start;";
      
      const title = document.createElement("div");
      title.innerHTML = `<div style="font-weight: bold; color: #58a6ff; font-size: 1.1em;">${agent.name}</div><div style="font-size: 0.8em; color: #8b949e;">by @${agent.author}</div>`;
      
      const votes = document.createElement("div");
      votes.innerHTML = `Upvotes: ${this.getVotes(agent.id)}`;
      votes.style.cssText = "background: #2d333b; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; color: #c9d1d9;";
      
      topRow.appendChild(title);
      topRow.appendChild(votes);
      
      const desc = document.createElement("div");
      desc.style.cssText = "font-size: 0.9em; color: #c9d1d9;";
      desc.innerText = agent.description;

      const toolsDiv = document.createElement("div");
      toolsDiv.style.cssText = "display: flex; gap: 5px; flex-wrap: wrap;";
      agent.tools.forEach(t => {
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
    });

    container.appendChild(list);
  },

  async showAgentDetails(agent, onImport) {
    let modal = document.getElementById('hub-details-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'hub-details-modal';
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
      <div class="modal-content" style="width: 700px; max-width: 95vw; height: 85vh; background: #0d1117; border: 1px solid #444; border-radius: 8px; color: #c9d1d9; display: flex; flex-direction: column;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #30363d; background: #161b22; border-radius: 8px 8px 0 0;">
          <div>
            <h3 style="margin: 0; color: #58a6ff;">${agent.name}</h3>
            <span style="font-size: 0.85em; color: #8b949e;">by @${agent.author}</span>
          </div>
          <button id="btn-close-hub-details" style="background: transparent; border: none; color: #8b949e; font-size: 1.5em; cursor: pointer;">x</button>
        </div>
        
        <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px;">
          
          <div style="background: rgba(248, 81, 73, 0.1); border-left: 4px solid #f85149; padding: 10px; border-radius: 4px;">
            <strong style="color: #ff7b72;">Advertencia de Seguridad:</strong> Asegurese de que no contenga instrucciones maliciosas. Este agente se importara forzosamente en modo Ask.
          </div>

          <div>
            <h4 style="margin: 0 0 8px 0; color: #c9d1d9;">System Prompt</h4>
            <pre style="background: #161b22; padding: 15px; border-radius: 6px; border: 1px solid #30363d; white-space: pre-wrap; font-family: monospace; font-size: 0.9em; color: #a5d6ff;">${agent.systemPrompt}</pre>
          </div>

          ${agent.initialPrompt ? `
          <div>
            <h4 style="margin: 0 0 8px 0; color: #c9d1d9;">Initial Task</h4>
            <pre style="background: #161b22; padding: 15px; border-radius: 6px; border: 1px solid #30363d; white-space: pre-wrap; font-family: monospace; font-size: 0.9em; color: #7ee787;">${agent.initialPrompt}</pre>
          </div>
          ` : ''}

          <div style="display: flex; gap: 10px;">
            <button id="btn-upvote-agent" style="flex: 1; padding: 10px; background: #21262d; border: 1px solid #30363d; color: #c9d1d9; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">
              Votar Positivo (${this.getVotes(agent.id)})
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
    `;
    
    document.body.appendChild(modal);

    const close = () => modal.remove();
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

    const btnUpvote = document.getElementById('btn-upvote-agent');
    btnUpvote.onclick = () => {
      this.setVote(agent.id);
      btnUpvote.innerHTML = `Votar Positivo (${this.getVotes(agent.id)})`;
      btnUpvote.style.background = "#238636";
      setTimeout(() => btnUpvote.style.background = "#21262d", 1000);
    };

    const renderComments = () => {
      const listDiv = document.getElementById('hub-comments-list');
      listDiv.innerHTML = "";
      const comments = this.getComments(agent.id);
      
      if (comments.length === 0) {
        listDiv.innerHTML = "<div style='color: #8b949e; font-style: italic; font-size: 0.9em;'>Se el primero en comentar...</div>";
        return;
      }
      
      comments.forEach(c => {
        const cdiv = document.createElement('div');
        cdiv.style.cssText = "background: #21262d; border-radius: 6px; padding: 10px; font-size: 0.9em;";
        cdiv.innerHTML = `<div style="color: #8b949e; margin-bottom: 4px;"><strong>${c.author}</strong> - ${c.date}</div><div style="color: #c9d1d9; white-space: pre-wrap;">${c.text}</div>`;
        listDiv.appendChild(cdiv);
      });
    };
    
    renderComments();

    document.getElementById('btn-post-comment').onclick = () => {
      const text = document.getElementById('hub-comment-text').value.trim();
      if (!text) return;
      let author = document.getElementById('hub-comment-author').value.trim();
      if (!author) author = "Anonymous";
      
      this.addComment(agent.id, author, text);
      document.getElementById('hub-comment-text').value = "";
      renderComments();
    };

    modal.style.display = 'flex';
  }
};
