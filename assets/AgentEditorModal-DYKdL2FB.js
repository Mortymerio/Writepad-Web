const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-C-BDtW-d.js","assets/editor.api-D7OB3-Nf.js","assets/editor-DYpEHO_6.css","assets/preload-helper-8MtV_aQO.js","assets/ToastManager-Db86LBLx.js","assets/index-D9izynYj.css"])))=>i.map(i=>d[i]);
import{t as e}from"./preload-helper-8MtV_aQO.js";import{t}from"./ToastManager-Db86LBLx.js";import{t as n}from"./AgentTools-C8gBD7t2.js";import{AgentStore as r}from"./AgentStore-DURPF8Wv.js";var i={async show(i,a,o){let s=document.getElementById(`agent-editor-modal`);s||(s=document.createElement(`div`),s.id=`agent-editor-modal`,s.className=`modal-overlay`,document.body.appendChild(s));let c=i||{name:`New Agent`,model:`gemini-1.5-pro`,systemPrompt:``,initialPrompt:``,tools:[],autonomy:`ask`},l=!c.id;s.style.display=`flex`,s.innerHTML=`
      <div class="modal-content hub-modal" style="width: 600px; height: auto; max-height: 90vh;">
        <div class="modal-header">
          <div>
            <h3>${l?`Create Agent`:`Edit Agent`}</h3>
            <span class="text-muted">Configure the AI Agent parameters</span>
          </div>
          <button id="btn-close-editor" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body hub-modal__body" style="gap: 15px;">
          <div class="panel-group">
            <label class="panel-label">Agent Name</label>
            <input type="text" id="ag-name" value="${c.name}" class="panel-input" placeholder="e.g. Code Reviewer">
          </div>
          
          <div class="panel-group">
            <label class="panel-label">Model</label>
            <div style="display:flex; gap:5px; width:100%;">
              <select id="ag-model" class="panel-select" style="flex:1;">
                <option value="gemini-1.5-flash" ${c.model===`gemini-1.5-flash`?`selected`:``}>gemini-1.5-flash</option>
                <option value="gemini-1.5-pro" ${c.model===`gemini-1.5-pro`?`selected`:``}>gemini-1.5-pro</option>
                <option value="gemini-2.5-flash" ${c.model===`gemini-2.5-flash`?`selected`:``}>gemini-2.5-flash</option>
                <option value="gemini-2.5-pro-exp" ${c.model===`gemini-2.5-pro-exp`?`selected`:``}>gemini-2.5-pro-exp</option>
              </select>
              <button id="btn-refresh-models" title="Refresh API Models" class="panel-btn" style="padding: 0 12px;">🔄</button>
            </div>
          </div>
  
          <div class="panel-group">
            <label class="panel-label">System Prompt (Agent Role)</label>
            <textarea id="ag-prompt" class="panel-input panel-textarea" placeholder="You are an expert...">${c.systemPrompt||``}</textarea>
          </div>
          
          <div class="panel-group">
            <label class="panel-label">Initial Task Prompt (Optional)</label>
            <textarea id="ag-initial" class="panel-input" style="resize:vertical; min-height: 40px;" placeholder="Automatically send this message to start...">${c.initialPrompt||``}</textarea>
          </div>
  
          <div class="panel-group">
            <label class="panel-label">Autonomy Level</label>
            <select id="ag-auto" class="panel-select">
              <option value="ask" ${c.autonomy===`ask`?`selected`:``}>Ask before each tool (Safe)</option>
              <option value="semi-auto" ${c.autonomy===`semi-auto`?`selected`:``}>Semi-Auto</option>
              <option value="full-auto" ${c.autonomy===`full-auto`?`selected`:``}>Full-Auto (Unattended)</option>
            </select>
          </div>
          
          <div class="panel-group">
            <label class="panel-label">Tools</label>
            <div id="ag-tools" class="panel-input" style="max-height:150px; overflow-y:auto; padding: 10px;">
              ${n.map(e=>`
                <label style="display:block; margin-bottom:8px; font-size:0.9em; cursor: pointer;">
                  <input type="checkbox" value="${e.name}" ${(c.tools||[]).includes(e.name)?`checked`:``} style="margin-right: 5px;"> 
                  <strong>${e.name}</strong> - <span class="text-muted">${e.description||``}</span>
                </label>
              `).join(``)}
            </div>
          </div>
          
          <div class="flex-row" style="margin-top: 10px;">
            <button id="btn-agent-save" class="hub-btn hub-btn--primary" style="flex:2;">💾 Save Agent</button>
            ${l?``:`<button id="btn-agent-delete" class="hub-btn" style="flex:1; background: var(--danger); color: white; border: none;">🗑️ Delete</button>`}
            <button id="btn-agent-cancel" class="hub-btn hub-btn--secondary" style="flex:1;">Cancel</button>
          </div>
        </div>
      </div>
    `;let u=()=>{s.style.display=`none`};document.getElementById(`btn-close-editor`).onclick=u,document.getElementById(`btn-agent-cancel`).onclick=u,s.onclick=e=>{e.target===s&&u()};let d=document.getElementById(`btn-refresh-models`);d&&(d.onclick=async()=>{d.innerText=`⏳`;try{let n=(await e(async()=>{let{AIService:e}=await import(`./index-C-BDtW-d.js`).then(e=>e.o);return{AIService:e}},__vite__mapDeps([0,1,2,3,4,5]))).AIService.getApiKey();if(!n)throw Error(`API Key missing`);let r=await(await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${n}`)).json();if(r.models){let e=document.getElementById(`ag-model`);e.innerHTML=``,r.models.filter(e=>e.name.includes(`gemini`)).forEach(t=>{let n=t.name.replace(`models/`,``),r=document.createElement(`option`);r.value=n,r.innerText=n,n===c.model&&(r.selected=!0),e.appendChild(r)}),t.success(`Models refreshed.`)}}catch{t.error(`Failed to fetch models`)}finally{d.innerText=`🔄`}}),document.getElementById(`btn-agent-save`).onclick=()=>{let e=document.getElementById(`ag-name`).value.trim();if(!e)return t.error(`Agent Name is required`);let n=document.getElementById(`ag-model`).value,i=document.getElementById(`ag-prompt`).value,o=document.getElementById(`ag-initial`).value,s=document.getElementById(`ag-auto`).value,l=Array.from(document.querySelectorAll(`#ag-tools input:checked`)).map(e=>e.value),d={...c,id:c.id||`agent_`+Date.now(),name:e,model:n,systemPrompt:i,initialPrompt:o,autonomy:s,tools:l};r.saveAgent(d),t.success(`Agent saved successfully.`),u(),a&&a(d)};let f=document.getElementById(`btn-agent-delete`);f&&(f.onclick=()=>{confirm(`Are you sure you want to delete this agent?`)&&(r.deleteAgent(c.id),t.success(`Agent deleted.`),u(),o&&o())})}};export{i as AgentEditorModal};