import * as monaco from 'monaco-editor';
import { ToastManager } from './ToastManager.js';
import { RepeaterPanel } from './RepeaterPanel.js';

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
  callbacks: {},
  activeSidebar: null,
  activeRightSidebar: null,
  
  rightPanels: {},

  registerRightPanel(id, title, renderFn) {
    this.rightPanels[id] = { title, render: renderFn };
  },

  async init(callbacks) {
    this.callbacks = callbacks;
    
    // Core panels
    this.registerRightPanel('restclient', 'REST API Client', (c) => this.renderSidebarRestClient(c));
    this.registerRightPanel('md-preview', 'Markdown Preview', (c) => this.renderSidebarMdPreview(c));
    this.registerRightPanel('gtfobins', 'GTFOBins Wiki', (c) => this.renderSidebarGTFOBins(c));
    this.registerRightPanel('revshell', 'Reverse Shell Generator', (c) => this.renderSidebarRevShell(c));
    this.registerRightPanel('sqli', 'SQLi Cheat Sheet', (c) => this.renderSidebarSQLi(c));
    this.registerRightPanel('linpeas', 'LinPEAS Guide', (c) => this.renderSidebarPeas(c, 'linpeas'));
    this.registerRightPanel('winpeas', 'WinPEAS Guide', (c) => this.renderSidebarPeas(c, 'winpeas'));
    this.registerRightPanel('encoder', 'Encoder / Decoder', (c) => this.renderSidebarEncoder(c));
    this.registerRightPanel('hashcat', 'Hash Identifier & Cracker', (c) => this.renderSidebarHashCracker(c));
    this.registerRightPanel('regex-tester', 'Regex Tester', (c) => this.renderSidebarRegexTester(c));
    this.registerRightPanel('lfi', 'LFI / Traversal Wiki', (c) => this.renderSidebarLFI(c));
    this.registerRightPanel('xss', 'XSS Polyglot Generator', (c) => this.renderSidebarXSS(c));
    this.registerRightPanel('repeater', 'HTTP Repeater', (c) => this.renderSidebarRepeater(c));
    
    // New HTB panels
    this.registerRightPanel('nmap-parser', 'Nmap Auto-Parser', (c) => this.renderSidebarNmapParser(c));
    this.registerRightPanel('cmd-builder', 'Command Builder', (c) => this.renderSidebarCmdBuilder(c));
    this.registerRightPanel('tpl-gen', 'Template Generator', (c) => this.renderSidebarTplGen(c));
    this.registerRightPanel('tty-stab', 'TTY Stabilizer', (c) => this.renderSidebarTtyStab(c));
    this.registerRightPanel('recipe', 'Recipe Pipeline', (c) => this.renderSidebarRecipe(c));

    // God-Tier HTB / OSCP Panels
    this.registerRightPanel('ad-pivot', 'AD & Pivoting Maestro', (c) => this.renderSidebarADPivot(c));
    this.registerRightPanel('obfuscator', 'Payload Obfuscator', (c) => this.renderSidebarObfuscator(c));
    this.registerRightPanel('peas-analyzer', 'PEAS Auto-Analyzer', (c) => this.renderSidebarPeasAnalyzer(c));

    // AI Agents
    this.registerRightPanel('agents', 'AI Agents', (c) => this.renderSidebarAgents(c));

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
    
    if (this.rightPanels[panelName]) {
      const rightSidebar = document.getElementById('right-sidebar');
      const rightTitle = document.getElementById('right-sidebar-title');
      const rightResizeHandle = document.getElementById('right-sidebar-resize-handle');
        
      if (this.activeRightSidebar === panelName) {
        rightSidebar.classList.add('hidden'); rightSidebar.classList.remove('flex');
        if (rightResizeHandle) rightResizeHandle.style.display = 'none';
        this.activeRightSidebar = null;
      } else {
        rightSidebar.classList.remove('hidden'); rightSidebar.classList.add('flex');
        if (rightResizeHandle) rightResizeHandle.style.display = 'block';
        this.activeRightSidebar = panelName;
        
        rightTitle.innerText = this.rightPanels[panelName].title;
        
        const rightContent = document.getElementById('right-sidebar-content');
        rightContent.innerHTML = '';
        
        this.rightPanels[panelName].render(rightContent);
      }
      this.updateButtonStates();
      if (editor) setTimeout(() => editor.layout(), 10);
      return;
    }

    const sidebar = document.getElementById('sidebar');
    const title = document.getElementById('sidebar-title');
    const resizeHandle = document.getElementById('sidebar-resize-handle');
    
    if (this.activeSidebar === panelName || panelName === null) {
      sidebar.classList.add('hidden'); sidebar.classList.remove('flex');
      if (resizeHandle) resizeHandle.style.display = 'none';
      this.activeSidebar = null;
      localStorage.removeItem('writepad_active_left_sidebar');
      this.updateButtonStates();
      if (editor) setTimeout(() => editor.layout(), 10);
      return;
    }
    
    sidebar.classList.remove('hidden'); sidebar.classList.add('flex');
    if (resizeHandle) resizeHandle.style.display = 'block';
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
    
    // Automatically extract rightMap from rightPanels keys
    const rightMap = {};
    Object.keys(this.rightPanels).forEach(key => rightMap[key] = 'btn-' + key);
    
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

  renderSidebarRepeater(container) {
    if (!window.RepeaterPanel) {
      import('./RepeaterPanel.js').then(({ RepeaterPanel }) => {
        window.RepeaterPanel = RepeaterPanel;
        RepeaterPanel.init(this.callbacks);
        RepeaterPanel.renderSidebar(container);
      });
    } else {
      window.RepeaterPanel.init(this.callbacks);
      window.RepeaterPanel.renderSidebar(container);
    }
  },

  renderSidebarNmapParser(container) {
    if (!window.NmapParserPanel) {
      import('./NmapParserPanel.js').then(({ NmapParserPanel }) => {
        window.NmapParserPanel = NmapParserPanel;
        NmapParserPanel.init(this.callbacks);
        NmapParserPanel.renderSidebar(container);
      });
    } else {
      window.NmapParserPanel.init(this.callbacks);
      window.NmapParserPanel.renderSidebar(container);
    }
  },

  renderSidebarCmdBuilder(container) {
    if (!window.CommandBuilderPanel) {
      import('./CommandBuilderPanel.js').then(({ CommandBuilderPanel }) => {
        window.CommandBuilderPanel = CommandBuilderPanel;
        CommandBuilderPanel.init(this.callbacks);
        CommandBuilderPanel.renderSidebar(container);
      });
    } else {
      window.CommandBuilderPanel.init(this.callbacks);
      window.CommandBuilderPanel.renderSidebar(container);
    }
  },

  renderSidebarTplGen(container) {
    if (!window.TemplateGeneratorPanel) {
      import('./TemplateGeneratorPanel.js').then(({ TemplateGeneratorPanel }) => {
        window.TemplateGeneratorPanel = TemplateGeneratorPanel;
        TemplateGeneratorPanel.init(this.callbacks);
        TemplateGeneratorPanel.renderSidebar(container);
      });
    } else {
      window.TemplateGeneratorPanel.init(this.callbacks);
      window.TemplateGeneratorPanel.renderSidebar(container);
    }
  },

  renderSidebarTtyStab(container) {
    if (!window.TTYStabilizerPanel) {
      import('./TTYStabilizerPanel.js').then(({ TTYStabilizerPanel }) => {
        window.TTYStabilizerPanel = TTYStabilizerPanel;
        TTYStabilizerPanel.init(this.callbacks);
        TTYStabilizerPanel.renderSidebar(container);
      });
    } else {
      window.TTYStabilizerPanel.init(this.callbacks);
      window.TTYStabilizerPanel.renderSidebar(container);
    }
  },

  renderSidebarRecipe(container) {
    if (!window.RecipePipelinePanel) {
      import('./RecipePipelinePanel.js').then(({ RecipePipelinePanel }) => {
        window.RecipePipelinePanel = RecipePipelinePanel;
        RecipePipelinePanel.init(this.callbacks);
        RecipePipelinePanel.renderSidebar(container);
      });
    } else {
      window.RecipePipelinePanel.init(this.callbacks);
      window.RecipePipelinePanel.renderSidebar(container);
    }
  },

  renderSidebarADPivot(container) {
    if (!window.ADPivotPanel) {
      import('./ADPivotPanel.js').then(({ ADPivotPanel }) => {
        window.ADPivotPanel = ADPivotPanel;
        ADPivotPanel.init(this.callbacks);
        ADPivotPanel.renderSidebar(container);
      });
    } else {
      window.ADPivotPanel.init(this.callbacks);
      window.ADPivotPanel.renderSidebar(container);
    }
  },

  renderSidebarObfuscator(container) {
    if (!window.ObfuscatorPanel) {
      import('./ObfuscatorPanel.js').then(({ ObfuscatorPanel }) => {
        window.ObfuscatorPanel = ObfuscatorPanel;
        ObfuscatorPanel.init(this.callbacks);
        ObfuscatorPanel.renderSidebar(container);
      });
    } else {
      window.ObfuscatorPanel.init(this.callbacks);
      window.ObfuscatorPanel.renderSidebar(container);
    }
  },

  renderSidebarPeasAnalyzer(container) {
    if (!window.PeasAnalyzerPanel) {
      import('./PeasAnalyzerPanel.js').then(({ PeasAnalyzerPanel }) => {
        window.PeasAnalyzerPanel = PeasAnalyzerPanel;
        PeasAnalyzerPanel.init(this.callbacks);
        PeasAnalyzerPanel.renderSidebar(container);
      });
    } else {
      window.PeasAnalyzerPanel.init(this.callbacks);
      window.PeasAnalyzerPanel.renderSidebar(container);
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
      container.innerHTML = '<div class="sidebar-empty">No saved macros</div>';
      return;
    }

    macros.forEach(macro => {
      const item = document.createElement('div');
      item.className = 'sidebar-list-item';
      item.classList.add('sidebar-item');
      
      
      
      const nameSpan = document.createElement('span');
      nameSpan.innerText = macro.name;
      nameSpan.classList.add('sidebar-item__name');
      
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
    searchContainer.classList.add('sidebar-search');
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
        item.innerHTML = `<span class="icon">📄</span><span class="tab-title-text" class="sidebar-item__name"></span>`;
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
      container.innerHTML = '<div class="sidebar-empty">No active document</div>';
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
      container.innerHTML = '<div class="sidebar-empty">No functions found</div>';
      return;
    }
    
    // Add search input
    const searchContainer = document.createElement('div');
    searchContainer.classList.add('sidebar-search');
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
      container.innerHTML = '<div class="sidebar-empty">Tu navegador no soporta la API de File System Access para abrir carpetas locales.</div>';
      return;
    }
    
    if (!this.workspaceHandle) {
      const btnContainer = document.createElement('div');
      btnContainer.classList.add('sidebar-search');
      const btn = document.createElement('button');
      btn.innerText = '📂 Open Folder...';
      btn.className = 'sidebar-btn';
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
    header.className = 'sidebar-header';
    header.innerHTML = `<span title="${this.workspaceHandle.name}">📁 <strong>${this.workspaceHandle.name}</strong></span>`;
    const closeFolderBtn = document.createElement('button');
    closeFolderBtn.innerText = '✕';
    closeFolderBtn.title = 'Close Folder';
    closeFolderBtn.className = 'sidebar-close-btn';
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
          childrenContainer.className = 'sidebar-tree__children';
          
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
                item.querySelector('.icon').innerHTML = '<span class="loading-spinner" class="sidebar-spinner">⏳</span>';
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
            item.querySelector('.icon').innerHTML = '<span class="loading-spinner" class="sidebar-spinner">⏳</span>';
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
    root.className = 'sidebar-tree';
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
  },

  async renderSidebarAgents(container) {
    const { AgentPanel } = await import('./AgentPanel.js');
    if (!this._agentPanelInstance) {
      this._agentPanelInstance = new AgentPanel(this.callbacks);
    }
    this._agentPanelInstance.render(container);
  }
};
