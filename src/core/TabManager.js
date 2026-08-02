import * as monaco from 'monaco-editor';
import { EncodingManager, Encodings } from './EncodingManager';

export const TabManager = {
  tabs: [],
  activeTabIndex: -1,
  callbacks: {},

  init(callbacks) {
    this.callbacks = callbacks;
  },

  getTabs() {
    return this.tabs;
  },

  getActiveTabIndex() {
    return this.activeTabIndex;
  },

  getActiveTab() {
    if (this.activeTabIndex >= 0 && this.activeTabIndex < this.tabs.length) {
      return this.tabs[this.activeTabIndex];
    }
    return null;
  },

  createNewTab(title) {
    const t = title || `new ${this.tabs.length + 1}`;
    const tab = {
      title: t,
      content: '',
      model: monaco.editor.createModel('', 'plaintext'),
      encoding: Encodings.UTF8,
      unsavedDecos: [],
      savedDecos: []
    };
    this.tabs.push(tab);
    this.switchTab(this.tabs.length - 1);
    this.renderTabs();
  },

  switchTab(index) {
    if (index >= 0 && index < this.tabs.length) {
      if (this.callbacks.stopMonitoring) this.callbacks.stopMonitoring();
      this.activeTabIndex = index;
      
      const editor = this.callbacks.getEditor();
      if (editor) {
        editor.setModel(this.tabs[index].model);
      }
      
      this.renderTabs();
      if (this.callbacks.updateStatusBar) this.callbacks.updateStatusBar();
      if (this.callbacks.updateEolDecorations) this.callbacks.updateEolDecorations();
    }
  },

  closeTab(index) {
    if (this.tabs.length === 1) return; // Don't close last tab for now
    this.tabs.splice(index, 1);
    if (this.activeTabIndex >= this.tabs.length) {
      this.activeTabIndex = this.tabs.length - 1;
    }
    this.switchTab(this.activeTabIndex);
  },

  closeAllTabs() {
    while (this.tabs.length > 1) {
      this.closeTab(this.tabs.length - 1);
    }
    this.tabs.length = 0;
    this.createNewTab();
  },

  renderTabs() {
    const tabBar = document.getElementById('tab-bar');
    if (!tabBar) return;
    tabBar.innerHTML = '';
    
    this.tabs.forEach((tab, index) => {
      const tabEl = document.createElement('div');
      tabEl.className = `tab ${index === this.activeTabIndex ? 'active' : ''}`;
      
      const titleEl = document.createElement('span');
      titleEl.innerText = tab.title;
      titleEl.onclick = () => this.switchTab(index);
      
      const closeEl = document.createElement('span');
      closeEl.className = 'tab-close';
      closeEl.innerText = '×';
      closeEl.onclick = (e) => {
        e.stopPropagation();
        this.closeTab(index);
      };
      
      tabEl.appendChild(titleEl);
      tabEl.appendChild(closeEl);
      tabBar.appendChild(tabEl);
    });
    
    // Add a '+' button
    const addTabBtn = document.createElement('div');
    addTabBtn.className = 'tab add-tab-btn';
    addTabBtn.innerText = '+';
    addTabBtn.title = 'New Document';
    addTabBtn.onclick = () => this.createNewTab();
    tabBar.appendChild(addTabBtn);
  },

  async openFile() {
    try {
      if (window.showOpenFilePicker) {
        const [fileHandle] = await window.showOpenFilePicker();
        if (fileHandle) {
          const file = await fileHandle.getFile();
          const buffer = await file.arrayBuffer();
          const encoding = EncodingManager.detectEncoding(buffer);
          const text = EncodingManager.decode(buffer, encoding);
          
          const newTab = {
            title: file.name,
            model: monaco.editor.createModel(text, this.callbacks.getLanguageFromExt(file.name)),
            fileHandle: fileHandle,
            encoding: encoding,
            unsavedDecos: [],
            savedDecos: []
          };
          this.tabs.push(newTab);
          this.switchTab(this.tabs.length - 1);
        }
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (re) => {
              const buffer = re.target.result;
              const encoding = EncodingManager.detectEncoding(buffer);
              const text = EncodingManager.decode(buffer, encoding);
              
              const newTab = {
                title: file.name,
                model: monaco.editor.createModel(text, this.callbacks.getLanguageFromExt(file.name)),
                encoding: encoding,
                unsavedDecos: [],
                savedDecos: []
              };
              this.tabs.push(newTab);
              this.switchTab(this.tabs.length - 1);
            };
            reader.readAsArrayBuffer(file);
          }
        };
        input.click();
      }
    } catch (err) {
      console.log("Operación de apertura cancelada o fallida.", err);
    }
  },

  downloadContent(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename.startsWith('new ') ? 'document.txt' : filename;
    a.click();
  },

  markAsSaved(tab) {
    if (!tab) return;
    let unsavedRanges = tab.unsavedDecos.map(id => tab.model.getDecorationRange(id)).filter(r => r);
    let savedRanges = tab.savedDecos.map(id => tab.model.getDecorationRange(id)).filter(r => r);
    
    let allSaved = [...savedRanges, ...unsavedRanges];
    allSaved.sort((a, b) => a.startLineNumber - b.startLineNumber);
    
    let mergedSaved = [];
    for (let r of allSaved) {
      if (mergedSaved.length === 0) {
        mergedSaved.push(r);
      } else {
        let last = mergedSaved[mergedSaved.length - 1];
        if (r.startLineNumber <= last.endLineNumber + 1) {
          let newEnd = Math.max(last.endLineNumber, r.endLineNumber);
          mergedSaved[mergedSaved.length - 1] = new monaco.Range(last.startLineNumber, 1, newEnd, 1);
        } else {
          mergedSaved.push(r);
        }
      }
    }
    
    tab.savedDecos = tab.model.deltaDecorations(tab.savedDecos, mergedSaved.map(r => ({
        range: r,
        options: { isWholeLine: true, linesDecorationsClassName: 'gutter-saved' }
    })));
    
    tab.unsavedDecos = tab.model.deltaDecorations(tab.unsavedDecos, []); // Clear unsaved
  },

  async saveToDisk(tab) {
    try {
      if (window.showSaveFilePicker) {
        let handle = tab.fileHandle;
        if (!handle) {
          handle = await window.showSaveFilePicker({
            suggestedName: tab.title
          });
          tab.fileHandle = handle;
          tab.title = handle.name;
          this.renderTabs();
        }
        const writable = await handle.createWritable();
        const buffer = EncodingManager.encode(tab.model.getValue(), tab.encoding || Encodings.UTF8);
        await writable.write(buffer);
        await writable.close();
        return true;
      } else {
        // Fallback download
        const a = document.createElement('a');
        const buffer = EncodingManager.encode(tab.model.getValue(), tab.encoding || Encodings.UTF8);
        const blob = new Blob([buffer], {type: 'application/octet-stream'});
        a.href = URL.createObjectURL(blob);
        a.download = tab.title;
        a.click();
        return true;
      }
    } catch (err) {
      console.warn("Save cancelled or failed", err);
      return false;
    }
  },

  async saveActiveTab() {
    const tab = this.getActiveTab();
    if (!tab) return;
    const saved = await this.saveToDisk(tab);
    if (saved) {
      this.markAsSaved(tab);
    }
  },

  async saveAllTabs() {
    for (const tab of this.tabs) {
      const saved = await this.saveToDisk(tab);
      if (saved) {
        this.markAsSaved(tab);
      }
    }
  }
};
