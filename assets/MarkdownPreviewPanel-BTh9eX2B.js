import{r as e}from"./index-B_qBM_v9.js";var t={callbacks:{},container:null,disposable:null,init(e){this.callbacks=e},renderSidebar(e){this.container=e,e.innerHTML=`
      <div style="display: flex; flex-direction: column; height: 100%; box-sizing: border-box; background: var(--bg-primary); color: var(--text-primary);">
        <div style="padding: 10px; background: var(--bg-secondary); border-bottom: 1px solid var(--border-light); font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
          <span>Markdown Preview</span>
          <span style="font-size: 0.8em; color: var(--text-secondary); font-weight: normal;">Updates automatically</span>
        </div>
        <div id="md-preview-content" style="flex: 1; padding: 15px; overflow-y: auto; line-height: 1.6; font-family: sans-serif;">
          <i>Loading preview...</i>
        </div>
      </div>
    `,this.updatePreview();let t=this.callbacks.getEditor();this.disposable&&this.disposable.dispose(),this.disposable=t.onDidChangeModelContent(()=>{this.updatePreview()})},updatePreview(){if(!this.container)return;let t=this.callbacks.getEditor(),n=document.getElementById(`md-preview-content`);if(!n)return;let r=this.callbacks.getActiveTabIndex(),i=this.callbacks.getTabs();if(r===-1){n.innerHTML=`<i>No active document.</i>`;return}let a=i[r];if(!a.filename||!a.filename.toLowerCase().endsWith(`.md`)){n.innerHTML=`<i>Active document is not a Markdown file (.md).</i>`;return}let o=t.getValue();try{n.innerHTML=e.parse(o);let t=document.createElement(`style`);t.innerHTML=`
        #md-preview-content h1, #md-preview-content h2, #md-preview-content h3 { border-bottom: 1px solid var(--border-light); padding-bottom: 5px; }
        #md-preview-content code { background: var(--bg-secondary); padding: 2px 4px; border-radius: 4px; font-family: monospace; }
        #md-preview-content pre { background: var(--bg-secondary); padding: 10px; border-radius: 4px; overflow-x: auto; font-family: monospace; }
        #md-preview-content a { color: #58a6ff; text-decoration: none; }
        #md-preview-content blockquote { border-left: 4px solid var(--border-light); padding-left: 15px; color: var(--text-secondary); margin-left: 0; }
        #md-preview-content table { border-collapse: collapse; width: 100%; }
        #md-preview-content th, #md-preview-content td { border: 1px solid var(--border-light); padding: 6px 13px; }
        #md-preview-content tr:nth-child(2n) { background-color: var(--bg-secondary); }
      `,n.appendChild(t)}catch(e){n.innerHTML=`<i style="color: #f85149;">Error parsing Markdown: `+e.message+`</i>`}}};export{t as MarkdownPreviewPanel};