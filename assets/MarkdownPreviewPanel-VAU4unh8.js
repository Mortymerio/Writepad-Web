import{i as e,n as t}from"./index-C-BDtW-d.js";var n={callbacks:{},container:null,init(e){this.callbacks=e},renderSidebar(e){this.container=e,e.innerHTML=`
      <div class="md-preview-container">
        <div class="md-preview-header">
          <span>Markdown Preview</span>
          <span class="md-preview-header__status">Updates automatically</span>
        </div>
        <div id="md-preview-content" class="md-preview-content">
          <i>Loading preview...</i>
        </div>
      </div>
    `,this.updatePreview(),t.on(`TAB_CONTENT_CHANGED`,()=>this.updatePreview()),t.on(`TAB_SWITCHED`,()=>this.updatePreview())},updatePreview(){if(!this.container)return;let t=this.callbacks.getEditor(),n=document.getElementById(`md-preview-content`);if(!n||!t)return;let r=this.callbacks.getActiveTabIndex(),i=this.callbacks.getTabs();if(r===-1){n.innerHTML=`<i>No active document.</i>`;return}let a=i[r];if(!a.title||!a.title.toLowerCase().endsWith(`.md`)){n.innerHTML=`<i>Active document is not a Markdown file (.md).</i>`;return}let o=t.getValue();try{n.innerHTML=e.parse(o)}catch(e){n.innerHTML=`<i class="md-preview-error">Error parsing Markdown: `+e.message+`</i>`}}};export{n as MarkdownPreviewPanel};