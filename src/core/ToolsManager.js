import CryptoJS from 'crypto-js';

export const ToolsManager = {
  callbacks: {},
  currentAlgorithm: null,

  init(callbacks) {
    this.callbacks = callbacks;
    this.setupModal();
  },

  setupModal() {
    const modal = document.getElementById('hash-generator-modal');
    const input = document.getElementById('input-hash-text');
    const output = document.getElementById('output-hash-result');
    const closeBtn = document.getElementById('btn-close-hash-generator');
    const copyBtn = document.getElementById('btn-copy-hash');

    if (!modal) return;

    closeBtn.onclick = () => {
      modal.style.display = 'none';
      input.readOnly = false; // reset
    };

    input.oninput = () => {
      if (!this.currentAlgorithm) return;
      output.value = this.computeHash(this.currentAlgorithm, input.value);
    };

    copyBtn.onclick = () => {
      if (output.value) {
        navigator.clipboard.writeText(output.value);
        const originalText = copyBtn.innerText;
        copyBtn.innerText = 'Copied!';
        setTimeout(() => copyBtn.innerText = originalText, 1500);
      }
    };
  },

  computeHash(algorithm, text) {
    switch (algorithm) {
      case 'md5': return CryptoJS.MD5(text).toString();
      case 'sha1': return CryptoJS.SHA1(text).toString();
      case 'sha256': return CryptoJS.SHA256(text).toString();
      case 'sha512': return CryptoJS.SHA512(text).toString();
      default: return '';
    }
  },

  computeHashFromArrayBuffer(algorithm, arrayBuffer) {
    const wordArr = CryptoJS.lib.WordArray.create(arrayBuffer);
    switch (algorithm) {
      case 'md5': return CryptoJS.MD5(wordArr).toString();
      case 'sha1': return CryptoJS.SHA1(wordArr).toString();
      case 'sha256': return CryptoJS.SHA256(wordArr).toString();
      case 'sha512': return CryptoJS.SHA512(wordArr).toString();
      default: return '';
    }
  },

  openGenerateModal(algorithm) {
    this.currentAlgorithm = algorithm;
    const modal = document.getElementById('hash-generator-modal');
    const title = document.getElementById('hash-generator-title');
    const input = document.getElementById('input-hash-text');
    const output = document.getElementById('output-hash-result');
    
    title.innerText = `Generate ${algorithm.toUpperCase()} Hash`;
    input.readOnly = false;
    input.value = '';
    output.value = this.computeHash(algorithm, '');
    
    modal.style.display = 'flex';
    input.focus();
  },

  generateFromSelection(algorithm) {
    const editor = this.callbacks.getEditor();
    if (!editor) return;

    const selection = editor.getSelection();
    const text = editor.getModel().getValueInRange(selection);
    
    if (!text) {
      alert("No text selected.");
      return;
    }

    const hash = this.computeHash(algorithm, text);
    navigator.clipboard.writeText(hash).then(() => {
      alert(`${algorithm.toUpperCase()} hash copied to clipboard!\n\n${hash}`);
    }).catch(err => {
      alert(`Failed to copy hash: ${err}`);
    });
  },

  async generateFromFiles(algorithm) {
    if (window.showOpenFilePicker) {
      try {
        const fileHandles = await window.showOpenFilePicker({ multiple: true });
        let results = [];
        
        for (const handle of fileHandles) {
          const file = await handle.getFile();
          const buffer = await file.arrayBuffer();
          const hash = this.computeHashFromArrayBuffer(algorithm, buffer);
          results.push(`${hash} *${file.name}`);
        }
        
        const resultText = results.join('\n');
        
        this.currentAlgorithm = null; // Disable auto-update
        const modal = document.getElementById('hash-generator-modal');
        const title = document.getElementById('hash-generator-title');
        const input = document.getElementById('input-hash-text');
        const output = document.getElementById('output-hash-result');
        
        title.innerText = `${algorithm.toUpperCase()} Hashes for Files`;
        input.value = resultText;
        input.readOnly = true;
        output.value = "See text area above for results.";
        
        modal.style.display = 'flex';

      } catch (err) {
        if (err.name !== 'AbortError') {
          alert(`Error reading files: ${err.message}`);
        }
      }
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.onchange = async (e) => {
        const files = e.target.files;
        if (files.length > 0) {
          let results = [];
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const buffer = await file.arrayBuffer();
            const hash = this.computeHashFromArrayBuffer(algorithm, buffer);
            results.push(`${hash} *${file.name}`);
          }
          
          this.currentAlgorithm = null;
          const modal = document.getElementById('hash-generator-modal');
          const title = document.getElementById('hash-generator-title');
          const inputEl = document.getElementById('input-hash-text');
          const outputEl = document.getElementById('output-hash-result');
          
          title.innerText = `${algorithm.toUpperCase()} Hashes for Files`;
          inputEl.value = results.join('\n');
          inputEl.readOnly = true;
          outputEl.value = "See text area above for results.";
          modal.style.display = 'flex';
        }
      };
      input.click();
    }
  }
};
