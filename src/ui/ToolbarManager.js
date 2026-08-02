export const ToolbarManager = {
  callbacks: {},

  init(callbacks) {
    this.callbacks = callbacks;
    this.setupBindings();
  },

  setupBindings() {
    const { 
      createNewTab, openFile, saveFile, saveAllFiles, closeCurrentTab, closeAllTabs,
      getEditor, toggleWordWrap, toggleInvisibles, toggleMinimap, toggleVim,
      macroStart, macroStop, macroPlay, macroRunMulti, macroSave
    } = this.callbacks;

    // 1. File Management
    document.getElementById('btn-new').onclick = createNewTab;
    document.getElementById('btn-open').onclick = openFile;
    document.getElementById('btn-save').onclick = saveFile;
    document.getElementById('btn-save-all').onclick = saveAllFiles;
    document.getElementById('btn-close').onclick = closeCurrentTab;
    document.getElementById('btn-close-all').onclick = closeAllTabs;
    document.getElementById('btn-print').onclick = () => window.print();

    // 2. Edit / Clipboard
    document.getElementById('btn-cut').onclick = () => {
      getEditor().focus();
      document.execCommand('cut');
    };
    document.getElementById('btn-copy').onclick = () => {
      getEditor().focus();
      document.execCommand('copy');
    };
    document.getElementById('btn-paste').onclick = async () => {
      const editor = getEditor();
      editor.focus();
      try {
        const text = await navigator.clipboard.readText();
        editor.executeEdits('paste', [{
          range: editor.getSelection(),
          text: text,
          forceMoveMarkers: true
        }]);
      } catch (err) {
        document.execCommand('paste');
      }
    };

    // 3. History
    document.getElementById('btn-undo').onclick = () => getEditor().trigger('keyboard', 'undo');
    document.getElementById('btn-redo').onclick = () => getEditor().trigger('keyboard', 'redo');

    // 4. Search
    document.getElementById('btn-find').onclick = () => getEditor().trigger('keyboard', 'actions.find');
    document.getElementById('btn-replace').onclick = () => getEditor().trigger('keyboard', 'editor.action.startFindReplaceAction');

    // 5. View & Zoom
    document.getElementById('btn-zoom-in').onclick = () => getEditor().trigger('keyboard', 'editor.action.fontZoomIn');
    document.getElementById('btn-zoom-out').onclick = () => getEditor().trigger('keyboard', 'editor.action.fontZoomOut');

    // 6. Text Formatting
    document.getElementById('btn-word-wrap').onclick = toggleWordWrap;
    document.getElementById('btn-invisibles').onclick = () => toggleInvisibles('all');
    
    const invisArrow = document.getElementById('btn-invisibles-arrow');
    const invisDropdown = document.getElementById('dropdown-invisibles');
    if (invisArrow && invisDropdown) {
      invisArrow.onclick = (e) => {
        e.stopPropagation();
        const isShowing = invisDropdown.classList.contains('show');
        document.querySelectorAll('.dropdown-content.show').forEach(el => el.classList.remove('show'));
        if (!isShowing) {
          invisDropdown.classList.add('show');
        }
      };
      
      document.querySelectorAll('#dropdown-invisibles .dropdown-item').forEach(item => {
        item.onclick = (e) => {
          e.stopPropagation();
          const type = item.getAttribute('data-invisible');
          if (type) toggleInvisibles(type);
          invisDropdown.classList.remove('show');
        };
      });
    }
    document.getElementById('btn-minimap').onclick = toggleMinimap;

    // Run
    document.getElementById('btn-run').onclick = () => {
      alert("⚡ Writepad Web: Configura un entorno de ejecución mediante plugins para correr el código.");
    };

    // VIM Mode (if available)
    const btnVim = document.getElementById('btn-vim-mode');
    if (btnVim) {
      btnVim.onclick = toggleVim;
    }

    // 9. Macro Engine
    document.getElementById('btn-macro-record').onclick = () => {
      document.getElementById('btn-macro-record').disabled = true;
      document.getElementById('btn-macro-record').style.color = 'var(--text-disabled)';
      document.getElementById('btn-macro-stop').disabled = false;
      document.getElementById('btn-macro-stop').style.color = '#ff5252';
      macroStart();
    };
    document.getElementById('btn-macro-stop').onclick = () => {
      document.getElementById('btn-macro-stop').disabled = true;
      document.getElementById('btn-macro-stop').style.color = 'var(--text-disabled)';
      document.getElementById('btn-macro-record').disabled = false;
      document.getElementById('btn-macro-record').style.color = 'var(--text-primary)';
      macroStop();
    };
    document.getElementById('btn-macro-play').onclick = macroPlay;
    document.getElementById('btn-macro-run-multi').onclick = () => {
      document.getElementById('macro-multi-modal').style.display = 'flex';
    };
    document.getElementById('btn-close-macro-multi').onclick = () => {
      document.getElementById('macro-multi-modal').style.display = 'none';
    };
    document.getElementById('btn-confirm-macro-multi').onclick = () => {
      document.getElementById('macro-multi-modal').style.display = 'none';
      const times = parseInt(document.getElementById('input-macro-times').value) || 1;
      macroRunMulti(times);
    };
    
    document.getElementById('btn-macro-save').onclick = () => {
      document.getElementById('input-macro-name').value = 'Macro ' + new Date().toLocaleTimeString();
      document.getElementById('macro-save-modal').style.display = 'flex';
    };
    document.getElementById('btn-close-macro-save').onclick = () => {
      document.getElementById('macro-save-modal').style.display = 'none';
    };
    document.getElementById('btn-confirm-macro-save').onclick = () => {
      document.getElementById('macro-save-modal').style.display = 'none';
      const name = document.getElementById('input-macro-name').value;
      macroSave(name);
    };
  }
};
