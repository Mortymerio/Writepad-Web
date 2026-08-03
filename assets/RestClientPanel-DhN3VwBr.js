var e={callbacks:{},init(e){this.callbacks=e},renderSidebar(e){e.innerHTML=`
      <div style="display: flex; flex-direction: column; height: 100%; padding: 10px; box-sizing: border-box; background: var(--bg-primary); color: var(--text-primary);">
        <div style="margin-bottom: 10px; display: flex; gap: 5px;">
          <select id="rest-method" style="padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none;">
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>PATCH</option>
            <option>DELETE</option>
            <option>OPTIONS</option>
            <option>HEAD</option>
          </select>
          <input type="text" id="rest-url" placeholder="https://api.example.com/v1/users" style="flex: 1; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none;" />
          <button id="rest-btn-send" style="padding: 5px 10px; background: var(--bg-active); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer; font-weight: bold;">Send</button>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 0.8em; font-weight: bold; cursor: pointer;" id="rest-headers-toggle">▶ Headers (JSON)</label>
          <textarea id="rest-headers" placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}' style="display: none; width: 100%; height: 80px; box-sizing: border-box; margin-top: 5px; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.9em;"></textarea>
        </div>

        <div style="margin-bottom: 10px;">
          <label style="font-size: 0.8em; font-weight: bold; cursor: pointer;" id="rest-body-toggle">▶ Body</label>
          <textarea id="rest-body" placeholder="Raw body data..." style="display: none; width: 100%; height: 100px; box-sizing: border-box; margin-top: 5px; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.9em;"></textarea>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px;">
          <span style="font-size: 0.85em; font-weight: bold;">Response</span>
          <div>
            <span id="rest-status" style="font-size: 0.85em; margin-right: 10px;"></span>
            <button id="rest-btn-copy" style="padding: 3px 8px; font-size: 0.8em; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer;">Copy</button>
            <button id="rest-btn-editor" style="padding: 3px 8px; font-size: 0.8em; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer;">Open in Editor</button>
          </div>
        </div>

        <div style="flex: 1; margin-top: 5px; border: 1px solid var(--border-color); position: relative;">
          <textarea id="rest-response" readonly style="width: 100%; height: 100%; box-sizing: border-box; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: none; outline: none; resize: none; font-family: monospace; font-size: 0.9em;"></textarea>
        </div>
      </div>
    `;let t=(e,t)=>{let n=document.getElementById(e),r=document.getElementById(t);n.onclick=()=>{let e=r.style.display===`none`;r.style.display=e?`block`:`none`,n.innerText=(e?`▼ `:`▶ `)+n.innerText.substring(2)}};t(`rest-headers-toggle`,`rest-headers`),t(`rest-body-toggle`,`rest-body`),document.getElementById(`rest-btn-send`).onclick=async()=>{let e=document.getElementById(`rest-method`).value,t=document.getElementById(`rest-url`).value.trim(),n=document.getElementById(`rest-headers`).value.trim(),r=document.getElementById(`rest-body`).value,i=document.getElementById(`rest-response`),a=document.getElementById(`rest-status`);if(!t){i.value=`Error: URL is required`;return}let o={};if(n)try{o=JSON.parse(n)}catch(e){i.value=`Error parsing Headers JSON: `+e.message;return}i.value=`Sending request...`,a.innerText=``,a.style.color=`inherit`;try{let n=performance.now(),s={method:e,headers:o};[`POST`,`PUT`,`PATCH`].includes(e)&&(s.body=r);let c=await fetch(t,s),l=performance.now(),u=Math.round(l-n),d=c.ok?`#3fb950`:`#f85149`;a.innerText=`${c.status} ${c.statusText} - ${u}ms`,a.style.color=d;let f=c.headers.get(`content-type`),p=``;if(f&&f.includes(`application/json`)){let e=await c.json();p=JSON.stringify(e,null,2)}else p=await c.text();let m=`--- Response Headers ---
`;for(let[e,t]of c.headers.entries())m+=`${e}: ${t}\n`;m+=`
--- Body ---
`,i.value=m+p}catch(e){a.innerText=`Error`,a.style.color=`#f85149`,i.value=`Request Failed:
`+e.message+`

(Note: If this is a CORS error, you cannot bypass it from the browser without a proxy extension).`}},document.getElementById(`rest-btn-copy`).onclick=()=>{let e=document.getElementById(`rest-response`).value;e&&navigator.clipboard.writeText(e)},document.getElementById(`rest-btn-editor`).onclick=()=>{let e=document.getElementById(`rest-response`).value;e&&this.callbacks.createTab&&this.callbacks.createTab(`response.json`,e)}}};export{e as RestClientPanel};