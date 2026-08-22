import { AgentStore } from '../core/AgentStore.js';
import { TOOL_REGISTRY } from '../core/AgentTools.js';
import { ToastManager } from './ToastManager.js';

export const AgentEditorModal = {
  async show(agent, onSave, onDelete) {
    let modal = document.getElementById('agent-editor-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'agent-editor-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const a = agent || { name: 'New Agent', model: 'gemini-1.5-pro', systemPrompt: '', initialPrompt: '', tools: [], autonomy: 'ask' };
    const isNew = !a.id;

    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content hub-modal" style="width: 600px; height: auto; max-height: 90vh;">
        <div class="modal-header">
          <div>
            <h3>${isNew ? 'Create Agent' : 'Edit Agent'}</h3>
            <span class="text-muted">Configure the AI Agent parameters</span>
          </div>
          <button id="btn-close-editor" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body hub-modal__body" style="gap: 15px;">
          <div class="panel-group">
            <label class="panel-label">Agent Name</label>
            <input type="text" id="ag-name" value="${a.name}" class="panel-input" placeholder="e.g. Code Reviewer">
          </div>
          
          <div class="panel-group">
            <label class="panel-label">Model</label>
            <div style="display:flex; gap:5px; width:100%;">
              <select id="ag-model" class="panel-select" style="flex:1;">
                <option value="gemini-1.5-flash" ${a.model==='gemini-1.5-flash'?'selected':''}>gemini-1.5-flash</option>
                <option value="gemini-1.5-pro" ${a.model==='gemini-1.5-pro'?'selected':''}>gemini-1.5-pro</option>
                <option value="gemini-2.5-flash" ${a.model==='gemini-2.5-flash'?'selected':''}>gemini-2.5-flash</option>
                <option value="gemini-2.5-pro-exp" ${a.model==='gemini-2.5-pro-exp'?'selected':''}>gemini-2.5-pro-exp</option>
              </select>
              <button id="btn-refresh-models" title="Refresh API Models" class="panel-btn" style="padding: 0 12px;">🔄</button>
            </div>
          </div>
  
          <div class="panel-group">
            <label class="panel-label">System Prompt (Agent Role)</label>
            <textarea id="ag-prompt" class="panel-input panel-textarea" placeholder="You are an expert...">${a.systemPrompt || ''}</textarea>
          </div>
          
          <div class="panel-group">
            <label class="panel-label">Initial Task Prompt (Optional)</label>
            <textarea id="ag-initial" class="panel-input" style="resize:vertical; min-height: 40px;" placeholder="Automatically send this message to start...">${a.initialPrompt || ''}</textarea>
          </div>
  
          <div class="panel-group">
            <label class="panel-label">Autonomy Level</label>
            <select id="ag-auto" class="panel-select">
              <option value="ask" ${a.autonomy==='ask'?'selected':''}>Ask before each tool (Safe)</option>
              <option value="semi-auto" ${a.autonomy==='semi-auto'?'selected':''}>Semi-Auto</option>
              <option value="full-auto" ${a.autonomy==='full-auto'?'selected':''}>Full-Auto (Unattended)</option>
            </select>
          </div>
          
          <div class="panel-group">
            <label class="panel-label">Tools</label>
            <div id="ag-tools" class="panel-input" style="max-height:150px; overflow-y:auto; padding: 10px;">
              ${TOOL_REGISTRY.map(t => `
                <label style="display:block; margin-bottom:8px; font-size:0.9em; cursor: pointer;">
                  <input type="checkbox" value="${t.name}" ${(a.tools||[]).includes(t.name) ? 'checked' : ''} style="margin-right: 5px;"> 
                  <strong>${t.name}</strong> - <span class="text-muted">${t.description || ''}</span>
                </label>
              `).join('')}
            </div>
          </div>
          
          <div class="flex-row" style="margin-top: 10px;">
            <button id="btn-agent-save" class="hub-btn hub-btn--primary" style="flex:2;">💾 Save Agent</button>
            ${!isNew ? `<button id="btn-agent-delete" class="hub-btn" style="flex:1; background: var(--danger); color: white; border: none;">🗑️ Delete</button>` : ''}
            <button id="btn-agent-cancel" class="hub-btn hub-btn--secondary" style="flex:1;">Cancel</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { modal.style.display = 'none'; };
    
    document.getElementById('btn-close-editor').onclick = close;
    document.getElementById('btn-agent-cancel').onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };

    // Refresh Models
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

    // Save
    document.getElementById('btn-agent-save').onclick = () => {
      const name = document.getElementById('ag-name').value.trim();
      if (!name) return ToastManager.error('Agent Name is required');

      const model = document.getElementById('ag-model').value;
      const systemPrompt = document.getElementById('ag-prompt').value;
      const initialPrompt = document.getElementById('ag-initial').value;
      const autonomy = document.getElementById('ag-auto').value;
      
      const tools = Array.from(document.querySelectorAll('#ag-tools input:checked')).map(el => el.value);

      const updated = {
        ...a,
        id: a.id || 'agent_' + Date.now(),
        name, model, systemPrompt, initialPrompt, autonomy, tools
      };

      AgentStore.saveAgent(updated);
      ToastManager.success('Agent saved successfully.');
      close();
      if (onSave) onSave(updated);
    };

    // Delete
    const delBtn = document.getElementById('btn-agent-delete');
    if (delBtn) {
      delBtn.onclick = () => {
        if (confirm('Are you sure you want to delete this agent?')) {
          AgentStore.deleteAgent(a.id);
          ToastManager.success('Agent deleted.');
          close();
          if (onDelete) onDelete();
        }
      };
    }
  }
};
