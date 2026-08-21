const fs = require('fs');
['src/ui/AgentPanel.js', 'src/core/AgentOrchestrator.js'].forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/\\`/g, '`').replace(/\\\$/g, '$');
  fs.writeFileSync(f, code);
});
