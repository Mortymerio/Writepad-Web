import * as monaco from 'monaco-editor';

export const DiffViewerModal = {
  callbacks: {},
  diffEditor: null,
  diffContainer: null,

  init(callbacks) {
    this.callbacks = callbacks;
    
    // Bind UI
    const menuBtn = document.getElementById('menu-view-compare');
    if (menuBtn) {
      menuBtn.onclick = (e) => {
        e.stopPropagation();
        this.callbacks.closeAllDropdowns();
        this.showSelectionModal();
      };
    }

    const closeBtn = document.getElementById('btn-close-diff-select');
    if (closeBtn) {
      closeBtn.onclick = () => {
        document.getElementById('diff-select-modal').style.display = 'none';
      };
    }

    const confirmBtn = document.getElementById('btn-confirm-diff');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        document.getElementById('diff-select-modal').style.display = 'none';
        const targetId = document.getElementById('diff-target-tab').value;
        if (targetId) this.openDiffEditor(targetId);
      };
    }
  },

  showSelectionModal() {
    const tabs = this.callbacks.getTabs();
    const activeIndex = this.callbacks.getActiveTabIndex();
    if (activeIndex === -1 || tabs.length < 2) {
      alert("You need at least two open tabs to compare.");
      return;
    }

    const select = document.getElementById('diff-target-tab');
    select.innerHTML = '';
    
    tabs.forEach((tab, index) => {
      if (index !== activeIndex) {
        const opt = document.createElement('option');
        opt.value = index;
        opt.innerText = tab.title || `Tab ${index + 1}`;
        select.appendChild(opt);
      }
    });

    document.getElementById('diff-select-modal').style.display = 'flex';
  },

  openDiffEditor(targetIndex) {
    const tabs = this.callbacks.getTabs();
    const activeIndex = this.callbacks.getActiveTabIndex();
    
    const originalModel = tabs[targetIndex].model;
    const modifiedModel = tabs[activeIndex].model;

    // Create a full screen overlay for the DiffEditor
    if (!this.diffContainer) {
      this.diffContainer = document.createElement('div');
      this.diffContainer.style.position = 'fixed';
      this.diffContainer.style.top = '0';
      this.diffContainer.style.left = '0';
      this.diffContainer.style.width = '100vw';
      this.diffContainer.style.height = '100vh';
      this.diffContainer.style.zIndex = '9999';
      this.diffContainer.style.backgroundColor = 'var(--bg-primary)';
      this.diffContainer.style.display = 'flex';
      this.diffContainer.style.flexDirection = 'column';

      const header = document.createElement('div');
      header.style.padding = '10px 20px';
      header.style.background = 'var(--bg-secondary)';
      header.style.borderBottom = '1px solid var(--border-light)';
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      
      const title = document.createElement('div');
      title.id = 'diff-title';
      title.style.fontWeight = 'bold';
      
      const closeBtn = document.createElement('button');
      closeBtn.innerText = 'Close Compare';
      closeBtn.style.padding = '5px 15px';
      closeBtn.style.background = 'var(--bg-active)';
      closeBtn.style.color = 'var(--text-primary)';
      closeBtn.style.border = '1px solid var(--border-light)';
      closeBtn.style.cursor = 'pointer';
      closeBtn.onclick = () => {
        this.diffContainer.style.display = 'none';
        if (this.diffEditor) {
          this.diffEditor.dispose();
          this.diffEditor = null;
        }
      };

      header.appendChild(title);
      header.appendChild(closeBtn);
      
      const editorDiv = document.createElement('div');
      editorDiv.id = 'diff-editor-container';
      editorDiv.style.flex = '1';
      editorDiv.style.width = '100%';

      this.diffContainer.appendChild(header);
      this.diffContainer.appendChild(editorDiv);
      document.body.appendChild(this.diffContainer);
    }

    document.getElementById('diff-title').innerText = `Comparing: ${tabs[targetIndex].title || 'Untitled'} (Original) vs ${tabs[activeIndex].title || 'Untitled'} (Modified)`;
    this.diffContainer.style.display = 'flex';

    const editorDiv = document.getElementById('diff-editor-container');
    
    // We pass the current theme
    const isDark = document.body.classList.contains('cyber-mode') || document.documentElement.getAttribute('data-theme') === 'dark';
    
    this.diffEditor = monaco.editor.createDiffEditor(editorDiv, {
      theme: isDark ? 'vs-dark' : 'vs',
      automaticLayout: true,
      originalEditable: false,
      readOnly: true
    });

    this.diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel
    });
  }
};
