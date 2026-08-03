import * as monaco from 'monaco-editor';

export const ColorHighlighter = {
  init() {
    // A regex to match hex colors: #RGB, #RGBA, #RRGGBB, #RRGGBBAA
    const hexColorRegex = /#([a-fA-F0-9]{3}|[a-fA-F0-9]{4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})\b/g;

    const colorProvider = {
      provideDocumentColors: (model) => {
        const text = model.getValue();
        const colors = [];
        let match;
        
        // Find all hex colors in the document
        while ((match = hexColorRegex.exec(text)) !== null) {
          const hex = match[0];
          const parsed = this.parseHexColor(hex);
          if (parsed) {
            const startPos = model.getPositionAt(match.index);
            const endPos = model.getPositionAt(match.index + hex.length);
            
            colors.push({
              range: new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
              color: parsed
            });
          }
        }
        return colors;
      },
      
      provideColorPresentations: (model, colorInfo) => {
        // When user picks a new color in the picker, format it as hex
        const r = Math.round(colorInfo.color.red * 255);
        const g = Math.round(colorInfo.color.green * 255);
        const b = Math.round(colorInfo.color.blue * 255);
        const a = Math.round(colorInfo.color.alpha * 255);
        
        let hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        if (colorInfo.color.alpha !== 1) {
          hex += (a | 1 << 8).toString(16).slice(1);
        }
        
        return [{
          label: hex.toUpperCase()
        }];
      }
    };

    // Register for plain text, html, javascript, etc. 
    // We can register it broadly or specifically. For safety, we register it for some common ones.
    const langs = ['plaintext', 'html', 'javascript', 'typescript', 'json', 'markdown'];
    langs.forEach(lang => {
      monaco.languages.registerColorProvider(lang, colorProvider);
    });
  },

  parseHexColor(hex) {
    hex = hex.replace('#', '');
    let r, g, b, a = 255;
    
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 4) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
      a = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      a = parseInt(hex.substring(6, 8), 16);
    } else {
      return null;
    }
    
    return {
      red: r / 255,
      green: g / 255,
      blue: b / 255,
      alpha: a / 255
    };
  }
};
