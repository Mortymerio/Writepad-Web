import { AgentStore } from '../core/AgentStore.js';
import { TOOL_REGISTRY } from '../core/AgentTools.js';
import { AgentOrchestrator } from '../core/AgentOrchestrator.js';
import { ToastManager } from './ToastManager.js';

export class AgentPanel {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.container = null;
    this.currentAgent = null;
    this.orchestrator = null;
  }

  render(container) {
    this.container = container;
    
    // Select first agent by default if none selected
    if (!this.currentAgent) {
      const agents = AgentStore.listAgents();
      if (agents.length > 0) this.currentAgent = agents[0];
    }
    
    this.updateView();
  }

  async updateView() {
    this.container.innerHTML = '';
    this.container.className = 'agent-panel';
    
    
    
    

    // Top: Title
    const title = document.createElement('div');
    title.className = 'agent-panel__header';
    
    const titleText = document.createElement('div');
    titleText.innerHTML = `🤖 <span>Agents (v2)</span>`;
    
    const btnCommunity = document.createElement('button');
    btnCommunity.innerHTML = this.viewMode === 'community' ? '🏠 Local' : '🌐 Hub';
    btnCommunity.title = 'Community Hub';
    btnCommunity.className = 'agent-panel__btn-community';
    btnCommunity.onclick = async () => {
      if (this.viewMode !== 'community') {
        const accepted = localStorage.getItem('community_disclaimer_accepted');
        if (!accepted) {
          const { CommunityDisclaimerModal } = await import('../ui/CommunityDisclaimerModal.js');
          CommunityDisclaimerModal.show(() => {
            this.viewMode = 'community';
            this.updateView();
          });
          return;
        }
        this.viewMode = 'community';
      } else {
        this.viewMode = 'local';
      }
      this.updateView();
    };

    const btnHelp = document.createElement('button');
    btnHelp.innerHTML = '📖 Guía';
    btnHelp.title = 'Guía de Agent-Fu y Ejemplos';
    btnHelp.className = 'agent-panel__btn-help';
    btnHelp.onclick = async () => {
      const { AgentGuideModal } = await import('../ui/AgentGuideModal.js');
      AgentGuideModal.show();
    };
    
    title.appendChild(titleText);
    title.appendChild(btnCommunity);
    title.appendChild(btnHelp);
    this.container.appendChild(title);

    // Middle: Content Container
    const listContainer = document.createElement('div');
    listContainer.className = 'agent-panel__list';
    
    if (this.viewMode === 'community') {
      const { CommunityHub } = await import('../ui/CommunityHub.js');
      CommunityHub.render(listContainer, () => {
        this.viewMode = 'local'; // switch back to local after importing
        this.updateView();
      });
      this.container.appendChild(listContainer);
      return; // Skip rendering local bottom container
    }

    
    
    
    
    const agents = AgentStore.listAgents();
    
    agents.forEach(agent => {
      const isSelected = this.currentAgent && this.currentAgent.id === agent.id;
      
      const card = document.createElement('div');
      card.className = 'agent-card';
      
      card.className = 'agent-card ' + (isSelected ? 'agent-card--active' : '');
      
      const header = document.createElement('div');
      header.className = 'agent-card__header';
      
      
      
      const titleArea = document.createElement('div');
      titleArea.className = 'agent-card__title-area';
      
      
      
      
      

      const name = document.createElement('strong');
      name.innerText = agent.name;
      name.className = 'agent-card__name ' + (isSelected ? 'agent-card__name--active' : '');
      
      const badge = document.createElement('span');
      badge.innerText = agent.autonomy;
      badge.className = `agent-card__badge agent-card__badge--${agent.autonomy}`;

        titleArea.appendChild(name);
        titleArea.appendChild(badge);
        
        const btnShare = document.createElement('button');
        btnShare.innerText = 'Share';
        btnShare.title = 'Copy Agent Configuration';
        btnShare.className = 'agent-panel__btn-share';
        btnShare.onclick = (e) => {
          e.stopPropagation();
          const { id, ...exportData } = agent; // don't export the ID to avoid collisions
          const str = btoa(encodeURIComponent(JSON.stringify(exportData)));
          navigator.clipboard.writeText(`agent://${str}`);
          import('../ui/ToastManager.js').then(m => m.ToastManager.success('Agent config copied to clipboard!'));
        };

        const btnPublish = document.createElement('button');
        btnPublish.innerText = '☁️ Publish';
        btnPublish.title = 'Publish to Community Hub';
        btnPublish.className = 'agent-panel__btn-publish';
        btnPublish.onclick = async (e) => {
          e.stopPropagation();
          const { PublishAgentModal } = await import('../ui/PublishAgentModal.js');
          PublishAgentModal.show(agent, async (desc) => {
            const { CommunityHub } = await import('../ui/CommunityHub.js');
            CommunityHub.publishAgent(agent, desc);
            const { ToastManager } = await import('../ui/ToastManager.js');
            ToastManager.success('Agente publicado en el Hub local exitosamente.');
          });
        };

        const btnEdit = document.createElement('button');
        btnEdit.innerText = 'Edit';
        btnEdit.className = 'agent-panel__btn-edit';
        btnEdit.onclick = async (e) => {
          e.stopPropagation();
          const { AgentEditorModal } = await import('./AgentEditorModal.js');
          AgentEditorModal.show(agent, 
            (updated) => { this.currentAgent = updated; this.updateView(); },
            () => { this.currentAgent = null; this.updateView(); }
          );
        };
        
        header.appendChild(titleArea);
        header.appendChild(btnShare);
        header.appendChild(btnPublish);
        header.appendChild(btnEdit);
        
        const desc = document.createElement('div');
      desc.className = 'agent-card__desc';
      
      
      const toolsStr = (agent.tools || []).join(', ');
      desc.innerHTML = `<div>${agent.model}</div><div style="margin-top:4px;">Tools: ${toolsStr}</div>`;

      card.appendChild(header);
      card.appendChild(desc);
      
      card.onclick = () => {
        this.currentAgent = agent;
        this.updateView();
      };

      listContainer.appendChild(card);
    });

    this.container.appendChild(listContainer);

    // Bottom: Execution / Edit Area
    const bottomContainer = document.createElement('div');
    bottomContainer.className = 'agent-panel__bottom';

    // Status / Logs Area (Hidden by default)
    const statusArea = document.createElement('div');
    statusArea.id = 'ag-status-area';
    statusArea.className = 'agent-panel__status';
    bottomContainer.appendChild(statusArea);

    if (this.currentAgent) {
      const input = document.createElement('textarea');
      input.id = 'ag-chat-input';
      input.placeholder = `Message to ${this.currentAgent.name}...`;
      input.value = this.currentAgent.initialPrompt || '';
      input.className = 'agent-panel__input';
      
      const btnRun = document.createElement('button');
      btnRun.id = 'btn-run-agent';
      btnRun.innerHTML = `▶ Run Agent`;
      btnRun.className = 'agent-panel__btn-run';
      
      const btnStop = document.createElement('button');
      btnStop.id = 'btn-stop-agent';
      btnStop.innerHTML = `⏹ Stop`;
      btnStop.className = 'agent-panel__btn-stop';

      bottomContainer.appendChild(input);
      bottomContainer.appendChild(btnRun);
      bottomContainer.appendChild(btnStop);

      const appendStatus = (html) => {
        statusArea.style.display = 'block';
        const d = document.createElement('div');
        d.style.marginBottom = '4px';
        d.innerHTML = html;
        statusArea.appendChild(d);
        statusArea.scrollTop = statusArea.scrollHeight;
      };

      btnStop.onclick = () => {
        if (this.orchestrator) {
          this.orchestrator.abort();
          appendStatus('<span style="color:#f85149;">Stopped by user.</span>');
          btnStop.style.display = 'none';
          btnRun.style.display = 'block';
          input.disabled = false;
        }
      };

      btnRun.onclick = async () => {
        const msg = input.value.trim();
        // Clear status
        statusArea.innerHTML = '';
        appendStatus(`<span style="color:#58a6ff;">▶ Starting ${this.currentAgent.name}...</span>`);
        
        input.disabled = true;
        btnRun.style.display = 'none';
        btnStop.style.display = 'block';

        this.orchestrator = new AgentOrchestrator(this.callbacks.getEditor());
        
        let currentChunkDiv = null;

        this.orchestrator.on('chunk', (data) => {
          if (!currentChunkDiv) {
            statusArea.style.display = 'block';
            currentChunkDiv = document.createElement('div');
            currentChunkDiv.className = 'agent-panel__chunk';
            statusArea.appendChild(currentChunkDiv);
          }
          currentChunkDiv.innerText += data.delta;
          statusArea.scrollTop = statusArea.scrollHeight;
        });

        this.orchestrator.on('tool_call', (tc) => {
          currentChunkDiv = null; // reset for next text block
          appendStatus(`⚙️ Requesting tool: <span style="color:#d29922;">${tc.name}</span>`);
          
          if (this.currentAgent.autonomy === 'ask') {
            const controls = document.createElement('div');
            controls.className = 'agent-panel__controls';
            controls.innerHTML = `<strong>Approve tool ${tc.name}?</strong><br><pre style="font-size:0.9em; margin:4px 0;">${JSON.stringify(tc.arguments, null, 2)}</pre>`;
            
            const btnApprove = document.createElement('button');
            btnApprove.innerText = 'Approve';
            btnApprove.className = 'agent-panel__btn-approve';
            btnApprove.onclick = () => { controls.style.display='none'; this.orchestrator.approveToolCall(tc.id, true); };
            
            const btnReject = document.createElement('button');
            btnReject.innerText = 'Reject';
            btnReject.className = 'agent-panel__btn-reject';
            btnReject.onclick = () => { controls.style.display='none'; this.orchestrator.approveToolCall(tc.id, false); };
            
            controls.appendChild(btnApprove);
            controls.appendChild(btnReject);
            statusArea.appendChild(controls);
            statusArea.scrollTop = statusArea.scrollHeight;
          }
        });

        this.orchestrator.on('tool_result', (res) => {
          currentChunkDiv = null;
          appendStatus(`🟢 Tool finished: ${res.name} ${res.error ? `(<span style="color:#f85149;">Error: ${res.error}</span>)` : ''}`);
        });

        this.orchestrator.on('error', (err) => {
          appendStatus(`<span style="color:#f85149;">🔴 Error: ${err.message}</span>`);
          cleanup();
        });

        this.orchestrator.on('done', (data) => {
          appendStatus(`<span style="color:#2ea043;">✅ Task complete.</span>`);
          cleanup();
        });

        const cleanup = () => {
          btnStop.style.display = 'none';
          btnRun.style.display = 'block';
          input.disabled = false;
        };

        try {
          // Provide an injection callback for subagents if they request it
          const context = {
             editor: this.callbacks.getEditor(),
             onSubagentToolCall: (subagentName, tc, subOrch) => {
                 currentChunkDiv = null;
                 appendStatus(`⚙️ <b>${subagentName}</b> requests tool: <span style="color:#d29922;">${tc.name}</span>`);
                 const controls = document.createElement('div');
                 controls.className = 'agent-panel__controls';
                 controls.innerHTML = `<strong>Approve tool ${tc.name} for sub-agent ${subagentName}?</strong><br><pre style="font-size:0.9em; margin:4px 0;">${JSON.stringify(tc.arguments, null, 2)}</pre>`;
                 
                 const btnApprove = document.createElement('button');
                 btnApprove.innerText = 'Approve';
                 btnApprove.className = 'agent-panel__btn-approve';
                 btnApprove.onclick = () => { controls.style.display='none'; subOrch.approveToolCall(tc.id, true); };
                 
                 const btnReject = document.createElement('button');
                 btnReject.innerText = 'Reject';
                 btnReject.className = 'agent-panel__btn-reject';
                 btnReject.onclick = () => { controls.style.display='none'; subOrch.approveToolCall(tc.id, false); };
                 
                 controls.appendChild(btnApprove);
                 controls.appendChild(btnReject);
                 statusArea.appendChild(controls);
                 statusArea.scrollTop = statusArea.scrollHeight;
             }
          };
          
          // Re-inject context support in AgentOrchestrator executeTool call:
          // In AgentOrchestrator: executeTool(toolCall.name, toolCall.arguments, this.context || {editor: this.editor});
          // Wait, AgentOrchestrator just passes {editor: this.editor}. We should patch it later or just pass it here.
          this.orchestrator.context = context;
          await this.orchestrator.run(this.currentAgent, msg);
        } catch (err) {
          // handled via events
        }
      };
    }

    const actionRow = document.createElement('div');
    actionRow.className = 'agent-panel__action-row';

    const btnNew = document.createElement('button');
    btnNew.innerText = '+ New Agent';
    btnNew.className = 'agent-panel__btn-new';
    btnNew.onclick = async () => {
      const { AgentEditorModal } = await import('./AgentEditorModal.js');
      AgentEditorModal.show(null, (newAgent) => {
        this.currentAgent = newAgent;
        this.updateView();
      });
    };

    const btnImport = document.createElement('button');
    btnImport.innerText = 'Import Agent';
    btnImport.className = 'agent-panel__btn-import';
    btnImport.onclick = async () => {
      const { ImportAgentModal } = await import('../ui/ImportAgentModal.js');
      ImportAgentModal.show((newAgent) => {
        this.updateView();
      });
    };

    actionRow.appendChild(btnNew);
    actionRow.appendChild(btnImport);
    bottomContainer.appendChild(actionRow);

    this.container.appendChild(bottomContainer);
  }
}
