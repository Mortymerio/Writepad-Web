var e={callbacks:{},pipeline:[],operations:{B64Enc:e=>btoa(e),B64Dec:e=>atob(e),URLEnc:e=>encodeURIComponent(e),URLDec:e=>decodeURIComponent(e),HexEnc:e=>Array.from(e).map(e=>e.charCodeAt(0).toString(16).padStart(2,`0`)).join(``),HexDec:e=>{let t=e.replace(/\\s/g,``),n=``;for(let e=0;e<t.length;e+=2)n+=String.fromCharCode(parseInt(t.substr(e,2),16));return n},"HTML Enc":e=>e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`),"HTML Dec":e=>{let t=document.createElement(`textarea`);return t.innerHTML=e,t.value}},init(e){this.callbacks=e,this.pipeline=[]},renderSidebar(e){e.innerHTML=`
      <div class="panel-container">
        <div class="panel-group">
          <h3 style="margin: 0 0 5px 0; font-size: 1.1em; color: var(--accent);">Recipe Pipeline</h3>
          <p style="margin: 0; font-size: 0.8em; color: var(--text-status);">Chain encoding/decoding operations (CyberChef style).</p>
        </div>

        <!-- Input -->
        <div style="margin-bottom: 10px; flex: 1; display: flex; flex-direction: column; min-height: 100px;">
          <label style="font-weight: bold; font-size: 0.85em; margin-bottom: 5px;">Input:</label>
          <textarea id="recipe-input" style="flex: 1; width: 100%; padding: 8px; box-sizing: border-box; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.85em;"></textarea>
        </div>

        <!-- Pipeline Controls -->
        <div style="margin-bottom: 10px; background: var(--bg-secondary); padding: 5px; border: 1px solid var(--border-color);">
          <div style="display: flex; gap: 5px; align-items: center; margin-bottom: 5px;">
            <select id="recipe-op-select" style="flex: 1; padding: 5px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none;">
              ${Object.keys(this.operations).map(e=>`<option value="${e}">${e}</option>`).join(``)}
            </select>
            <button id="recipe-btn-add" style="padding: 5px 10px; background: var(--accent); color: white; border: none; cursor: pointer; font-weight: bold;">Add Step</button>
          </div>
          <div id="recipe-pipeline-list" style="display: flex; flex-direction: column; gap: 5px; max-height: 120px; overflow-y: auto;">
            <!-- Pipeline steps will appear here -->
          </div>
        </div>

        <!-- Output -->
        <div style="flex: 1; display: flex; flex-direction: column; min-height: 100px;">
          <label style="font-weight: bold; font-size: 0.85em; margin-bottom: 5px;">Output:</label>
          <textarea id="recipe-output" readonly style="flex: 1; width: 100%; padding: 8px; box-sizing: border-box; background: var(--bg-secondary); color: var(--accent); border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.85em;"></textarea>
        </div>
      </div>
    `,document.getElementById(`recipe-btn-add`).onclick=()=>{let e=document.getElementById(`recipe-op-select`).value;this.pipeline.push(e),this.renderPipelineList(),this.processPipeline()},document.getElementById(`recipe-input`).oninput=()=>this.processPipeline(),this.renderPipelineList()},renderPipelineList(){let e=document.getElementById(`recipe-pipeline-list`);if(e.innerHTML=``,this.pipeline.length===0){e.innerHTML=`<span style="font-size: 0.8em; color: var(--text-secondary); font-style: italic;">No operations yet. Add a step above.</span>`;return}this.pipeline.forEach((t,n)=>{let r=document.createElement(`div`);r.style.display=`flex`,r.style.justifyContent=`space-between`,r.style.alignItems=`center`,r.style.padding=`3px 5px`,r.style.background=`var(--bg-primary)`,r.style.border=`1px solid var(--border-color)`,r.style.fontSize=`0.85em`;let i=document.createElement(`span`);i.innerText=`${n+1}. ${t}`;let a=document.createElement(`button`);a.innerText=`✖`,a.style.background=`none`,a.style.border=`none`,a.style.color=`var(--text-secondary)`,a.style.cursor=`pointer`,a.onclick=()=>{this.pipeline.splice(n,1),this.renderPipelineList(),this.processPipeline()},r.appendChild(i),r.appendChild(a),e.appendChild(r)})},processPipeline(){let e=document.getElementById(`recipe-input`).value,t=document.getElementById(`recipe-output`);if(!e){t.value=``;return}let n=e;try{for(let e of this.pipeline)this.operations[e]&&(n=this.operations[e](n));t.value=n,t.style.color=`var(--accent)`}catch(e){t.value=`Error: `+e.message,t.style.color=`#f85149`}}};export{e as RecipePipelinePanel};