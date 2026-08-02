const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const inputDir = 'C:\\Users\\Mariano\\AppData\\Local\\Temp\\GTFOBins\\_gtfobins';
const outputJson = path.join(__dirname, '..', 'src', 'data', 'gtfobins.json');

const result = {};

if (!fs.existsSync(path.dirname(outputJson))) {
  fs.mkdirSync(path.dirname(outputJson), { recursive: true });
}

fs.readdirSync(inputDir).forEach(file => {
  const filePath = path.join(inputDir, file);
  if (fs.statSync(filePath).isFile()) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/^---\r?\n/, '');
      
      const parts = content.split(/---\r?\n|\.\.\.\r?\n/);
      const yamlContent = parts[0];
      
      const doc = yaml.load(yamlContent);
      if (doc && doc.functions) {
        result[file] = doc.functions;
      }
    } catch(e) {
      console.error('Error parsing', file, e.message);
    }
  }
});

fs.writeFileSync(outputJson, JSON.stringify(result, null, 2));
console.log('Done generating gtfobins.json. Total binaries:', Object.keys(result).length);
