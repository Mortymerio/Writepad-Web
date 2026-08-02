export const MacroEngine = {
  isRecording: false,
  isPlaying: false,
  currentMacro: [],
  savedMacros: [],
  disposables: [],
  editor: null,

  init(editor) {
    this.editor = editor;
    this.loadSavedMacros();
  },

  startRecording() {
    if (this.isRecording) return;
    this.isRecording = true;
    this.currentMacro = [];
    console.log("Macro recording started");

    // We can't capture native commands easily, but we can capture typing and some keydowns
    this.disposables.push(this.editor.onKeyDown((e) => {
      if (!this.isRecording) return;
      const key = e.browserEvent.key;
      
      // Filter out meta/ctrl modifiers for simple macros unless it's specific commands
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      if (key === 'Backspace') {
        this.currentMacro.push({ type: 'command', cmd: 'deleteLeft' });
      } else if (key === 'Delete') {
        this.currentMacro.push({ type: 'command', cmd: 'deleteRight' });
      } else if (key === 'Enter') {
        this.currentMacro.push({ type: 'type', text: '\n' });
      } else if (key === 'ArrowUp') {
        this.currentMacro.push({ type: 'command', cmd: 'cursorUp' });
      } else if (key === 'ArrowDown') {
        this.currentMacro.push({ type: 'command', cmd: 'cursorDown' });
      } else if (key === 'ArrowLeft') {
        this.currentMacro.push({ type: 'command', cmd: 'cursorLeft' });
      } else if (key === 'ArrowRight') {
        this.currentMacro.push({ type: 'command', cmd: 'cursorRight' });
      } else if (key === 'Tab') {
        this.currentMacro.push({ type: 'command', cmd: 'tab' });
      } else if (key.length === 1) {
        // Printable character
        this.currentMacro.push({ type: 'type', text: key });
      }
    }));
  },

  stopRecording() {
    if (!this.isRecording) return;
    this.isRecording = false;
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
    console.log("Macro recording stopped. Steps:", this.currentMacro.length);
  },

  async playMacro(macro = this.currentMacro, times = 1) {
    if (!macro || macro.length === 0) return;
    this.isPlaying = true;
    
    // Disable undo stops for each step and group them if possible
    this.editor.pushUndoStop();
    
    for (let i = 0; i < times; i++) {
      for (const step of macro) {
        if (step.type === 'type') {
          this.editor.trigger('macro', 'type', { text: step.text });
        } else if (step.type === 'command') {
          this.editor.trigger('macro', step.cmd, null);
        }
      }
    }
    
    this.editor.pushUndoStop();
    this.isPlaying = false;
  },

  saveCurrentMacro(name) {
    if (this.currentMacro.length === 0) return false;
    const newMacro = {
      id: Date.now().toString(),
      name: name,
      steps: [...this.currentMacro]
    };
    this.savedMacros.push(newMacro);
    this.persist();
    return true;
  },

  deleteMacro(id) {
    this.savedMacros = this.savedMacros.filter(m => m.id !== id);
    this.persist();
  },

  getSavedMacros() {
    return this.savedMacros;
  },

  persist() {
    localStorage.setItem('writepad_macros', JSON.stringify(this.savedMacros));
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('macrosUpdated'));
  },

  loadSavedMacros() {
    const data = localStorage.getItem('writepad_macros');
    if (data) {
      try {
        this.savedMacros = JSON.parse(data);
      } catch (e) {
        this.savedMacros = [];
      }
    }
  }
};
