const fs = require('fs');

let content = fs.readFileSync('src/ui/AgentPanel.js', 'utf8');

// We need to replace the edit button logic:
// btnEdit.onclick = (e) => { ... this.isEditing = true; ... }
content = content.replace(/btnEdit\.onclick = \(e\) => \{[\s\S]*?this\.updateView\(\);\s*\};/, `btnEdit.onclick = async (e) => {
          e.stopPropagation();
          const { AgentEditorModal } = await import('./AgentEditorModal.js');
          AgentEditorModal.show(agent, 
            (updated) => { this.currentAgent = updated; this.updateView(); },
            () => { this.currentAgent = null; this.updateView(); }
          );
        };`);

// Remove isEditing reset on card click
content = content.replace(/this\.isEditing = false;\s*/g, '');

// Replace new agent button logic
content = content.replace(/btnNew\.onclick = \(\) => \{[\s\S]*?this\.updateView\(\);\s*\};/, `btnNew.onclick = async () => {
          const { AgentEditorModal } = await import('./AgentEditorModal.js');
          AgentEditorModal.show(null, (newAgent) => {
            this.currentAgent = newAgent;
            this.updateView();
          });
        };`);

// Remove the huge edit form block
// The block starts with "if (this.isEditing && this.currentAgent) {"
// and ends right before "this.container.appendChild(bottomContainer);"
// Let's use a regex that matches from `if (this.isEditing` up to `this.container.appendChild(bottomContainer);`
content = content.replace(/if \(!?this\.isEditing && this\.currentAgent\) \{[\s\S]*?(this\.container\.appendChild\(bottomContainer\);)/, `$1`);

fs.writeFileSync('src/ui/AgentPanel.js', content);
console.log('AgentPanel updated.');
