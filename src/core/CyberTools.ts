import { ToastManager } from '../ui/ToastManager.js';

// Pure functions extracted for testing
export const CyberUtils = {
  base64Encode(text: string): string {
    return btoa(unescape(encodeURIComponent(text)));
  },
  base64Decode(text: string): string {
    return decodeURIComponent(escape(atob(text)));
  },
  urlEncode(text: string): string {
    return encodeURIComponent(text);
  },
  urlDecode(text: string): string {
    return decodeURIComponent(text);
  },
  htmlEncode(text: string): string {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
  },
  htmlDecode(text: string): string {
    const div = document.createElement('div');
    div.innerHTML = text;
    return div.innerText;
  },
  hexEncode(text: string): string {
    return text.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
  },
  hexDecode(text: string): string {
    const hex = text.replace(/[^0-9A-Fa-f]/g, '');
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  },
  calculateShannonEntropy(text: string): number {
    if (!text || text.length === 0) return 0.0;
    const len = text.length;
    const frequencies: Record<string, number> = {};
    for (let i = 0; i < len; i++) {
      const char = text[i];
      frequencies[char] = (frequencies[char] || 0) + 1;
    }
    let entropy = 0;
    for (const char in frequencies) {
      const p = frequencies[char] / len;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  },
  extractIOCs(text: string) {
    if (!text) return { ips: [], urls: [], emails: [] };
    const ipv4Regex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    const urlRegex = /(?:https?|ftp):\/\/[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+/g;
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
    
    return {
      ips: [...new Set(text.match(ipv4Regex) || [])],
      urls: [...new Set(text.match(urlRegex) || [])],
      emails: [...new Set(text.match(emailRegex) || [])]
    };
  },
  defang(text: string): string {
    if (!text) return text;
    return text.replace(/http/gi, 'hxxp').replace(/\./g, '[.]');
  },
  refang(text: string): string {
    if (!text) return text;
    return text.replace(/hxxp/gi, 'http').replace(/\[\.\]/g, '.');
  },
  decodeJWT(jwt: string) {
    if (!jwt) throw new Error("Empty JWT");
    const parts = jwt.trim().split('.');
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format. A JWT must have 3 parts separated by dots.");
    }
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return { header, payload };
  },
  rot13(text: string): string {
    if (!text) return text;
    return text.replace(/[a-zA-Z]/g, function(c) {
      const base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode((c.charCodeAt(0) - base + 13) % 26 + base);
    });
  },
  xor(text: string, key: number): string {
    if (!text) return text;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key);
    }
    return result;
  }
};

export const CyberTools = {
  callbacks: {} as any,

  init(callbacks: any) {
    this.callbacks = callbacks;
  },

  getEditorText(fromSelection = false): string | null {
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

  showResultModal(title: string, label1: string, text1: string, label2: string, text2: string) {
    const modal = document.getElementById('hash-generator-modal');
    if (!modal) return;
    
    const titleEl = document.getElementById('hash-generator-title');
    if (titleEl) titleEl.innerText = title;
    
    const inputLabel = document.getElementById('hash-generator-label1');
    const input = document.getElementById('input-hash-text') as HTMLTextAreaElement;
    if (inputLabel) inputLabel.innerText = label1;
    if (input) {
      input.value = text1;
      input.readOnly = true;
      input.oninput = null; // Unbind previous
    }
    
    const outputLabel = document.getElementById('hash-generator-label2');
    const output = document.getElementById('output-hash-result') as HTMLInputElement;
    if (outputLabel) outputLabel.innerText = label2;
    if (output) output.value = text2;
    
    modal.style.display = 'flex';
  },

  handleEncoderAction(type: string, action: string) {
    const text = this.getEditorText(true);
    if (text === null) return;
    
    let result = '';
    try {
      if (type === 'base64') {
        result = action === 'encode' ? CyberUtils.base64Encode(text) : CyberUtils.base64Decode(text);
      } else if (type === 'url') {
        result = action === 'encode' ? CyberUtils.urlEncode(text) : CyberUtils.urlDecode(text);
      } else if (type === 'html') {
        result = action === 'encode' ? CyberUtils.htmlEncode(text) : CyberUtils.htmlDecode(text);
      } else if (type === 'hex') {
        result = action === 'encode' ? CyberUtils.hexEncode(text) : CyberUtils.hexDecode(text);
      }
      
      this.showResultModal(`${type.toUpperCase()} ${action}`, "Input", text, "Output", result);
    } catch (e: any) {
      ToastManager.error(`Error processing ${type}: ${e.message}`);
    }
  },

  calculateEntropy() {
    const text = this.getEditorText(false);
    if (text === null || text.length === 0) return;
    
    const entropy = CyberUtils.calculateShannonEntropy(text);
    ToastManager.info(`Shannon Entropy: ${entropy.toFixed(4)}\n\n(A value closer to 8 indicates highly compressed or encrypted data.)`);
  },

  extractIOCs() {
    const text = this.getEditorText(false);
    if (text === null) return;
    
    const { ips, urls, emails } = CyberUtils.extractIOCs(text);
    
    let report = `=== IOC Extractor Report ===\n\n`;
    report += `IP Addresses (${ips.length}):\n${ips.join('\n')}\n\n`;
    report += `URLs (${urls.length}):\n${urls.join('\n')}\n\n`;
    report += `Emails (${emails.length}):\n${emails.join('\n')}\n`;
    
    this.showResultModal("Extracted IOCs", "Document Size", `${text.length} chars`, "Report", report);
  },
  
  defangURLs(refang = false) {
    const text = this.getEditorText(true);
    if (text === null) return;
    
    const result = refang ? CyberUtils.refang(text) : CyberUtils.defang(text);
    this.showResultModal(refang ? "Refang URLs" : "Defang URLs", "Original", text, "Result", result);
  },

  decodeJWT() {
    const jwt = this.getEditorText(true);
    if (jwt === null) return;
    
    try {
      const { header, payload } = CyberUtils.decodeJWT(jwt);
      const formatted = `=== JWT Header ===\n${JSON.stringify(header, null, 2)}\n\n=== JWT Payload ===\n${JSON.stringify(payload, null, 2)}\n`;
      this.showResultModal("JWT Decoder", "Encoded JWT", jwt, "Decoded Content", formatted);
    } catch (e: any) {
      ToastManager.warning(e.message);
    }
  },

  applyROT13() {
    const text = this.getEditorText(true);
    if (text === null) return;
    
    const result = CyberUtils.rot13(text);
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
    
    const result = CyberUtils.xor(text, keyNum);
    this.showResultModal(`XOR (Key: ${keyNum})`, "Original", text, "Result", result);
  }
};
