var e={callbacks:{},init(e){this.callbacks=e},renderSidebar(e){e.innerHTML=`
      <div style="display: flex; flex-direction: column; height: 100%; padding: 10px; box-sizing: border-box; background: var(--bg-primary); color: var(--text-primary);">
        <div style="margin-bottom: 10px;">
          <label style="font-size: 0.8em; font-weight: bold;">Input:</label>
          <textarea id="encoder-input" style="width: 100%; height: 100px; box-sizing: border-box; margin-top: 5px; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; resize: vertical; font-family: monospace; font-size: 0.9em;"></textarea>
          <button id="encoder-btn-selection" style="margin-top: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer; padding: 4px; border-radius: 4px; font-size: 0.8em; width: 100%;">Get Editor Selection</button>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 0.8em; font-weight: bold;">Operation:</label>
          <select id="encoder-operation" style="width: 100%; box-sizing: border-box; margin-top: 5px; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; font-size: 0.9em;">
            <option value="b64-enc">Base64 Encode</option>
            <option value="b64-dec">Base64 Decode</option>
            <option value="url-enc">URL Encode</option>
            <option value="url-dec">URL Decode</option>
            <option value="hex-enc">Hex Encode</option>
            <option value="hex-dec">Hex Decode</option>
            <option value="html-enc">HTML Encode</option>
            <option value="html-dec">HTML Decode</option>
            <option value="rot13">ROT13</option>
          </select>
        </div>
        
        <div style="margin-bottom: 10px; flex: 1; display: flex; flex-direction: column;">
          <label style="font-size: 0.8em; font-weight: bold;">Output:</label>
          <textarea id="encoder-output" readonly style="width: 100%; flex: 1; box-sizing: border-box; margin-top: 5px; padding: 5px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); outline: none; resize: none; font-family: monospace; font-size: 0.9em;"></textarea>
          <button id="encoder-btn-insert" style="margin-top: 5px; background: #238636; color: white; border: none; cursor: pointer; padding: 6px; border-radius: 4px; font-size: 0.9em; width: 100%; font-weight: bold;">Insert at Cursor</button>
        </div>
      </div>
    `;let t=document.getElementById(`encoder-input`),n=document.getElementById(`encoder-output`),r=document.getElementById(`encoder-operation`),i=()=>{let e=t.value,i=r.value,a=``;try{if(!e){n.value=``;return}if(i===`b64-enc`)a=btoa(unescape(encodeURIComponent(e)));else if(i===`b64-dec`)a=decodeURIComponent(escape(atob(e)));else if(i===`url-enc`)a=encodeURIComponent(e);else if(i===`url-dec`)a=decodeURIComponent(e);else if(i===`rot13`)a=e.replace(/[a-zA-Z]/g,e=>{let t=e<=`Z`?65:97;return String.fromCharCode((e.charCodeAt(0)-t+13)%26+t)});else if(i===`hex-enc`)a=e.split(``).map(e=>e.charCodeAt(0).toString(16).padStart(2,`0`)).join(``);else if(i===`hex-dec`){let t=e.replace(/[^0-9A-Fa-f]/g,``);for(let e=0;e<t.length;e+=2)a+=String.fromCharCode(parseInt(t.substr(e,2),16))}else if(i===`html-enc`){let t=document.createElement(`div`);t.innerText=e,a=t.innerHTML}else if(i===`html-dec`){let t=document.createElement(`div`);t.innerHTML=e,a=t.innerText}n.value=a}catch{n.value=`Error: Invalid input for this operation.`}};t.addEventListener(`input`,i),r.addEventListener(`change`,i),document.getElementById(`encoder-btn-selection`).onclick=()=>{let e=this.callbacks.getEditor();if(!e)return;let n=e.getSelection(),r=e.getModel().getValueInRange(n);r&&(t.value=r,i())},document.getElementById(`encoder-btn-insert`).onclick=()=>{let e=this.callbacks.getEditor();if(!e||!n.value||n.value.startsWith(`Error:`))return;let t=e.getSelection();e.executeEdits(`encoder`,[{range:t,text:n.value,forceMoveMarkers:!0}]),e.focus()}}};export{e as EncoderPanel};