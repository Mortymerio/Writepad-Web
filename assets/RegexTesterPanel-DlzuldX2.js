var e={callbacks:{},container:null,decorations:[],init(e){this.callbacks=e},renderSidebar(e){this.container=e,e.innerHTML=`
      <div class="panel-container">
        <label style="font-weight: bold; margin-bottom: 5px;">Regex Pattern:</label>
        <div style="display: flex; gap: 5px; margin-bottom: 10px;">
          <span style="padding: 5px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-right: none; color: var(--text-secondary);">/</span>
          <input type="text" id="regex-pattern" placeholder="\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b" style="flex: 1; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; font-family: monospace;" />
          <span style="padding: 5px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-left: none; color: var(--text-secondary);">/</span>
          <input type="text" id="regex-flags" value="gi" placeholder="gi" style="width: 40px; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; font-family: monospace;" />
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <span id="regex-matches-count" style="font-size: 0.85em; color: var(--text-secondary);">0 matches</span>
          <button id="btn-regex-clear" style="padding: 3px 8px; font-size: 0.8em; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer;">Clear Highlight</button>
        </div>

        <div style="flex: 1; overflow-y: auto;">
          <ul id="regex-matches-list" style="list-style: none; padding: 0; margin: 0; font-size: 0.85em; font-family: monospace;">
          </ul>
          
          <div id="regex-examples-container" style="margin-top: 15px;">
            <div style="font-weight: bold; margin-bottom: 8px; color: var(--text-primary); border-bottom: 1px solid var(--border-light); padding-bottom: 3px;">Common Examples</div>
            <ul id="regex-examples-list" style="list-style: none; padding: 0; margin: 0; font-size: 0.85em;">
              <!-- Injected dynamically -->
            </ul>
          </div>
        </div>
      </div>
    `;let t=document.getElementById(`regex-pattern`),n=document.getElementById(`regex-flags`),r=document.getElementById(`btn-regex-clear`),i=()=>this.highlightRegex();if(t.addEventListener(`input`,i),n.addEventListener(`input`,i),r.onclick=()=>{t.value=``,this.clearDecorations()},!document.getElementById(`regex-highlight-style`)){let e=document.createElement(`style`);e.id=`regex-highlight-style`,e.innerHTML=`
        .regex-highlight {
          background-color: rgba(255, 255, 0, 0.4);
          outline: 1px solid rgba(255, 255, 0, 0.8);
        }
        .regex-example-item {
          padding: 8px 6px; border-bottom: 1px solid var(--border-light); cursor: pointer; color: var(--text-secondary); display: flex; flex-direction: column; gap: 4px; align-items: flex-start;
        }
        .regex-example-item:hover { background: var(--bg-active); color: var(--text-primary); }
        .regex-example-code { color: #e3b341; font-family: monospace; font-size: 0.9em; background: rgba(227, 179, 65, 0.1); padding: 2px 4px; border-radius: 3px; }
      `,document.head.appendChild(e)}this.renderExamples()},renderExamples(){let e=[{name:`Email`,pattern:`\\\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\\\.[A-Za-z]{2,}\\\\b`,flags:`g`},{name:`IPv4 Address`,pattern:`\\\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\\\b`,flags:`g`},{name:`IPv6 Address`,pattern:`\\\\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\\\\b`,flags:`gi`},{name:`URL (http/https)`,pattern:`https?:\\\\/\\\\/(www\\\\.)?[-a-zA-Z0-9@:%._\\\\+~#=]{1,256}\\\\.[a-zA-Z0-9()]{1,6}\\\\b([-a-zA-Z0-9()@:%_\\\\+.~#?&//=]*)`,flags:`gi`},{name:`MAC Address`,pattern:`\\\\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\\\\b`,flags:`g`},{name:`MD5 Hash`,pattern:`\\\\b[A-Fa-f0-9]{32}\\\\b`,flags:`g`},{name:`SHA-1 Hash`,pattern:`\\\\b[A-Fa-f0-9]{40}\\\\b`,flags:`g`},{name:`SHA-256 Hash`,pattern:`\\\\b[A-Fa-f0-9]{64}\\\\b`,flags:`g`},{name:`Base64 String`,pattern:`(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?`,flags:`g`},{name:`Credit Card (Any)`,pattern:`\\\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\\\\d{3})\\\\d{11})\\\\b`,flags:`g`},{name:`HTML Tags`,pattern:`<\\\\/?(?:[A-Za-z]+)(?:[^>]*)\\\\/?>`,flags:`gi`},{name:`UUID / GUID`,pattern:`\\\\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\\\b`,flags:`g`},{name:`Dates (YYYY-MM-DD)`,pattern:`\\\\b\\\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\\\d|3[01])\\\\b`,flags:`g`},{name:`JWT Token`,pattern:`eyJ[A-Za-z0-9-_=]+\\\\.eyJ[A-Za-z0-9-_=]+\\\\.?[A-Za-z0-9-_.+/=]*`,flags:`g`}],t=document.getElementById(`regex-examples-list`);t&&(t.innerHTML=``,e.forEach(e=>{let n=document.createElement(`li`);n.className=`regex-example-item`,n.innerHTML=`<span style="font-weight: 500;">${e.name}</span><span class="regex-example-code">/${e.pattern}/${e.flags}</span>`,n.onclick=()=>{document.getElementById(`regex-pattern`).value=e.pattern.replace(/\\\\\\\\/g,`\\\\`),document.getElementById(`regex-flags`).value=e.flags,this.highlightRegex()},t.appendChild(n)}))},highlightRegex(){let e=this.callbacks.getEditor(),t=e.getModel();if(!t)return;this.clearDecorations();let n=document.getElementById(`regex-pattern`).value,r=document.getElementById(`regex-flags`).value,i=document.getElementById(`regex-matches-count`),a=document.getElementById(`regex-matches-list`);a.innerHTML=``;let o=document.getElementById(`regex-examples-container`);if(!n){i.innerText=`0 matches`,o&&(o.style.display=`block`);return}o&&(o.style.display=`none`);try{new RegExp(n,r);let o=t.findMatches(n,!1,!0,!1,null,!0),s=o.map(e=>({range:e.range,options:{inlineClassName:`regex-highlight`}}));this.decorations=e.deltaDecorations([],s),i.innerText=`${o.length} match${o.length===1?``:`es`}`;let c=Math.min(o.length,50),l=``;for(let e=0;e<c;e++){let n=o[e],r=t.getValueInRange(n.range);l+=`<li style="padding: 4px; border-bottom: 1px solid var(--border-light); cursor: pointer;" data-line="${n.range.startLineNumber}" data-col="${n.range.startColumn}">
          <span style="color: var(--text-secondary); margin-right: 5px;">Ln ${n.range.startLineNumber}</span>
          <span style="color: #e3b341;">${this.escapeHtml(r)}</span>
        </li>`}o.length>50&&(l+=`<li style="padding: 4px; color: var(--text-secondary); text-align: center;">... and ${o.length-50} more</li>`),a.innerHTML=l,a.querySelectorAll(`li[data-line]`).forEach(t=>{t.onclick=()=>{let n=parseInt(t.getAttribute(`data-line`),10),r=parseInt(t.getAttribute(`data-col`),10);e.revealPositionInCenter({lineNumber:n,column:r}),e.setPosition({lineNumber:n,column:r}),e.focus()}})}catch(e){i.innerText=`Invalid Regex`,a.innerHTML=`<li style="color: #f85149;">${this.escapeHtml(e.message)}</li>`}},clearDecorations(){let e=this.callbacks.getEditor();this.decorations.length>0&&(this.decorations=e.deltaDecorations(this.decorations,[]));let t=document.getElementById(`regex-matches-count`);t&&(t.innerText=`0 matches`);let n=document.getElementById(`regex-matches-list`);n&&(n.innerHTML=``);let r=document.getElementById(`regex-examples-container`);r&&(r.style.display=`block`)},escapeHtml(e){return e.replace(/[&<>'"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,"'":`&#39;`,'"':`&quot;`})[e]||e)}};export{e as RegexTesterPanel};