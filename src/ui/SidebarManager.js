import * as monaco from 'monaco-editor';
import { ToastManager } from './ToastManager.js';

// IndexedDB helper for storing FileSystemDirectoryHandle
const WorkspaceDB = {
  _db: null,
  async open() {
    if (this._db) return this._db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('writepad_workspace', 1);
      req.onupgradeneeded = e => e.target.result.createObjectStore('handles', { keyPath: 'id' });
      req.onsuccess = e => { this._db = e.target.result; resolve(this._db); };
      req.onerror = () => reject(req.error);
    });
  },
  async save(handle) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').put({ id: 'workspace', handle });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  },
  async load() {
    try {
      const db = await this.open();
      return new Promise((resolve) => {
        const tx = db.transaction('handles', 'readonly');
        const req = tx.objectStore('handles').get('workspace');
        req.onsuccess = () => resolve(req.result?.handle || null);
        req.onerror = () => resolve(null);
      });
    } catch { return null; }
  },
  async clear() {
    try {
      const db = await this.open();
      const tx = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').delete('workspace');
    } catch {}
  }
};

export const SidebarManager = {
  activeSidebar: null,
  activeRightSidebar: null,
  workspaceHandle: null,
  callbacks: {},

  async init(callbacks) {
    this.callbacks = callbacks;
    window.addEventListener('macrosUpdated', () => {
      if (this.activeSidebar === 'macros') {
        this.updateSidebarContent();
      }
    });

    // Try to restore workspace folder from previous session
    await this.restoreWorkspaceHandle();
    
    const rightCloseBtn = document.getElementById('btn-right-sidebar-close');
    if (rightCloseBtn) {
      rightCloseBtn.onclick = () => {
        if (this.activeRightSidebar) {
          this.toggleSidebar(this.activeRightSidebar);
        }
      };
    }
    
    // Restore left sidebar state
    const savedLeftSidebar = localStorage.getItem('writepad_active_left_sidebar');
    if (savedLeftSidebar) {
      this.toggleSidebar(savedLeftSidebar);
    }
  },

  toggleSidebar(panelName) {
    const editor = this.callbacks.getEditor();
    
    if (['restclient', 'md-preview', 'gtfobins', 'revshell', 'sqli', 'linpeas', 'winpeas', 'encoder', 'hashcat', 'regex-tester', 'lfi', 'xss'].includes(panelName)) {
      const rightSidebar = document.getElementById('right-sidebar');
      const rightTitle = document.getElementById('right-sidebar-title');
      
      if (this.activeRightSidebar === panelName) {
        rightSidebar.style.display = 'none';
        this.activeRightSidebar = null;
      } else {
        rightSidebar.style.display = 'flex';
        this.activeRightSidebar = panelName;
        
        if (panelName === 'restclient') rightTitle.innerText = 'REST API Client';
        if (panelName === 'md-preview') rightTitle.innerText = 'Markdown Preview';
        if (panelName === 'gtfobins') rightTitle.innerText = 'GTFOBins Wiki';
        if (panelName === 'revshell') rightTitle.innerText = 'Reverse Shell Generator';
        if (panelName === 'sqli') rightTitle.innerText = 'SQLi Cheat Sheet';
        if (panelName === 'linpeas') rightTitle.innerText = 'LinPEAS Guide';
        if (panelName === 'winpeas') rightTitle.innerText = 'WinPEAS Guide';
        if (panelName === 'encoder') rightTitle.innerText = 'Encoder / Decoder';
        if (panelName === 'hashcat') rightTitle.innerText = 'Hash Identifier & Cracker';
        if (panelName === 'regex-tester') rightTitle.innerText = 'Regex Tester';
        if (panelName === 'lfi') rightTitle.innerText = 'LFI / Traversal Wiki';
        if (panelName === 'xss') rightTitle.innerText = 'XSS Polyglot Generator';
        
        const rightContent = document.getElementById('right-sidebar-content');
        rightContent.innerHTML = '';
        
        if (panelName === 'restclient') this.renderSidebarRestClient(rightContent);
        if (panelName === 'md-preview') this.renderSidebarMdPreview(rightContent);
        if (panelName === 'gtfobins') this.renderSidebarGTFOBins(rightContent);
        if (panelName === 'revshell') this.renderSidebarRevShell(rightContent);
        if (panelName === 'sqli') this.renderSidebarSQLi(rightContent);
        if (panelName === 'linpeas') this.renderSidebarPeas(rightContent, 'linpeas');
        if (panelName === 'winpeas') this.renderSidebarPeas(rightContent, 'winpeas');
        if (panelName === 'encoder') this.renderSidebarEncoder(rightContent);
        if (panelName === 'hashcat') this.renderSidebarHashCracker(rightContent);
        if (panelName === 'regex-tester') this.renderSidebarRegexTester(rightContent);
        if (panelName === 'lfi') this.renderSidebarLFI(rightContent);
        if (panelName === 'xss') this.renderSidebarXSS(rightContent);
      }
      this.updateButtonStates();
      if (editor) setTimeout(() => editor.layout(), 10);
      return;
    }

    const sidebar = document.getElementById('sidebar');
    const title = document.getElementById('sidebar-title');
    
    if (this.activeSidebar === panelName || panelName === null) {
      sidebar.style.display = 'none';
      this.activeSidebar = null;
      localStorage.removeItem('writepad_active_left_sidebar');
      this.updateButtonStates();
      if (editor) setTimeout(() => editor.layout(), 10);
      return;
    }
    
    sidebar.style.display = 'flex';
    this.activeSidebar = panelName;
    localStorage.setItem('writepad_active_left_sidebar', panelName);
    
    if (panelName === 'doc') title.innerText = 'Document List';
    if (panelName === 'func') title.innerText = 'Function List';
    if (panelName === 'todo') title.innerText = 'TODO Tree';
    if (panelName === 'workspace') title.innerText = 'Workspace';
    if (panelName === 'macros') title.innerText = 'Macros';
    
    this.updateSidebarContent();
    this.updateButtonStates();
    if (editor) setTimeout(() => editor.layout(), 10);
  },

  updateButtonStates() {
    const leftMap = { 'doc': 'btn-doc-list', 'func': 'btn-func-list', 'workspace': 'btn-workspace', 'todo': 'btn-todo-tree', 'macros': 'btn-macros-list' };
    const rightMap = { 'restclient': 'btn-restclient', 'md-preview': 'btn-md-preview', 'gtfobins': 'btn-gtfobins', 'revshell': 'btn-revshell', 'sqli': 'btn-sqli', 'linpeas': 'btn-linpeas', 'winpeas': 'btn-winpeas', 'encoder': 'btn-encoder', 'hashcat': 'btn-hashcat', 'regex-tester': 'btn-regex-tester', 'lfi': 'btn-lfi', 'xss': 'btn-xss' };
    
    Object.keys(leftMap).forEach(key => {
      const btn = document.getElementById(leftMap[key]);
      if (btn) btn.classList.toggle('active-btn', this.activeSidebar === key);
    });
    Object.keys(rightMap).forEach(key => {
      const btn = document.getElementById(rightMap[key]);
      if (btn) btn.classList.toggle('active-btn', this.activeRightSidebar === key);
    });
  },

  async updateSidebarContent() {
    if (!this.activeSidebar) return;
    const content = document.getElementById('sidebar-content');
    content.innerHTML = '';
    
    if (this.activeSidebar === 'doc') {
      this.renderSidebarDocList(content);
    } else if (this.activeSidebar === 'func') {
      this.renderSidebarFuncList(content);
    } else if (this.activeSidebar === 'todo') {
      this.renderSidebarTodo(content);
    } else if (this.activeSidebar === 'workspace') {
      await this.renderSidebarWorkspace(content);
    } else if (this.activeSidebar === 'macros') {
      this.renderSidebarMacros(content);
    }
  },

  renderSidebarRestClient(container) {
    if (!window.RestClientPanel) {
      import('./RestClientPanel.js').then(({ RestClientPanel }) => {
        window.RestClientPanel = RestClientPanel;
        RestClientPanel.init(this.callbacks);
        RestClientPanel.renderSidebar(container);
      });
    } else {
      window.RestClientPanel.init(this.callbacks);
      window.RestClientPanel.renderSidebar(container);
    }
  },

  renderSidebarMdPreview(container) {
    if (!window.MarkdownPreviewPanel) {
      import('./MarkdownPreviewPanel.js').then(({ MarkdownPreviewPanel }) => {
        window.MarkdownPreviewPanel = MarkdownPreviewPanel;
        MarkdownPreviewPanel.init(this.callbacks);
        MarkdownPreviewPanel.renderSidebar(container);
      });
    } else {
      window.MarkdownPreviewPanel.init(this.callbacks);
      window.MarkdownPreviewPanel.renderSidebar(container);
    }
  },

  renderSidebarGTFOBins(container) {
    if (!window.GTFOBinsWiki) {
      import('./GTFOBinsWiki.js').then(({ GTFOBinsWiki }) => {
        window.GTFOBinsWiki = GTFOBinsWiki;
        window.GTFOBinsWiki.init({ getEditor: this.callbacks.getEditor });
        window.GTFOBinsWiki.renderSidebar(container);
      });
      return;
    }
    window.GTFOBinsWiki.renderSidebar(container);
  },

  renderSidebarRevShell(container) {
    if (!window.RevShellGenerator) {
      import('./RevShellGenerator.js').then(({ RevShellGenerator }) => {
        window.RevShellGenerator = RevShellGenerator;
        window.RevShellGenerator.init({ getEditor: this.callbacks.getEditor });
        window.RevShellGenerator.renderSidebar(container);
      });
      return;
    }
    window.RevShellGenerator.renderSidebar(container);
  },

  renderSidebarSQLi(container) {
    if (!window.SQLiWiki) {
      import('./SQLiWiki.js').then(({ SQLiWiki }) => {
        window.SQLiWiki = SQLiWiki;
        window.SQLiWiki.init({ getEditor: this.callbacks.getEditor });
        window.SQLiWiki.renderSidebar(container);
      });
      return;
    }
    window.SQLiWiki.renderSidebar(container);
  },

  renderSidebarPeas(container, type) {
    if (!window.PeasWiki) {
      import('./PeasWiki.js').then(({ PeasWiki }) => {
        window.PeasWiki = PeasWiki;
        window.PeasWiki.renderSidebar(container, type);
      });
      return;
    }
    window.PeasWiki.renderSidebar(container, type);
  },

  renderSidebarEncoder(container) {
    if (!window.EncoderPanel) {
      import('./EncoderPanel.js').then(({ EncoderPanel }) => {
        window.EncoderPanel = EncoderPanel;
        window.EncoderPanel.init({ getEditor: this.callbacks.getEditor });
        window.EncoderPanel.renderSidebar(container);
      });
      return;
    }
    window.EncoderPanel.renderSidebar(container);
  },

  renderSidebarHashCracker(container) {
    if (!window.HashCrackerPanel) {
      import('./HashCrackerPanel.js').then(({ HashCrackerPanel }) => {
        window.HashCrackerPanel = HashCrackerPanel;
        window.HashCrackerPanel.init({ getEditor: this.callbacks.getEditor });
        window.HashCrackerPanel.renderSidebar(container);
      });
      return;
    }
    window.HashCrackerPanel.renderSidebar(container);
  },

  renderSidebarRegexTester(container) {
    if (!window.RegexTesterPanel) {
      import('./RegexTesterPanel.js').then(({ RegexTesterPanel }) => {
        window.RegexTesterPanel = RegexTesterPanel;
        RegexTesterPanel.init(this.callbacks);
        RegexTesterPanel.renderSidebar(container);
      });
    } else {
      window.RegexTesterPanel.init(this.callbacks);
      window.RegexTesterPanel.renderSidebar(container);
    }
  },

  renderSidebarLFI(container) {
    if (!window.LFIWiki) {
      import('./LFIWiki.js').then(({ LFIWiki }) => {
        window.LFIWiki = LFIWiki;
        window.LFIWiki.init({ getEditor: this.callbacks.getEditor });
        window.LFIWiki.renderSidebar(container);
      });
      return;
    }
    window.LFIWiki.renderSidebar(container);
  },

  renderSidebarXSS(container) {
    if (!window.XSSGenerator) {
      import('./XSSGenerator.js').then(({ XSSGenerator }) => {
        window.XSSGenerator = XSSGenerator;
        window.XSSGenerator.init({ getEditor: this.callbacks.getEditor });
        window.XSSGenerator.renderSidebar(container);
      });
      return;
    }
    window.XSSGenerator.renderSidebar(container);
  },

  renderSidebarTodo(container) {
    if (!window.TodoTreePanel) {
      import('./TodoTreePanel.js').then(({ TodoTreePanel }) => {
        window.TodoTreePanel = TodoTreePanel;
        TodoTreePanel.init(this.callbacks);
        TodoTreePanel.renderSidebar(container);
      });
    } else {
      window.TodoTreePanel.init(this.callbacks);
      window.TodoTreePanel.renderSidebar(container);
    }
  },

  renderSidebarMacros(container) {
    if (!window.MacroEngine) {
      import('../core/MacroEngine.js').then(({ MacroEngine }) => {
        window.MacroEngine = MacroEngine;
        this.renderSidebarMacros(container);
      });
      return;
    }

    const macros = window.MacroEngine.getSavedMacros();
    if (macros.length === 0) {
      container.innerHTML = '<div style="padding: 10px; color: #888;">No saved macros</div>';
      return;
    }

    macros.forEach(macro => {
      const item = document.createElement('div');
      item.className = 'sidebar-list-item';
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      
      const nameSpan = document.createElement('span');
      nameSpan.innerText = macro.name;
      nameSpan.style.flex = '1';
      nameSpan.style.cursor = 'pointer';
      nameSpan.onclick = () => window.MacroEngine.playMacro(macro.steps);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'close-btn';
      deleteBtn.innerText = '×';
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        window.MacroEngine.deleteMacro(macro.id);
        this.updateSidebarContent();
      };

      item.appendChild(nameSpan);
      item.appendChild(deleteBtn);
      container.appendChild(item);
    });
  },

  renderSidebarDocList(container) {
    const tabs = this.callbacks.getTabs();
    const activeTabIndex = this.callbacks.getActiveTabIndex();
    
    // Add search input
    const searchContainer = document.createElement('div');
    searchContainer.style.padding = '8px';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search documents...';
    searchInput.className = 'sidebar-search-input';
    searchContainer.appendChild(searchInput);
    container.appendChild(searchContainer);
    
    const listContainer = document.createElement('div');
    listContainer.className = 'sidebar-list-container';
    container.appendChild(listContainer);
    
    const renderList = (query = '') => {
      listContainer.innerHTML = '';
      const q = query.toLowerCase();
      tabs.forEach((tab, index) => {
        if (q && !tab.title.toLowerCase().includes(q)) return;
        
        const item = document.createElement('div');
        item.className = 'sidebar-list-item' + (index === activeTabIndex ? ' active' : '');
        item.innerHTML = `<span class="icon">📄</span><span class="tab-title-text" style="flex:1"></span>`;
        item.querySelector('.tab-title-text').textContent = tab.title;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerText = '×';
        closeBtn.onclick = (e) => {
          e.stopPropagation();
          this.callbacks.closeTab(index);
        };
        
        item.appendChild(closeBtn);
        item.onclick = () => this.callbacks.switchTab(index);
        listContainer.appendChild(item);
      });
    };
    
    renderList();
    searchInput.oninput = (e) => renderList(e.target.value);
  },

  renderSidebarFuncList(container) {
    const activeTabIndex = this.callbacks.getActiveTabIndex();
    const editor = this.callbacks.getEditor();
    
    if (activeTabIndex === -1 || !editor) {
      container.innerHTML = '<div style="padding: 10px; color: #888;">No active document</div>';
      return;
    }
    
    const text = editor.getValue();
    const lines = text.split('\n');
    const functions = [];
    
    // Very basic regex to match standard functions and classes
    const funcRegex = /^(?:export\s+)?(?:async\s+)?(?:function\s+([a-zA-Z0-9_]+)|(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>|class\s+([a-zA-Z0-9_]+))/;
    
    lines.forEach((line, idx) => {
      const match = line.trim().match(funcRegex);
      if (match) {
        const name = match[1] || match[2] || match[3];
        if (name) {
          functions.push({ name, line: idx + 1 });
        }
      }
    });
    
    if (functions.length === 0) {
      container.innerHTML = '<div style="padding: 10px; color: #888;">No functions found</div>';
      return;
    }
    
    // Add search input
    const searchContainer = document.createElement('div');
    searchContainer.style.padding = '8px';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search functions...';
    searchInput.className = 'sidebar-search-input';
    searchContainer.appendChild(searchInput);
    container.appendChild(searchContainer);
    
    const listContainer = document.createElement('div');
    listContainer.className = 'sidebar-list-container';
    container.appendChild(listContainer);
    
    const renderList = (query = '') => {
      listContainer.innerHTML = '';
      const q = query.toLowerCase();
      
      functions.forEach(func => {
        if (q && !func.name.toLowerCase().includes(q)) return;
        
        const item = document.createElement('div');
        item.className = 'sidebar-list-item';
        item.innerHTML = `<span class="icon">ƒ</span> <span class="func-name-text"></span>`;
        item.querySelector('.func-name-text').textContent = func.name;
        item.title = `Line ${func.line}`;
        item.onclick = () => {
          editor.revealLineInCenter(func.line);
          editor.setPosition({ lineNumber: func.line, column: 1 });
          editor.focus();
        };
        
        listContainer.appendChild(item);
      });
    };
    
    renderList();
    searchInput.oninput = (e) => renderList(e.target.value);
  },

  async renderSidebarWorkspace(container) {
    if (!window.showDirectoryPicker) {
      container.innerHTML = '<div style="padding:10px;">Tu navegador no soporta la API de File System Access para abrir carpetas locales.</div>';
      return;
    }
    
    if (!this.workspaceHandle) {
      const btnContainer = document.createElement('div');
      btnContainer.style.padding = '10px';
      const btn = document.createElement('button');
      btn.innerText = '📂 Open Folder...';
      btn.style.cssText = 'padding: 6px 12px; cursor: pointer;';
      btn.onclick = async () => {
        try {
          this.workspaceHandle = await window.showDirectoryPicker();
          await WorkspaceDB.save(this.workspaceHandle);
          this.updateSidebarContent();
        } catch (err) {
          console.log("Directory picker cancelled or failed", err);
        }
      };
      btnContainer.appendChild(btn);
      container.appendChild(btnContainer);
      return;
    }
    
    // Add a header showing the open folder with a close button
    const header = document.createElement('div');
    header.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:6px 10px; background:var(--bg-secondary); border-bottom:1px solid var(--border-dark); font-size:12px; color:var(--text-primary);';
    header.innerHTML = `<span title="${this.workspaceHandle.name}">📁 <strong>${this.workspaceHandle.name}</strong></span>`;
    const closeFolderBtn = document.createElement('button');
    closeFolderBtn.innerText = '✕';
    closeFolderBtn.title = 'Close Folder';
    closeFolderBtn.style.cssText = 'background:none; border:none; color:var(--text-primary); cursor:pointer; font-size:14px; line-height:1;';
    closeFolderBtn.onclick = async () => {
      this.workspaceHandle = null;
      await WorkspaceDB.clear();
      this.updateSidebarContent();
    };
    header.appendChild(closeFolderBtn);
    container.appendChild(header);
    const openFoldersKey = `writepad_ws_open_${this.workspaceHandle.name}`;
    let openFolders = new Set(JSON.parse(localStorage.getItem(openFoldersKey) || '[]'));
    
    const saveOpenFolders = () => {
      localStorage.setItem(openFoldersKey, JSON.stringify([...openFolders]));
    };

    const buildTree = async (handle, parentEl, currentPath = '') => {
      for await (const entry of handle.values()) {
        const fullPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
        const item = document.createElement('div');
        item.className = 'tree-item';
        
        if (entry.kind === 'file') {
          item.innerHTML = `<span class="icon">📄</span> <span class="node-name"></span>`;
          item.querySelector('.node-name').textContent = entry.name;
          item.onclick = async () => {
            try {
              const file = await entry.getFile();
              const text = await file.text();
              const tabs = this.callbacks.getTabs();
              
              // Check if already open
              const existingIdx = tabs.findIndex(t => t.fileHandle && t.fileHandle.name === entry.name);
              if (existingIdx !== -1) {
                this.callbacks.switchTab(existingIdx);
                return;
              }
              
              tabs.push({
                title: file.name,
                model: monaco.editor.createModel(text, this.callbacks.getLanguageFromExt(file.name)),
                fileHandle: entry,
                unsavedDecos: [],
                savedDecos: []
              });
              this.callbacks.switchTab(tabs.length - 1);
              this.callbacks.renderTabs();
            } catch(err) {
              ToastManager.error("Error opening file: " + err.message);
            }
          };
          parentEl.appendChild(item);
        } else if (entry.kind === 'directory') {
          item.innerHTML = `<span class="icon">📁</span> <span class="node-name"></span>`;
          item.querySelector('.node-name').textContent = entry.name;
          
          const childrenContainer = document.createElement('div');
          childrenContainer.className = 'tree-folder-children';
          childrenContainer.style.paddingLeft = '15px';
          
          item.onclick = async (e) => {
            e.stopPropagation();
            const isOpen = childrenContainer.classList.contains('open');
            if (isOpen) {
              childrenContainer.classList.remove('open');
              item.querySelector('.icon').innerText = '📁';
              openFolders.delete(fullPath);
              saveOpenFolders();
            } else {
              childrenContainer.classList.add('open');
              item.querySelector('.icon').innerText = '📂';
              openFolders.add(fullPath);
              saveOpenFolders();
              if (childrenContainer.childNodes.length === 0) {
                item.querySelector('.icon').innerHTML = '<span class="loading-spinner" style="font-size:10px;">⏳</span>';
                try {
                  await buildTree(entry, childrenContainer, fullPath);
                } finally {
                  item.querySelector('.icon').innerText = '📂';
                }
              }
            }
          };
          
          const wrapper = document.createElement('div');
          wrapper.appendChild(item);
          wrapper.appendChild(childrenContainer);
          parentEl.appendChild(wrapper);

          // Restore open state
          if (openFolders.has(fullPath)) {
            childrenContainer.classList.add('open');
            item.querySelector('.icon').innerHTML = '<span class="loading-spinner" style="font-size:10px;">⏳</span>';
            try {
              await buildTree(entry, childrenContainer, fullPath);
            } finally {
              item.querySelector('.icon').innerText = '📂';
            }
          }
        }
      }
    };
    
    const root = document.createElement('div');
    root.style.padding = '5px 0';
    await buildTree(this.workspaceHandle, root);
    container.appendChild(root);
  },

  async restoreWorkspaceHandle() {
    if (!window.showDirectoryPicker) return;
    try {
      const handle = await WorkspaceDB.load();
      if (!handle) return;
      // Check permission
      const permission = await handle.queryPermission({ mode: 'read' });
      if (permission === 'granted') {
        this.workspaceHandle = handle;
      } else {
        // DO NOT requestPermission on load because it throws DOMException requiring user gesture
        console.warn('Workspace needs permission. Open manually.');
      }
    } catch (e) {
      console.warn('Could not restore workspace handle', e);
    }
  }
};
