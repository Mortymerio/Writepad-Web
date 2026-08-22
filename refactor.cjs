const fs = require('fs');
let content = fs.readFileSync('src/ui/AgentPanel.js', 'utf8');

const replacements = [
  ['this.container.style.display = \'flex\';', 'this.container.className = \'agent-panel\';'],
  ['this.container.style.flexDirection = \'column\';', ''],
  ['this.container.style.height = \'100%\';', ''],
  ['this.container.style.backgroundColor = \'#2d333b\';', ''],
  ['this.container.style.color = \'#c9d1d9\';', ''],
  
  ['title.style.cssText = \'padding:10px; font-weight:bold; border-bottom:1px solid #444; flex-shrink:0; display:flex; align-items:center; gap:8px;\';', 'title.className = \'agent-panel__header\';'],
  
  ['btnCommunity.style.cssText = \'background:transparent; border:1px solid #444; color:#3fb950; border-radius:4px; padding:2px 8px; cursor:pointer; margin-left:auto; font-size:0.85em; font-weight:normal; display:flex; align-items:center; gap:4px; transition: 0.2s;\';', 'btnCommunity.className = \'agent-panel__btn-community\';'],
  
  ['btnHelp.style.cssText = \'background:transparent; border:1px solid #444; color:#58a6ff; border-radius:4px; padding:2px 8px; cursor:pointer; margin-left:4px; font-size:0.85em; font-weight:normal; display:flex; align-items:center; gap:4px;\';', 'btnHelp.className = \'agent-panel__btn-help\';'],
  
  ['listContainer.style.cssText = \'flex:1; overflow-y:auto; display:flex; flex-direction:column; background: #0d1117;\';', 'listContainer.className = \'agent-panel__list\';'],
  ['listContainer.style.padding = \'10px\';', ''],
  ['listContainer.style.gap = \'10px\';', ''],
  ['listContainer.style.background = \'transparent\';', ''],
  
  ['const baseStyle = \'border-radius:6px; padding:10px; cursor:pointer; display:flex; flex-direction:column; gap:5px; box-sizing:border-box; width:100%; \';', ''],
  
  ['header.style.display = \'flex\';', 'header.className = \'agent-card__header\';'],
  ['header.style.alignItems = \'flex-start\';', ''],
  ['header.style.width = \'100%\';', ''],
  
  ['titleArea.style.display = \'flex\';', 'titleArea.className = \'agent-card__title-area\';'],
  ['titleArea.style.alignItems = \'center\';', ''],
  ['titleArea.style.gap = \'8px\';', ''],
  ['titleArea.style.flexWrap = \'wrap\';', ''],
  ['titleArea.style.flex = \'1\';', ''],
  ['titleArea.style.minWidth = \'0\'; // Prevent flex overflow', ''],
  
  ['name.style.color = isSelected ? \'#58a6ff\' : \'#c9d1d9\';', 'name.className = \'agent-card__name \' + (isSelected ? \'agent-card__name--active\' : \'\');'],
  
  ['btnShare.style.cssText = \'padding:2px 8px; font-size:0.8em; background:transparent; border:1px solid #555; color:#c9d1d9; border-radius:4px; cursor:pointer; flex-shrink:0; margin-left:auto; margin-right:4px;\';', 'btnShare.className = \'agent-panel__btn-share\';'],
  
  ['btnPublish.style.cssText = \'padding:2px 8px; font-size:0.8em; background:transparent; border:1px solid #555; color:#3fb950; border-radius:4px; cursor:pointer; flex-shrink:0; margin-left:4px; margin-right:4px;\';', 'btnPublish.className = \'agent-panel__btn-publish\';'],
  
  ['btnEdit.style.cssText = \'padding:2px 8px; font-size:0.8em; background:transparent; border:1px solid #555; color:#c9d1d9; border-radius:4px; cursor:pointer; flex-shrink:0;\';', 'btnEdit.className = \'agent-panel__btn-edit\';'],
  
  ['desc.style.fontSize = \'0.85em\';', 'desc.className = \'agent-card__desc\';'],
  ['desc.style.color = \'#8b949e\';', ''],
  
  ['bottomContainer.style.cssText = \'flex-shrink:0; padding:10px; border-top:1px solid #444; background:#2d333b; display:flex; flex-direction:column; gap:8px;\';', 'bottomContainer.className = \'agent-panel__bottom\';'],
  
  ['statusArea.style.cssText = \'display:none; max-height:200px; overflow-y:auto; font-size:0.85em; background:#1e1e1e; padding:8px; border-radius:4px; color:#aaa; font-family:monospace; margin-bottom:5px;\';', 'statusArea.className = \'agent-panel__status\';'],
  
  ['input.style.cssText = \'width:100%; box-sizing:border-box; height:60px; background:#222; color:#c9d1d9; border:1px solid #444; border-radius:4px; padding:8px; resize:none; font-family:inherit;\';', 'input.className = \'agent-panel__input\';'],
  
  ['btnRun.style.cssText = \'width:100%; box-sizing:border-box; padding:8px; background:#0c7acb; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;\';', 'btnRun.className = \'agent-panel__btn-run\';'],
  
  ['btnStop.style.cssText = \'width:100%; box-sizing:border-box; padding:8px; background:#f85149; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold; display:none;\';', 'btnStop.className = \'agent-panel__btn-stop\';'],
  
  ['currentChunkDiv.style.cssText = \'color:#c9d1d9; margin:5px 0; font-family:sans-serif; font-size:0.95em; white-space:pre-wrap; border-left:2px solid #58a6ff; padding-left:8px;\';', 'currentChunkDiv.className = \'agent-panel__chunk\';'],
  
  ['controls.style.cssText = \'margin-top:4px; padding:4px; background:rgba(210,153,34,0.1); border:1px solid #d29922; border-radius:4px;\';', 'controls.className = \'agent-panel__controls\';'],
  
  ['btnApprove.style.cssText = \'padding:2px 8px; background:#2ea043; color:white; border:none; border-radius:4px; margin-right:5px; cursor:pointer;\';', 'btnApprove.className = \'agent-panel__btn-approve\';'],
  
  ['btnReject.style.cssText = \'padding:2px 8px; background:#f85149; color:white; border:none; border-radius:4px; cursor:pointer;\';', 'btnReject.className = \'agent-panel__btn-reject\';'],
  
  ['btnCancel.style.cssText = \'width:100%; box-sizing:border-box; padding:6px; background:transparent; border:1px solid #555; color:#c9d1d9; border-radius:4px; cursor:pointer;\';', 'btnCancel.className = \'agent-panel__btn-cancel\';'],
  
  ['editForm.style.cssText = \'display:flex; flex-direction:column; gap:8px; margin-top:10px; background:#222; padding:10px; border-radius:6px; border:1px solid #444; box-sizing:border-box; width:100%;\';', 'editForm.className = \'agent-panel__form\';'],
  
  ['actionRow.style.cssText = \'display:flex; gap:8px; margin-top:8px; width:100%; box-sizing:border-box;\';', 'actionRow.className = \'agent-panel__action-row\';'],
  
  ['btnNew.style.cssText = \'flex:1; padding:8px; background:transparent; border:1px solid #555; color:#c9d1d9; border-radius:4px; cursor:pointer;\';', 'btnNew.className = \'agent-panel__btn-new\';'],
  
  ['btnImport.style.cssText = \'flex:1; padding:8px; background:transparent; border:1px solid #555; color:#c9d1d9; border-radius:4px; cursor:pointer;\';', 'btnImport.className = \'agent-panel__btn-import\';']
];

for (const [search, replace] of replacements) {
  content = content.replace(search, replace);
  content = content.replace(search, replace); // run twice just in case
}

content = content.replace(/badge\.style\.cssText = `[^`]+`;/, "badge.className = `agent-card__badge agent-card__badge--${agent.autonomy}`;");

content = content.replace(/card\.style\.cssText = baseStyle \+ \(isSelected[\s\S]*?'background-color:#373e47; border:1px solid #444;'\);/, "card.className = 'agent-card ' + (isSelected ? 'agent-card--active' : '');");

fs.writeFileSync('src/ui/AgentPanel.js', content);
console.log("AgentPanel refactored.");
