const fs = require('fs');
let content = fs.readFileSync('src/style.css', 'utf8');
if (!content.includes('titlebar.css')) {
  content = "@import './styles/titlebar.css';\n" + content;
  fs.writeFileSync('src/style.css', content);
}
