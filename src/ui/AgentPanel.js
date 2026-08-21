import { AgentStore } from '../core/AgentStore.js';
import { TOOL_REGISTRY } from '../core/AgentTools.js';
import { AgentOrchestrator } from '../core/AgentOrchestrator.js';
import { ToastManager } from './ToastManager.js';

export class AgentPanel {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.container = null;
    this.currentAgent = null;
    this.isEditing = false;
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

  updateView() {
    this.container.innerHTML = '';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.height = '100%';
    this.container.style.backgroundColor = '#2d333b';
    this.container.style.color = '#c9d1d9';

    // Top: Title
    const title = document.createElement('div');
    title.style.cssText = 'padding:10px; font-weight:bold; border-bottom:1px solid #444; flex-shrink:0; display:flex; align-items:center; gap:8px;';
    
    const titleText = document.createElement('div');
    titleText.innerHTML = `🤖 <span>Agents (v2)</span>`;
    
    const btnHelp = document.createElement('button');
    btnHelp.innerHTML = '📖 Guía';
    btnHelp.title = 'Guía de Agent-Fu y Ejemplos';
    btnHelp.style.cssText = 'background:transparent; border:1px solid #444; color:#58a6ff; border-radius:4px; padding:2px 8px; cursor:pointer; margin-left:auto; font-size:0.85em; font-weight:normal; display:flex; align-items:center; gap:4px;';
    btnHelp.onclick = async () => {
      const { AgentGuideModal } = await import('../ui/AgentGuideModal.js');
      AgentGuideModal.show();
    };
    
    title.appendChild(titleText);
    title.appendChild(btnHelp);
    this.container.appendChild(title);

    // Middle: Agent List
    const listContainer = document.createElement('div');
    listContainer.style.cssText = 'flex:1; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:10px;';
    
    const agents = AgentStore.listAgents();
    
    agents.forEach(agent => {
      const isSelected = this.currentAgent && this.currentAgent.id === agent.id;
      
      const card = document.createElement('div');
      card.className = 'agent-card';
      const baseStyle = 'border-radius:6px; padding:10px; cursor:pointer; display:flex; flex-direction:column; gap:5px; box-sizing:border-box; width:100%; ';
      card.style.cssText = baseStyle + (isSelected 
        ? 'background-color:rgba(12, 122, 203, 0.2); border:1px solid #0c7acb;' 
        : 'background-color:#373e47; border:1px solid #444;');
      
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.alignItems = 'flex-start';
      header.style.width = '100%';
      
      const titleArea = document.createElement('div');
      titleArea.style.display = 'flex';
      titleArea.style.alignItems = 'center';
      titleArea.style.gap = '8px';
      titleArea.style.flexWrap = 'wrap';
      titleArea.style.flex = '1';
      titleArea.style.minWidth = '0'; // Prevent flex overflow

      const name = document.createElement('strong');
      name.innerText = agent.name;
      name.style.color = isSelected ? '#58a6ff' : '#c9d1d9';
      
      const badge = document.createElement('span');
      badge.innerText = agent.autonomy;
      badge.style.cssText = `font-size:0.7em; padding:2px 6px; border-radius:10px; font-weight:bold; white-space:nowrap; ${
        agent.autonomy === 'full-auto' ? 'background:#2ea043; color:white;' : 
        agent.autonomy === 'semi-auto' ? 'background:#d29922; color:white;' : 
        'background:#f85149; color:white;'
      }`;

        titleArea.appendChild(name);
        titleArea.appendChild(badge);
        
        const btnShare = document.createElement('button');
        btnShare.innerText = 'Share';
        btnShare.title = 'Copy Agent Configuration';
        btnShare.style.cssText = 'padding:2px 8px; font-size:0.8em; background:transparent; border:1px solid #555; color:#c9d1d9; border-radius:4px; cursor:pointer; flex-shrink:0; margin-left:auto; margin-right:4px;';
        btnShare.onclick = (e) => {
          e.stopPropagation();
          const { id, ...exportData } = agent; // don't export the ID to avoid collisions
          const str = btoa(encodeURIComponent(JSON.stringify(exportData)));
          navigator.clipboard.writeText(`agent://${str}`);
          import('../ui/ToastManager.js').then(m => m.ToastManager.success('Agent config copied to clipboard!'));
        };

        const btnEdit = document.createElement('button');
        btnEdit.innerText = 'Edit';
        btnEdit.style.cssText = 'padding:2px 8px; font-size:0.8em; background:transparent; border:1px solid #555; color:#c9d1d9; border-radius:4px; cursor:pointer; flex-shrink:0;';
        btnEdit.onclick = (e) => {
          e.stopPropagation();
          this.currentAgent = agent;
          this.isEditing = true;
          this.updateView();
        };
        
        header.appendChild(titleArea);
        header.appendChild(btnShare);
        header.appendChild(btnEdit);
        
        const desc = document.createElement('div');
      desc.style.fontSize = '0.85em';
      desc.style.color = '#8b949e';
      
      const toolsStr = (agent.tools || []).join(', ');
      desc.innerHTML = `<div>${agent.model}</div><div style="margin-top:4px;">Tools: ${toolsStr}</div>`;

      card.appendChild(header);
      card.appendChild(desc);
      
      card.onclick = () => {
        this.currentAgent = agent;
        this.isEditing = false;
        this.updateView();
      };

      listContainer.appendChild(card);
    });

    this.container.appendChild(listContainer);

    // Bottom: Execution / Edit Area
    const bottomContainer = document.createElement('div');
    bottomContainer.style.cssText = 'flex-shrink:0; padding:10px; border-top:1px solid #444; background:#2d333b; display:flex; flex-direction:column; gap:8px;';

    // Status / Logs Area (Hidden by default)
    const statusArea = document.createElement('div');
    statusArea.id = 'ag-status-area';
    statusArea.style.cssText = 'display:none; max-height:200px; overflow-y:auto; font-size:0.85em; background:#1e1e1e; padding:8px; border-radius:4px; color:#aaa; font-family:monospace; margin-bottom:5px;';
    bottomContainer.appendChild(statusArea);

    if (this.currentAgent) {
      const input = document.createElement('textarea');
      input.id = 'ag-chat-input';
      input.placeholder = `Message to ${this.currentAgent.name}...`;
      input.value = this.currentAgent.initialPrompt || '';
      input.style.cssText = 'width:100%; box-sizing:border-box; height:60px; background:#222; color:#c9d1d9; border:1px solid #444; border-radius:4px; padding:8px; resize:none; font-family:inherit;';
      
      const btnRun = document.createElement('button');
      btnRun.id = 'btn-run-agent';
      btnRun.innerHTML = `▶ Run Agent`;
      btnRun.style.cssText = 'width:100%; box-sizing:border-box; padding:8px; background:#0c7acb; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;';
      
      const btnStop = document.createElement('button');
      btnStop.id = 'btn-stop-agent';
      btnStop.innerHTML = `⏹ Stop`;
      btnStop.style.cssText = 'width:100%; box-sizing:border-box; padding:8px; background:#f85149; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold; display:none;';

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
            currentChunkDiv.style.cssText = 'color:#c9d1d9; margin:5px 0; font-family:sans-serif; font-size:0.95em; white-space:pre-wrap; border-left:2px solid #58a6ff; padding-left:8px;';
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
            controls.style.cssText = 'margin-top:4px; padding:4px; background:rgba(210,153,34,0.1); border:1px solid #d29922; border-radius:4px;';
            controls.innerHTML = `<strong>Approve tool ${tc.name}?</strong><br><pre style="font-size:0.9em; margin:4px 0;">${JSON.stringify(tc.arguments, null, 2)}</pre>`;
            
            const btnApprove = document.createElement('button');
            btnApprove.innerText = 'Approve';
            btnApprove.style.cssText = 'padding:2px 8px; background:#2ea043; color:white; border:none; border-radius:4px; margin-right:5px; cursor:pointer;';
            btnApprove.onclick = () => { controls.style.display='none'; this.orchestrator.approveToolCall(tc.id, true); };
            
            const btnReject = document.createElement('button');
            btnReject.innerText = 'Reject';
            btnReject.style.cssText = 'padding:2px 8px; background:#f85149; color:white; border:none; border-radius:4px; cursor:pointer;';
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
                 controls.style.cssText = 'margin-top:4px; padding:4px; background:rgba(210,153,34,0.1); border:1px solid #d29922; border-radius:4px;';
                 controls.innerHTML = `<strong>Approve tool ${tc.name} for sub-agent ${subagentName}?</strong><br><pre style="font-size:0.9em; margin:4px 0;">${JSON.stringify(tc.arguments, null, 2)}</pre>`;
                 
                 const btnApprove = document.createElement('button');
                 btnApprove.innerText = 'Approve';
                 btnApprove.style.cssText = 'padding:2px 8px; background:#2ea043; color:white; border:none; border-radius:4px; margin-right:5px; cursor:pointer;';
                 btnApprove.onclick = () => { controls.style.display='none'; subOrch.approveToolCall(tc.id, true); };
                 
                 const btnReject = document.createElement('button');
                 btnReject.innerText = 'Reject';
                 btnReject.style.cssText = 'padding:2px 8px; background:#f85149; color:white; border:none; border-radius:4px; cursor:pointer;';
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

    if (this.isEditing && this.currentAgent) {
      const a = this.currentAgent;
      
      const btnCancel = document.createElement('button');
      btnCancel.innerText = '✕ Cancel';
      btnCancel.style.cssText = 'width:100%; box-sizing:border-box; padding:6px; background:transparent; border:1px solid #555; color:#c9d1d9; border-radius:4px; cursor:pointer;';
      btnCancel.onclick = () => { this.isEditing = false; this.updateView(); };
      bottomContainer.appendChild(btnCancel);

      const editForm = document.createElement('div');
      editForm.style.cssText = 'display:flex; flex-direction:column; gap:8px; margin-top:10px; background:#222; padding:10px; border-radius:6px; border:1px solid #444; box-sizing:border-box; width:100%;';
      
      editForm.innerHTML = `
        <input type="text" id="ag-name" value="${a.name}" placeholder="Agent Name" style="width:100%; box-sizing:border-box; background:#0d1117; color:white; border:1px solid #444; padding:6px; border-radius:4px;">
        
        <div style="display:flex; gap:5px; width:100%;">
          <select id="ag-model" style="flex:1; box-sizing:border-box; background:#0d1117; color:white; border:1px solid #444; padding:6px; border-radius:4px;">
            <option value="gemini-1.5-flash" ${a.model==='gemini-1.5-flash'?'selected':''}>gemini-1.5-flash</option>
            <option value="gemini-1.5-pro" ${a.model==='gemini-1.5-pro'?'selected':''}>gemini-1.5-pro</option>
            <option value="gemini-2.5-flash" ${a.model==='gemini-2.5-flash'?'selected':''}>gemini-2.5-flash</option>
            <option value="gemini-2.5-pro-exp" ${a.model==='gemini-2.5-pro-exp'?'selected':''}>gemini-2.5-pro-exp</option>
          </select>
          <button id="btn-refresh-models" title="Refresh API Models" style="padding:0 8px; background:#0d1117; color:#c9d1d9; border:1px solid #444; border-radius:4px; cursor:pointer;">🔄</button>
        </div>

        <textarea id="ag-prompt" placeholder="System Prompt (Agent Role)" style="width:100%; box-sizing:border-box; height:80px; background:#0d1117; color:white; border:1px solid #444; padding:6px; border-radius:4px; resize:vertical;">${a.systemPrompt || ''}</textarea>
        
        <textarea id="ag-initial" placeholder="Initial Task Prompt (Pre-configured task)" style="width:100%; box-sizing:border-box; height:40px; background:#0d1117; color:white; border:1px solid #444; padding:6px; border-radius:4px; resize:vertical;">${a.initialPrompt || ''}</textarea>

        <select id="ag-auto" style="width:100%; box-sizing:border-box; background:#0d1117; color:white; border:1px solid #444; padding:6px; border-radius:4px;">
          <option value="ask" ${a.autonomy==='ask'?'selected':''}>Ask before each tool</option>
          <option value="semi-auto" ${a.autonomy==='semi-auto'?'selected':''}>Semi-Auto</option>
          <option value="full-auto" ${a.autonomy==='full-auto'?'selected':''}>Full-Auto</option>
        </select>
        
        <div style="font-size:0.85em; color:#888;">Tools:</div>
        <div id="ag-tools" style="max-height:100px; overflow-y:auto; border:1px solid #444; padding:5px; background:#0d1117; border-radius:4px; box-sizing:border-box; width:100%;">
          ${TOOL_REGISTRY.map(t => `
            <label style="display:block; margin-bottom:5px; font-size:0.9em;">
              <input type="checkbox" value="${t.name}" ${(a.tools||[]).includes(t.name) ? 'checked' : ''}> ${t.name}
            </label>
          `).join('')}
        </div>
        
        <div style="display:flex; gap:10px; margin-top:5px; width:100%; box-sizing:border-box;">
          <button id="btn-agent-save" style="flex:1; padding:6px; background:#2ea043; color:white; border:none; border-radius:4px; cursor:pointer;">Save Agent</button>
          ${a.id ? `<button id="btn-agent-delete" style="flex:1; padding:6px; background:#8b0000; color:white; border:none; border-radius:4px; cursor:pointer;">Delete</button>` : ''}
        </div>
      `;

      bottomContainer.appendChild(editForm);

      setTimeout(() => {
        const btnRefresh = document.getElementById('btn-refresh-models');
        if (btnRefresh) {
          btnRefresh.onclick = async () => {
            btnRefresh.innerText = '⏳';
            try {
              const AIService = (await import('../aiService.js')).AIService;
              const apiKey = AIService.getApiKey();
              if (!apiKey) throw new Error('API Key missing');
              
              const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
              const data = await res.json();
              if (data.models) {
                const select = document.getElementById('ag-model');
                select.innerHTML = '';
                data.models.filter(m => m.name.includes('gemini')).forEach(m => {
                  const val = m.name.replace('models/', '');
                  const opt = document.createElement('option');
                  opt.value = val;
                  opt.innerText = val;
                  if (val === a.model) opt.selected = true;
                  select.appendChild(opt);
                });
                ToastManager.success('Models refreshed.');
              }
            } catch (e) {
              ToastManager.error('Failed to fetch models');
            } finally {
              btnRefresh.innerText = '🔄';
            }
          };
        }
        document.getElementById('btn-agent-save').onclick = () => {
          const tools = Array.from(document.querySelectorAll('#ag-tools input:checked')).map(cb => cb.value);
          const updated = {
            id: a.id,
            name: document.getElementById('ag-name').value,
            model: document.getElementById('ag-model').value,
            autonomy: document.getElementById('ag-auto').value,
            systemPrompt: document.getElementById('ag-prompt').value,
            initialPrompt: document.getElementById('ag-initial').value,
            tools: tools
          };
          AgentStore.saveAgent(updated);
          ToastManager.success('Agent saved.');
          this.isEditing = false;
          this.currentAgent = updated;
          this.updateView();
        };

        const delBtn = document.getElementById('btn-agent-delete');
        if (delBtn) {
          delBtn.onclick = () => {
            AgentStore.deleteAgent(a.id);
            ToastManager.success('Agent deleted.');
            this.isEditing = false;
            this.currentAgent = null;
            this.updateView();
          };
        }
      }, 0);
    } else {
        const actionRow = document.createElement('div');
        actionRow.style.cssText = 'display:flex; gap:8px; margin-top:8px; width:100%; box-sizing:border-box;';

        const btnNew = document.createElement('button');
        btnNew.innerText = '+ New Agent';
        btnNew.style.cssText = 'flex:1; padding:8px; background:transparent; border:1px solid #555; color:#c9d1d9; border-radius:4px; cursor:pointer;';
        btnNew.onclick = () => {
          this.currentAgent = { name: 'New Agent', model: 'gemini-1.5-pro', systemPrompt: '', initialPrompt: '', tools: [], autonomy: 'ask' };
          this.isEditing = true;
          this.updateView();
        };

        const btnImport = document.createElement('button');
        btnImport.innerText = 'Import Agent';
        btnImport.style.cssText = 'flex:1; padding:8px; background:transparent; border:1px solid #555; color:#c9d1d9; border-radius:4px; cursor:pointer;';
        btnImport.onclick = async () => {
          const { ImportAgentModal } = await import('../ui/ImportAgentModal.js');
          ImportAgentModal.show((newAgent) => {
            this.updateView();
          });
        };

        actionRow.appendChild(btnNew);
        actionRow.appendChild(btnImport);
        bottomContainer.appendChild(actionRow);
    }

    this.container.appendChild(bottomContainer);
  }
}
