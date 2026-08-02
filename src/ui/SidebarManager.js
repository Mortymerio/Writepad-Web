import * as monaco from 'monaco-editor';

export const SidebarManager = {
  activeSidebar: null,
  activeRightSidebar: null,
  workspaceHandle: null,
  callbacks: {},

  init(callbacks) {
    this.callbacks = callbacks;
    window.addEventListener('macrosUpdated', () => {
      if (this.activeSidebar === 'macros') {
        this.updateSidebarContent();
      }
    });
    
    const rightCloseBtn = document.getElementById('btn-right-sidebar-close');
    if (rightCloseBtn) {
      rightCloseBtn.onclick = () => {
        if (this.activeRightSidebar) {
          this.toggleSidebar(this.activeRightSidebar);
        }
      };
    }
  },

  toggleSidebar(panelName) {
    const editor = this.callbacks.getEditor();
    
    if (['gtfobins', 'revshell', 'sqli', 'linpeas', 'winpeas', 'encoder', 'hashcat', 'lfi', 'xss'].includes(panelName)) {
      const rightSidebar = document.getElementById('right-sidebar');
      const rightTitle = document.getElementById('right-sidebar-title');
      
      if (this.activeRightSidebar === panelName) {
        rightSidebar.style.display = 'none';
        this.activeRightSidebar = null;
      } else {
        rightSidebar.style.display = 'flex';
        this.activeRightSidebar = panelName;
        
        if (panelName === 'gtfobins') rightTitle.innerText = 'GTFOBins Wiki';
        if (panelName === 'revshell') rightTitle.innerText = 'Reverse Shell Generator';
        if (panelName === 'sqli') rightTitle.innerText = 'SQLi Cheat Sheet';
        if (panelName === 'linpeas') rightTitle.innerText = 'LinPEAS Guide';
        if (panelName === 'winpeas') rightTitle.innerText = 'WinPEAS Guide';
        if (panelName === 'encoder') rightTitle.innerText = 'Encoder / Decoder';
        if (panelName === 'hashcat') rightTitle.innerText = 'Hash Identifier & Cracker';
        if (panelName === 'lfi') rightTitle.innerText = 'LFI / Traversal Wiki';
        if (panelName === 'xss') rightTitle.innerText = 'XSS Polyglot Generator';
        
        const rightContent = document.getElementById('right-sidebar-content');
        rightContent.innerHTML = '';
        
        if (panelName === 'gtfobins') this.renderSidebarGTFOBins(rightContent);
        if (panelName === 'revshell') this.renderSidebarRevShell(rightContent);
        if (panelName === 'sqli') this.renderSidebarSQLi(rightContent);
        if (panelName === 'linpeas') this.renderSidebarPeas(rightContent, 'linpeas');
        if (panelName === 'winpeas') this.renderSidebarPeas(rightContent, 'winpeas');
        if (panelName === 'encoder') this.renderSidebarEncoder(rightContent);
        if (panelName === 'hashcat') this.renderSidebarHashCracker(rightContent);
        if (panelName === 'lfi') this.renderSidebarLFI(rightContent);
        if (panelName === 'xss') this.renderSidebarXSS(rightContent);
      }
      if (editor) setTimeout(() => editor.layout(), 10);
      return;
    }

    const sidebar = document.getElementById('sidebar');
    const title = document.getElementById('sidebar-title');
    
    // Toggle off if clicking the same button
    if (this.activeSidebar === panelName || panelName === null) {
      sidebar.style.display = 'none';
      this.activeSidebar = null;
      if (editor) setTimeout(() => editor.layout(), 10);
      return;
    }
    
    sidebar.style.display = 'flex';
    this.activeSidebar = panelName;
    
    if (panelName === 'doc') title.innerText = 'Document List';
    if (panelName === 'func') title.innerText = 'Function List';
    if (panelName === 'workspace') title.innerText = 'Workspace';
    if (panelName === 'macros') title.innerText = 'Saved Macros';
    
    this.updateSidebarContent();
    if (editor) setTimeout(() => editor.layout(), 10);
  },

  async updateSidebarContent() {
    if (!this.activeSidebar) return;
    const content = document.getElementById('sidebar-content');
    content.innerHTML = '';
    
    if (this.activeSidebar === 'doc') {
      this.renderSidebarDocList(content);
    } else if (this.activeSidebar === 'func') {
      this.renderSidebarFuncList(content);
    } else if (this.activeSidebar === 'workspace') {
      await this.renderSidebarWorkspace(content);
    } else if (this.activeSidebar === 'macros') {
      this.renderSidebarMacros(content);
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
    
    tabs.forEach((tab, index) => {
      const item = document.createElement('div');
      item.className = 'sidebar-list-item' + (index === activeTabIndex ? ' active' : '');
      item.innerHTML = `<span class="icon">📄</span><span style="flex:1">${tab.title}</span>`;
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn';
      closeBtn.innerText = '×';
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        this.callbacks.closeTab(index);
      };
      
      item.appendChild(closeBtn);
      item.onclick = () => this.callbacks.switchTab(index);
      container.appendChild(item);
    });
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
    
    functions.forEach(func => {
      const item = document.createElement('div');
      item.className = 'sidebar-list-item';
      item.innerHTML = `<span class="icon">ƒ</span> ${func.name}`;
      item.title = `Line ${func.line}`;
      item.onclick = () => {
        editor.revealLineCenter(func.line);
        editor.setPosition({ lineNumber: func.line, column: 1 });
        editor.focus();
      };
      
      container.appendChild(item);
    });
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
      btn.innerText = 'Open Folder...';
      btn.onclick = async () => {
        try {
          this.workspaceHandle = await window.showDirectoryPicker();
          this.updateSidebarContent();
        } catch (err) {
          console.log("Directory picker cancelled or failed", err);
        }
      };
      btnContainer.appendChild(btn);
      container.appendChild(btnContainer);
      return;
    }
    
    const buildTree = async (handle, parentEl) => {
      for await (const entry of handle.values()) {
        const item = document.createElement('div');
        item.className = 'tree-item';
        
        if (entry.kind === 'file') {
          item.innerHTML = `<span class="icon">📄</span> ${entry.name}`;
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
              alert("Error opening file: " + err.message);
            }
          };
          parentEl.appendChild(item);
        } else if (entry.kind === 'directory') {
          item.innerHTML = `<span class="icon">📁</span> ${entry.name}`;
          
          const childrenContainer = document.createElement('div');
          childrenContainer.className = 'tree-folder-children';
          childrenContainer.style.paddingLeft = '15px';
          
          item.onclick = async (e) => {
            e.stopPropagation();
            const isOpen = childrenContainer.classList.contains('open');
            if (isOpen) {
              childrenContainer.classList.remove('open');
              item.querySelector('.icon').innerText = '📁';
            } else {
              childrenContainer.classList.add('open');
              item.querySelector('.icon').innerText = '📂';
              if (childrenContainer.childNodes.length === 0) {
                await buildTree(entry, childrenContainer);
              }
            }
          };
          
          const wrapper = document.createElement('div');
          wrapper.appendChild(item);
          wrapper.appendChild(childrenContainer);
          parentEl.appendChild(wrapper);
        }
      }
    };
    
    const root = document.createElement('div');
    root.style.padding = '5px 0';
    await buildTree(this.workspaceHandle, root);
    container.appendChild(root);
  }
};
