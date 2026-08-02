import { ToastManager } from '../ui/ToastManager.js';

export const CyberTools = {
  callbacks: {},

  init(callbacks) {
    this.callbacks = callbacks;
  },

  getEditorText(fromSelection = false) {
    const editor = this.callbacks.getEditor();
    if (!editor) return null;
    
    if (fromSelection) {
      const selection = editor.getSelection();
      const text = editor.getModel().getValueInRange(selection);
      if (!text) {
        ToastManager.warning("No text selected.");
        return null;
      }
      return text;
    } else {
      return editor.getValue();
    }
  },

  showResultModal(title, label1, text1, label2, text2) {
    const modal = document.getElementById('hash-generator-modal');
    if (!modal) return;
    
    document.getElementById('hash-generator-title').innerText = title;
    
    const inputLabel = document.getElementById('hash-generator-label1');
    const input = document.getElementById('input-hash-text');
    inputLabel.innerText = label1;
    input.value = text1;
    input.readOnly = true;
    
    const outputLabel = document.getElementById('hash-generator-label2');
    const output = document.getElementById('output-hash-result');
    outputLabel.innerText = label2;
    output.value = text2;
    
    input.oninput = null; // Unbind previous
    
    modal.style.display = 'flex';
  },

  handleEncoderAction(type, action) {
    const text = this.getEditorText(true);
    if (text === null) return;
    
    let result = '';
    try {
      if (type === 'base64') {
        result = action === 'encode' ? btoa(unescape(encodeURIComponent(text))) : decodeURIComponent(escape(atob(text)));
      } else if (type === 'url') {
        result = action === 'encode' ? encodeURIComponent(text) : decodeURIComponent(text);
      } else if (type === 'html') {
        const div = document.createElement('div');
        if (action === 'encode') {
          div.innerText = text;
          result = div.innerHTML;
        } else {
          div.innerHTML = text;
          result = div.innerText;
        }
      } else if (type === 'hex') {
        if (action === 'encode') {
          result = text.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
        } else {
          const hex = text.replace(/[^0-9A-Fa-f]/g, '');
          let str = '';
          for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
          }
          result = str;
        }
      }
      
      this.showResultModal(`${type.toUpperCase()} ${action}`, "Input", text, "Output", result);
    } catch (e) {
      ToastManager.error(`Error processing ${type}: ${e.message}`);
    }
  },

  calculateEntropy() {
    const text = this.getEditorText(false);
    if (text === null || text.length === 0) return;
    
    const len = text.length;
    const frequencies = {};
    for (let i = 0; i < len; i++) {
      const char = text[i];
      frequencies[char] = (frequencies[char] || 0) + 1;
    }
    
    let entropy = 0;
    for (const char in frequencies) {
      const p = frequencies[char] / len;
      entropy -= p * Math.log2(p);
    }
    
    ToastManager.info(`Shannon Entropy: ${entropy.toFixed(4)}\n\n(A value closer to 8 indicates highly compressed or encrypted data.)`);
  },

  extractIOCs() {
    const text = this.getEditorText(false);
    if (text === null) return;
    
    const ipv4Regex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    const urlRegex = /(?:https?|ftp):\/\/[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+/g;
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
    
    const ips = [...new Set(text.match(ipv4Regex) || [])];
    const urls = [...new Set(text.match(urlRegex) || [])];
    const emails = [...new Set(text.match(emailRegex) || [])];
    
    let report = `=== IOC Extractor Report ===\n\n`;
    report += `IP Addresses (${ips.length}):\n${ips.join('\n')}\n\n`;
    report += `URLs (${urls.length}):\n${urls.join('\n')}\n\n`;
    report += `Emails (${emails.length}):\n${emails.join('\n')}\n`;
    
    this.showResultModal("Extracted IOCs", "Document Size", `${text.length} chars`, "Report", report);
  },
  
  defangURLs(refang = false) {
    const text = this.getEditorText(true);
    if (text === null) return;
    
    let result = '';
    if (!refang) {
      result = text.replace(/http/gi, 'hxxp').replace(/\./g, '[.]');
    } else {
      result = text.replace(/hxxp/gi, 'http').replace(/\[\.\]/g, '.');
    }
    
    this.showResultModal(refang ? "Refang URLs" : "Defang URLs", "Original", text, "Result", result);
  },

  decodeJWT() {
    const jwt = this.getEditorText(true);
    if (jwt === null) return;
    
    try {
      const parts = jwt.trim().split('.');
      if (parts.length !== 3) {
        ToastManager.warning("Invalid JWT format. A JWT must have 3 parts separated by dots.");
        return;
      }
      
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      
      const formatted = `=== JWT Header ===\n${JSON.stringify(header, null, 2)}\n\n=== JWT Payload ===\n${JSON.stringify(payload, null, 2)}\n`;
      
      this.showResultModal("JWT Decoder", "Encoded JWT", jwt, "Decoded Content", formatted);
    } catch (e) {
      ToastManager.error("Error decoding JWT: " + e.message);
    }
  },

  applyROT13() {
    const text = this.getEditorText(true);
    if (text === null) return;
    
    const result = text.replace(/[a-zA-Z]/g, function(c) {
      const base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode((c.charCodeAt(0) - base + 13) % 26 + base);
    });
    
    this.showResultModal("ROT13", "Original", text, "Result", result);
  },

  applyXOR() {
    const text = this.getEditorText(true);
    if (text === null) return;
    
    const key = prompt("Enter a numeric XOR key (0-255):", "42");
    if (key === null) return;
    
    const keyNum = parseInt(key, 10);
    if (isNaN(keyNum) || keyNum < 0 || keyNum > 255) {
      ToastManager.warning("Invalid key. Please provide a number between 0 and 255.");
      return;
    }
    
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ keyNum);
    }
    
    this.showResultModal(`XOR (Key: ${keyNum})`, "Original", text, "Result", result);
  }
};
