import * as monaco from 'monaco-editor';

export const MenuManager = {
  callbacks: {},

  init(callbacks) {
    this.callbacks = callbacks;
    this.setupDropdowns();
    this.setupMenuMappings();
    this.setupLanguageMappings();
    this.setupSettingsMappings();
    this.setupEncodingMappings();
    this.setupToolsMappings();
  },

  closeAllDropdowns() {
    document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
  },

  setupDropdowns() {
    document.querySelectorAll('.menu-item').forEach(item => {
      if (item.hasAttribute('data-menu')) {
        item.onclick = (e) => {
          e.stopPropagation();
          const menuId = item.getAttribute('data-menu');
          
          const dropdown = document.getElementById(`dropdown-${menuId}`);
          if (!dropdown) {
             this.closeAllDropdowns();
             return;
          }
          
          const isShowing = dropdown.classList.contains('show');
          this.closeAllDropdowns();
          
          if (!isShowing) {
            dropdown.classList.add('show');
            item.classList.add('active');
          }
        };
      }
      
      item.onmouseenter = () => {
        const isAnyOpen = Array.from(document.querySelectorAll('.dropdown-content')).some(d => d.classList.contains('show'));
        if (isAnyOpen && !item.classList.contains('active')) {
          const menuId = item.getAttribute('data-menu');
          if (menuId && document.getElementById(`dropdown-${menuId}`)) {
            item.click();
          }
        }
      };
    });

    document.onclick = (e) => {
      if (!e.target.closest('.menu-item-container')) {
        this.closeAllDropdowns();
      }
    };
  },

  setupMenuMappings() {
    const menuMapping = {
      'menu-file-new': 'btn-new',
      'menu-file-open': 'btn-open',
      'menu-file-save': 'btn-save',
      'menu-file-saveall': 'btn-save-all',
      'menu-file-close': 'btn-close',
      'menu-file-closeall': 'btn-close-all',
      'menu-file-print': 'btn-print',
      'menu-edit-cut': 'btn-cut',
      'menu-edit-copy': 'btn-copy',
      'menu-edit-paste': 'btn-paste',
      'menu-edit-undo': 'btn-undo',
      'menu-edit-redo': 'btn-redo',
      'menu-edit-format': 'btn-format',
      'menu-search-find': 'btn-find',
      'menu-search-replace': 'btn-replace',
      'menu-view-zoomin': 'btn-zoom-in',
      'menu-view-zoomout': 'btn-zoom-out',
      'menu-view-wordwrap': 'btn-word-wrap',
      'menu-view-invisibles': 'btn-invisibles',
      'menu-view-monitor': 'btn-monitor',
      'menu-view-minimap': 'btn-minimap',
      'menu-macro-record': 'btn-macro-record',
      'menu-macro-stop': 'btn-macro-stop',
      'menu-macro-play': 'btn-macro-play'
    };

    for (const [menuId, btnId] of Object.entries(menuMapping)) {
      const el = document.getElementById(menuId);
      if (el) {
        el.onclick = (e) => {
          e.stopPropagation();
          document.getElementById(btnId).click();
          this.closeAllDropdowns();
          
          if (menuId === 'menu-view-wordwrap') el.classList.toggle('checked', this.callbacks.getIsWordWrap());
          if (menuId === 'menu-view-invisibles') el.classList.toggle('checked', this.callbacks.getShowInvisibles());
          if (menuId === 'menu-view-minimap') el.classList.toggle('checked', this.callbacks.getMinimapEnabled());
        };
      }
    }

    const paletteBtn = document.getElementById('menu-edit-palette');
    if (paletteBtn) {
      paletteBtn.onclick = (e) => {
        e.stopPropagation();
        this.callbacks.getEditor().trigger('keyboard', 'editor.action.quickCommand');
        this.closeAllDropdowns();
      };
    }

    const formatBtn = document.getElementById('menu-edit-format');
    if (formatBtn) {
      formatBtn.onclick = (e) => {
        e.stopPropagation();
        this.callbacks.getEditor().getAction('editor.action.formatDocument').run();
        this.closeAllDropdowns();
      };
    }
  },

  setupLanguageMappings() {
    document.querySelectorAll('#dropdown-language .dropdown-item').forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        const activeTabIndex = this.callbacks.getActiveTabIndex();
        const tabs = this.callbacks.getTabs();
        
        if (activeTabIndex !== -1) {
          const lang = item.getAttribute('data-lang');
          monaco.editor.setModelLanguage(tabs[activeTabIndex].model, lang);
          
          document.querySelectorAll('#dropdown-language .dropdown-item').forEach(i => i.classList.remove('checked'));
          item.classList.add('checked');
        }
        this.closeAllDropdowns();
      };
    });
  },

  setupEncodingMappings() {
    document.querySelectorAll('#dropdown-encoding .dropdown-item').forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        
        const activeTabIndex = this.callbacks.getActiveTabIndex();
        const tabs = this.callbacks.getTabs();
        
        if (activeTabIndex !== -1) {
          const tab = tabs[activeTabIndex];
          
          if (item.hasAttribute('data-encoding')) {
            const enc = item.getAttribute('data-encoding');
            tab.encoding = enc;
            this.updateEncodingChecks(enc);
            if (this.callbacks.updateStatusBar) this.callbacks.updateStatusBar();
          } else if (item.hasAttribute('data-convert')) {
            const enc = item.getAttribute('data-convert');
            tab.encoding = enc;
            this.updateEncodingChecks(enc);
            if (this.callbacks.updateStatusBar) this.callbacks.updateStatusBar();
          }
        }
        
        this.closeAllDropdowns();
      };
    });
  },

  updateEncodingChecks(currentEncoding) {
    document.querySelectorAll('#dropdown-encoding .dropdown-item').forEach(i => {
      if (i.hasAttribute('data-encoding')) {
        if (i.getAttribute('data-encoding') === currentEncoding) {
          i.classList.add('checked');
        } else {
          i.classList.remove('checked');
        }
      }
    });
  },

  setupToolsMappings() {
    document.querySelectorAll('.tool-action').forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        
        const toolAction = item.getAttribute('data-tool');
        if (toolAction && this.callbacks.handleToolAction) {
          this.callbacks.handleToolAction(toolAction);
        }
        
        this.closeAllDropdowns();
      };
    });
  },

  setupSettingsMappings() {
    const dropdown = document.getElementById('dropdown-themes');
    const sel = document.getElementById('theme-selector');
    if (!dropdown || !sel) return;
    
    dropdown.innerHTML = '';
    
    Array.from(sel.children).forEach(child => {
      if (child.tagName === 'OPTGROUP') {
        const groupTitle = document.createElement('div');
        groupTitle.className = 'dropdown-item';
        groupTitle.style.fontWeight = 'bold';
        groupTitle.style.pointerEvents = 'none';
        groupTitle.innerText = child.label;
        dropdown.appendChild(groupTitle);
        
        Array.from(child.children).forEach(opt => {
          const item = document.createElement('div');
          item.className = 'dropdown-item';
          item.style.paddingLeft = '30px';
          item.innerText = opt.text;
          
          item.onclick = (e) => {
            e.stopPropagation();
            sel.value = opt.value;
            sel.dispatchEvent(new Event('change'));
            dropdown.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('checked'));
            item.classList.add('checked');
            this.closeAllDropdowns();
          };
          
          if (sel.value === opt.value) {
            item.classList.add('checked');
          }
          
          dropdown.appendChild(item);
        });
        
        const sep = document.createElement('div');
        sep.className = 'dropdown-separator';
        dropdown.appendChild(sep);
      }
    });
  }
};
