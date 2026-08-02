import './style.css';
import * as monaco from 'monaco-editor';
import { initVimMode } from '../node_modules/monaco-vim/dist/index.mjs';
import { PluginManager } from './PluginManager.js';
import { AIService } from './aiService.js';
import { registerAIContextMenus, executeAIPrompt, updateAIProfileContext } from './aiCopilot.js';
import { SidebarManager } from './ui/SidebarManager.js';
import { MenuManager } from './ui/MenuManager.js';
import { TabManager } from './core/TabManager.js';
import { ToolbarManager } from './ui/ToolbarManager.js';
import { MacroEngine } from './core/MacroEngine.js';
import { ToolsManager } from './core/ToolsManager.js';
import { CyberTools } from './core/CyberTools.js';
import { createIcons, icons } from 'lucide';
import { ToastManager } from './ui/ToastManager.js';

self.MonacoEnvironment = {
  getWorker(workerId, label) {
    if (label === 'json') {
      return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url), { type: 'module' });
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url), { type: 'module' });
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker.js', import.meta.url), { type: 'module' });
    }
    if (label === 'typescript' || label === 'javascript') {
      return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url), { type: 'module' });
    }
    return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' });
  }
};

let editor;
let vimMode = null;
let isVimEnabled = localStorage.getItem('isVimEnabled') === 'true';

function initEditor() {
  createIcons({ icons });
  // Define GitHub Dark Theme
  monaco.editor.defineTheme('github-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff7b72' },
      { token: 'string', foreground: 'a5d6ff' },
      { token: 'number', foreground: '79c0ff' },
      { token: 'type', foreground: 'ff7b72' },
      { token: 'class', foreground: 'd2a8ff' }
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#c9d1d9',
      'editor.lineHighlightBackground': '#161b22',
      'editorCursor.foreground': '#58a6ff',
      'editor.selectionBackground': '#388bfd33',
      'editorIndentGuide.background': '#21262d',
      'editorLineNumber.foreground': '#484f58'
    }
  });

  const initialInvState = {
    space: localStorage.getItem('inv_space') === 'true',
    eol: localStorage.getItem('inv_eol') === 'true',
    control: localStorage.getItem('inv_control') === 'true'
  };

  editor = monaco.editor.create(document.getElementById('editor-container'), {
    value: '',
    language: 'plaintext',
    theme: localStorage.getItem('theme') || 'vs',
    fontFamily: '"Courier New", Consolas, monospace',
    fontSize: 14,
    minimap: { enabled: minimapEnabled },
    wordWrap: isWordWrap ? 'on' : 'off',
    lineNumbersMinChars: 4,
    renderLineHighlight: 'all',
    automaticLayout: true,
    renderWhitespace: initialInvState.space ? 'all' : 'none',
    renderControlCharacters: initialInvState.control
  });

  editor.onDidChangeCursorPosition((e) => {
    updateStatusBar();
  });
  
  editor.onDidType((text) => {
    if (isRecording) {
      // Ignore newlines here because they are captured by onKeyDown 'Enter'
      if (text === '\n' || text === '\r\n' || text === '\r') return;
      macroActions.push({ type: 'type', text: text });
    }
  });

  editor.onKeyDown((e) => {
    if (isRecording) {
      const key = e.browserEvent.key;
      const commandMap = {
        'ArrowUp': 'cursorUp',
        'ArrowDown': 'cursorDown',
        'ArrowLeft': 'cursorLeft',
        'ArrowRight': 'cursorRight',
        'Backspace': 'deleteLeft',
        'Delete': 'deleteRight',
        'End': 'cursorEnd',
        'Home': 'cursorHome',
        'PageUp': 'cursorPageUp',
        'PageDown': 'cursorPageDown',
        'Enter': 'enter'
      };
      
      if (commandMap[key]) {
        macroActions.push({ type: 'command', command: commandMap[key] });
      }
    }
  });
  
  let sidebarDebounceTimer = null;
  editor.onDidChangeModelContent((e) => {
    updateStatusBar();
    if (invisiblesState.eol) {
      updateEolDecorations();
    }
    
    // Change History Tracking
    const activeTabIndex = TabManager.getActiveTabIndex();
    const tabs = TabManager.getTabs();
    if (activeTabIndex !== -1) {
      const tab = tabs[activeTabIndex];
      let unsavedRanges = tab.unsavedDecos.map(id => tab.model.getDecorationRange(id)).filter(r => r);
      
      for (const change of e.changes) {
         const startLine = change.range.startLineNumber;
         const linesInserted = change.text.split('\n').length - 1;
         const endLine = startLine + linesInserted;
         
         unsavedRanges.push(new monaco.Range(startLine, 1, endLine, 1));
      }
      
      // Merge ranges
      unsavedRanges.sort((a, b) => a.startLineNumber - b.startLineNumber);
      let mergedUnsaved = [];
      for (let r of unsavedRanges) {
        if (mergedUnsaved.length === 0) {
          mergedUnsaved.push(r);
        } else {
          let last = mergedUnsaved[mergedUnsaved.length - 1];
          if (r.startLineNumber <= last.endLineNumber + 1) {
            let newEnd = Math.max(last.endLineNumber, r.endLineNumber);
            mergedUnsaved[mergedUnsaved.length - 1] = new monaco.Range(last.startLineNumber, 1, newEnd, 1);
          } else {
            mergedUnsaved.push(r);
          }
        }
      }
      
      tab.unsavedDecos = tab.model.deltaDecorations(tab.unsavedDecos, mergedUnsaved.map(r => ({
         range: r,
         options: { isWholeLine: true, linesDecorationsClassName: 'gutter-unsaved' }
      })));
      // Refresh tab to show ● dirty indicator
      if (tab.unsavedDecos.length > 0) TabManager.renderTabs();
    }

    
    if (SidebarManager.activeSidebar === 'func') {
      clearTimeout(sidebarDebounceTimer);
      sidebarDebounceTimer = setTimeout(() => {
        SidebarManager.updateSidebarContent();
      }, 500);
    }
  });

  // Intercept F1 and Ctrl+S
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F1') {
      e.preventDefault();
      editor.trigger('keyboard', 'editor.action.quickCommand');
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      document.getElementById('btn-save').click();
    }
    // Also bind Ctrl+P as an alternative
    if (e.ctrlKey && !e.shiftKey && !e.altKey && (e.key === 'P' || e.key === 'p')) {
      e.preventDefault();
      editor.trigger('keyboard', 'editor.action.quickCommand');
    }
  });

  window.addEventListener('resize', () => {
    editor.layout();
  });


  // Intercept drag and drop to create new tabs instead of overwriting the current one
  const container = document.getElementById('editor-container');
  container.addEventListener('dragover', (e) => {
    e.preventDefault(); // allow dropping
  });
  container.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (re) => {
        const tabs = TabManager.getTabs();
        tabs.push({
          title: file.name,
          model: monaco.editor.createModel(re.target.result, getLanguageFromExt(file.name)),
          unsavedDecos: [],
          savedDecos: []
        });
        TabManager.switchTab(tabs.length - 1);
      };
      reader.readAsText(file);
    }
  });

  // Setup Plugin API
  setupPluginAPI();

  SidebarManager.init({
    getEditor: () => editor,
    getTabs: () => TabManager.getTabs(),
    getActiveTabIndex: () => TabManager.getActiveTabIndex(),
    closeTab: (idx) => TabManager.closeTab(idx),
    switchTab: (idx) => TabManager.switchTab(idx),
    getLanguageFromExt: getLanguageFromExt,
    renderTabs: () => TabManager.renderTabs()
  });

  ToolsManager.init({
    getEditor: () => editor
  });

  CyberTools.init({
    getEditor: () => editor
  });

  MenuManager.init({
    getEditor: () => editor,
    getTabs: () => TabManager.getTabs(),
    getActiveTabIndex: () => TabManager.getActiveTabIndex(),
    getIsWordWrap: () => isWordWrap,
    getShowInvisibles: () => invisiblesState.space && invisiblesState.eol && invisiblesState.control,
    getMinimapEnabled: () => minimapEnabled,
    updateStatusBar: updateStatusBar,
    handleToolAction: (action) => {
      // Hashes
      if (['md5', 'sha1', 'sha256', 'sha512'].some(h => action.startsWith(h))) {
        const parts = action.split('-');
        const algo = parts[0];
        const type = parts[1];
        if (type === 'generate') ToolsManager.openGenerateModal(algo);
        else if (type === 'files') ToolsManager.generateFromFiles(algo);
        else if (type === 'selection') ToolsManager.generateFromSelection(algo);
      } 
      // Encoders
      else if (['base64', 'url', 'html', 'hex'].some(e => action.startsWith(e))) {
        const parts = action.split('-');
        CyberTools.handleEncoderAction(parts[0], parts[1]);
      }
      // CyberOps
      else if (action === 'entropy-calc') CyberTools.calculateEntropy();
      else if (action === 'ioc-extract') CyberTools.extractIOCs();
      else if (action === 'url-defang') CyberTools.defangURLs(false);
      else if (action === 'url-refang') CyberTools.defangURLs(true);
      else if (action === 'jwt-decode') CyberTools.decodeJWT();
      else if (action === 'rot13-apply') CyberTools.applyROT13();
      else if (action === 'xor-apply') CyberTools.applyXOR();
    }
  });

  // Profile Selection Logic
  const savedProfile = localStorage.getItem('writepad_profile');
  if (!savedProfile) {
    document.getElementById('profile-landing').style.display = 'flex';
  } else {
    document.body.className = `profile-${savedProfile}`;
    // Set profile indicator in status bar
    const profileEl = document.getElementById('status-profile');
    if (profileEl) {
      const profileLabels = { dev: '💻 Dev', sec: '🛡 Sec', all: '🌌 God' };
      profileEl.textContent = profileLabels[savedProfile] || savedProfile;
    }
  }

  document.querySelectorAll('.profile-card').forEach(card => {
    card.onclick = () => {
      const profile = card.getAttribute('data-set-profile');
      localStorage.setItem('writepad_profile', profile);
      document.body.className = `profile-${profile}`;
      updateAIProfileContext(profile);
      document.getElementById('profile-landing').style.display = 'none';
      // Update status bar profile indicator
      const profileEl = document.getElementById('status-profile');
      if (profileEl) {
        const profileLabels = { dev: '💻 Dev', sec: '🛡 Sec', all: '🌌 God' };
        profileEl.textContent = profileLabels[profile] || profile;
      }
    };
  });

  const changeProfileBtn = document.getElementById('menu-change-profile');
  if (changeProfileBtn) {
    changeProfileBtn.onclick = () => {
      document.getElementById('profile-landing').style.display = 'flex';
      MenuManager.closeAllDropdowns();
    };
  }

  TabManager.init({
    getEditor: () => editor,
    updateStatusBar,
    updateEolDecorations,
    stopMonitoring: () => { if (typeof window.stopMonitoring === 'function') window.stopMonitoring(); },
    getLanguageFromExt
  });
  const restored = TabManager.restoreWorkspace();
  if (!restored) {
    TabManager.createNewTab('new 1');
  }

  // Auto-save workspace every 5 seconds
  setInterval(() => TabManager.saveWorkspace(), 5000);
  window.addEventListener('beforeunload', () => TabManager.saveWorkspace());

  ToolbarManager.init({
    createNewTab: () => TabManager.createNewTab(),
    openFile: () => TabManager.openFile(),
    saveFile: () => TabManager.saveActiveTab(),
    saveAllFiles: () => TabManager.saveAllTabs(),
    closeCurrentTab: () => TabManager.closeTab(TabManager.getActiveTabIndex()),
    closeAllTabs: () => TabManager.closeAllTabs(),
    getEditor: () => editor,
    toggleWordWrap,
    toggleInvisibles,
    toggleMinimap,
    macroStart: () => MacroEngine.startRecording(),
    macroStop: () => MacroEngine.stopRecording(),
    macroPlay: () => MacroEngine.playMacro(),
    macroRunMulti: (times) => MacroEngine.playMacro(undefined, times),
    macroSave: (name) => {
      if (MacroEngine.saveCurrentMacro(name)) {
        ToastManager.success('Macro saved!');
      } else {
        ToastManager.warning('Nothing recorded to save.');
      }
    },
    toggleVim: () => {
      isVimEnabled = !isVimEnabled;
      const vimStatusEl = document.getElementById('vim-status');
      const btnVim = document.getElementById('btn-vim-mode');
      if (isVimEnabled) {
        vimMode = initVimMode(editor, vimStatusEl);
        btnVim.classList.add('active-btn');
      } else {
        if (vimMode) { vimMode.dispose(); vimMode = null; }
        vimStatusEl.innerHTML = '';
        btnVim.classList.remove('active-btn');
      }
      localStorage.setItem('isVimEnabled', isVimEnabled);
    }
  });
}

function updateStatusBar() {
    if (!editor) return;
    const position = editor.getPosition();
    const model = editor.getModel();
    
    if (position && model) {
      document.getElementById('status-pos').innerText = `Ln : ${position.lineNumber}   Col : ${position.column}`;
      document.getElementById('status-length').innerText = `length : ${model.getValueLength()}    lines : ${model.getLineCount()}`;
    }
    
    const activeTab = TabManager.getActiveTab();
    if (activeTab && activeTab.encoding) {
      document.getElementById('status-encoding').innerText = activeTab.encoding;
      import('./ui/MenuManager.js').then(m => m.MenuManager.updateEncodingChecks(activeTab.encoding));
    } else {
      document.getElementById('status-encoding').innerText = 'UTF-8';
      import('./ui/MenuManager.js').then(m => m.MenuManager.updateEncodingChecks('UTF-8'));
    }
    
    if (model) {
      const langId = model.getLanguageId();
      // Capitalize and prettify language name
      const langDisplayMap = {
        'plaintext': 'Plain Text', 'javascript': 'JavaScript', 'typescript': 'TypeScript',
        'html': 'HTML', 'css': 'CSS', 'scss': 'SCSS', 'less': 'Less',
        'json': 'JSON', 'markdown': 'Markdown', 'python': 'Python', 'java': 'Java',
        'cpp': 'C++', 'c': 'C', 'csharp': 'C#', 'go': 'Go', 'rust': 'Rust',
        'ruby': 'Ruby', 'php': 'PHP', 'sql': 'SQL', 'xml': 'XML', 'yaml': 'YAML',
        'shell': 'Shell', 'powershell': 'PowerShell', 'dockerfile': 'Dockerfile',
        'kotlin': 'Kotlin', 'swift': 'Swift', 'dart': 'Dart', 'lua': 'Lua',
        'r': 'R', 'perl': 'Perl', 'scala': 'Scala', 'elixir': 'Elixir',
      };
      document.getElementById('status-lang').innerText = langDisplayMap[langId] || langId.charAt(0).toUpperCase() + langId.slice(1);
    }
  }

let isWordWrap = localStorage.getItem('isWordWrap') === 'true';
function toggleWordWrap() {
  isWordWrap = !isWordWrap;
  editor.updateOptions({ wordWrap: isWordWrap ? 'on' : 'off' });
  document.getElementById('btn-word-wrap').classList.toggle('active-btn', isWordWrap);
  localStorage.setItem('isWordWrap', isWordWrap);
}

let invisiblesState = {
  space: localStorage.getItem('inv_space') === 'true',
  eol: localStorage.getItem('inv_eol') === 'true',
  control: localStorage.getItem('inv_control') === 'true'
};
let eolDecorations = [];

function updateEolDecorations() {
  if (!editor) return;
  if (!invisiblesState.eol) {
    eolDecorations = editor.deltaDecorations(eolDecorations, []);
    return;
  }
  
  const model = editor.getModel();
  if (!model) return;
  
  const newDecorations = [];
  const lineCount = model.getLineCount();
  const eolClass = model.getEOL() === '\r\n' ? 'eol-crlf' : 'eol-lf';
  
  for (let i = 1; i <= lineCount; i++) {
    const maxCol = model.getLineMaxColumn(i);
    newDecorations.push({
      range: new monaco.Range(i, maxCol, i, maxCol),
      options: {
        afterContentClassName: eolClass
      }
    });
  }
  
  eolDecorations = editor.deltaDecorations(eolDecorations, newDecorations);
}

function toggleInvisibles(type = 'all') {
  if (type === 'all') {
    const isAllOn = invisiblesState.space && invisiblesState.eol && invisiblesState.control;
    const newState = !isAllOn;
    invisiblesState.space = newState;
    invisiblesState.eol = newState;
    invisiblesState.control = newState;
  } else {
    invisiblesState[type] = !invisiblesState[type];
  }
  applyInvisiblesState();
}

function applyInvisiblesState() {
  const isAllOn = invisiblesState.space && invisiblesState.eol && invisiblesState.control;
  document.getElementById('btn-invisibles').classList.toggle('active-btn', isAllOn);
  
  document.querySelectorAll('#dropdown-invisibles .dropdown-item').forEach(item => {
    const t = item.getAttribute('data-invisible');
    if (t === 'all') item.classList.toggle('checked', isAllOn);
    else if (t) item.classList.toggle('checked', invisiblesState[t]);
  });
  
  editor.updateOptions({
    renderWhitespace: invisiblesState.space ? 'all' : 'none',
    renderControlCharacters: invisiblesState.control
  });
  updateEolDecorations();
  
  localStorage.setItem('inv_space', invisiblesState.space);
  localStorage.setItem('inv_eol', invisiblesState.eol);
  localStorage.setItem('inv_control', invisiblesState.control);
}

let minimapEnabled = localStorage.getItem('minimapEnabled') === 'true';
function toggleMinimap() {
  minimapEnabled = !minimapEnabled;
  editor.updateOptions({ minimap: { enabled: minimapEnabled } });
  document.getElementById('btn-minimap').classList.toggle('active-btn', minimapEnabled);
  localStorage.setItem('minimapEnabled', minimapEnabled);
}

// 7. Sidebars (New)
document.getElementById('btn-doc-list').onclick = () => SidebarManager.toggleSidebar('doc');
document.getElementById('btn-func-list').onclick = () => SidebarManager.toggleSidebar('func');
document.getElementById('btn-workspace').onclick = () => SidebarManager.toggleSidebar('workspace');
document.getElementById('btn-macros-list').onclick = () => SidebarManager.toggleSidebar('macros');
document.getElementById('btn-encoder').onclick = () => SidebarManager.toggleSidebar('encoder');
document.getElementById('btn-hashcat').onclick = () => SidebarManager.toggleSidebar('hashcat');
document.getElementById('btn-lfi').onclick = () => SidebarManager.toggleSidebar('lfi');
document.getElementById('btn-xss').onclick = () => SidebarManager.toggleSidebar('xss');
document.getElementById('btn-gtfobins').onclick = () => SidebarManager.toggleSidebar('gtfobins');
document.getElementById('btn-revshell').onclick = () => SidebarManager.toggleSidebar('revshell');
document.getElementById('btn-sqli').onclick = () => SidebarManager.toggleSidebar('sqli');
document.getElementById('btn-linpeas').onclick = () => SidebarManager.toggleSidebar('linpeas');
document.getElementById('btn-winpeas').onclick = () => SidebarManager.toggleSidebar('winpeas');
document.getElementById('btn-sidebar-close').onclick = () => SidebarManager.toggleSidebar(null);

// ── Sidebar Drag-to-Resize ──────────────────────────────────────────────────
function setupSidebarResize(handleId, sidebarId, storageKey, isRight = false) {
  const handle = document.getElementById(handleId);
  const sidebar = document.getElementById(sidebarId);
  if (!handle || !sidebar) return;

  // Restore saved width
  const savedWidth = localStorage.getItem(storageKey);
  if (savedWidth) sidebar.style.width = savedWidth + 'px';

  // Show handle when sidebar is visible (observe display changes via MutationObserver)
  new MutationObserver(() => {
    const visible = sidebar.style.display !== 'none';
    handle.style.display = visible ? 'block' : 'none';
  }).observe(sidebar, { attributes: true, attributeFilter: ['style'] });

  let startX, startWidth;

  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startX = e.clientX;
    startWidth = sidebar.offsetWidth;
    handle.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    let tooltip = document.createElement('div');
    tooltip.style.cssText = 'position:fixed; background:rgba(0,0,0,0.8); color:#fff; padding:2px 6px; border-radius:3px; font-size:11px; z-index:10000; pointer-events:none; white-space:nowrap; transform:translate(-50%, -100%); margin-top:-10px; font-family:"Inter", sans-serif;';
    document.body.appendChild(tooltip);

    const onMove = (e) => {
      const delta = isRight ? (startX - e.clientX) : (e.clientX - startX);
      const newWidth = Math.min(600, Math.max(150, startWidth + delta));
      sidebar.style.width = newWidth + 'px';
      
      tooltip.innerText = `Width: ${newWidth}px`;
      tooltip.style.left = e.clientX + 'px';
      tooltip.style.top = e.clientY + 'px';
      
      editor.layout(); // re-layout Monaco
    };

    const onUp = () => {
      handle.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      tooltip.remove();
      localStorage.setItem(storageKey, parseInt(sidebar.style.width));
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

setupSidebarResize('sidebar-resize-handle', 'sidebar', 'sidebar-width', false);
setupSidebarResize('right-sidebar-resize-handle', 'right-sidebar', 'right-sidebar-width', true);
// ────────────────────────────────────────────────────────────────────────────


// AI Modal Listeners
document.getElementById('menu-ai').onclick = () => {
  document.getElementById('ai-api-key').value = localStorage.getItem('ai-api-key') || '';
  document.getElementById('ai-model').value = localStorage.getItem('ai-model') || 'gemini-1.5-pro';
  document.getElementById('ai-config-modal').style.display = 'flex';
};

document.getElementById('btn-close-ai-config').onclick = () => {
  document.getElementById('ai-config-modal').style.display = 'none';
};

document.getElementById('btn-save-ai-config').onclick = () => {
  localStorage.setItem('ai-api-key', document.getElementById('ai-api-key').value);
  localStorage.setItem('ai-model', document.getElementById('ai-model').value);
  document.getElementById('ai-config-modal').style.display = 'none';
  ToastManager.success('AI Settings saved!');
};

document.getElementById('btn-fetch-models').onclick = async () => {
  const apiKey = document.getElementById('ai-api-key').value;
  if (!apiKey) {
    ToastManager.warning('Primero ingresa una API Key válida en la caja de texto.');
    return;
  }
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    const select = document.getElementById('ai-model');
    select.innerHTML = '';
    
    const models = data.models.filter(m => m.name.includes('gemini') && m.supportedGenerationMethods.includes('generateContent'));
    
    models.forEach(m => {
      const option = document.createElement('option');
      const shortName = m.name.replace('models/', '');
      option.value = shortName;
      option.innerText = m.displayName + ` (${shortName})`;
      select.appendChild(option);
    });
    
    ToastManager.success(`¡Se encontraron ${models.length} modelos de Gemini!`);
  } catch (err) {
    ToastManager.error("Error fetching models: " + err.message);
  }
};

// Magic Wand Prompt Box
const aiPromptBox = document.getElementById('ai-prompt-box');
const aiPromptInput = document.getElementById('ai-prompt-input');

document.getElementById('btn-ai-prompt').onclick = () => {
  if (aiPromptBox.style.display === 'none') {
    aiPromptBox.style.display = 'block';
    aiPromptInput.focus();
  } else {
    aiPromptBox.style.display = 'none';
  }
};

document.getElementById('btn-ai-prompt-submit').onclick = async () => {
  const prompt = aiPromptInput.value;
  if (!prompt) return;
  
  aiPromptBox.style.display = 'none';
  aiPromptInput.value = '';
  
  await executeAIPrompt(editor, () => TabManager.getActiveTab(), prompt, "General Instructions");
};

aiPromptInput.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    document.getElementById('btn-ai-prompt-submit').click();
  }
});

// 8. Macro Engine
let isRecording = false;
let macroActions = [];

document.getElementById('btn-macro-record').onclick = () => {
  if (isRecording) return;
  isRecording = true;
  macroActions = [];
  document.getElementById('btn-macro-record').classList.add('recording');
  document.getElementById('menu-macro-record').classList.add('checked');
};

document.getElementById('btn-macro-stop').onclick = () => {
  if (!isRecording) return;
  isRecording = false;
  document.getElementById('btn-macro-record').classList.remove('recording');
  document.getElementById('menu-macro-record').classList.remove('checked');
};

document.getElementById('btn-macro-play').onclick = () => {
  if (isRecording || macroActions.length === 0) return;
  
  editor.focus();
  for (const action of macroActions) {
    if (action.type === 'type') {
      editor.trigger('macro', 'type', { text: action.text });
    } else if (action.type === 'command') {
      if (action.command === 'enter') {
         editor.trigger('macro', 'type', { text: '\n' });
      } else {
         editor.trigger('macro', action.command);
      }
    }
  }
};

// 9. About Modal
document.getElementById('menu-about').onclick = () => {
  document.getElementById('about-modal').style.display = 'flex';
};

document.getElementById('btn-close-about').onclick = () => {
  document.getElementById('about-modal').style.display = 'none';
};

// Close modal if clicked outside
document.getElementById('about-modal').onclick = (e) => {
  if (e.target.id === 'about-modal') {
    document.getElementById('about-modal').style.display = 'none';
  }
};

// Cloud Sync (Removed per user request)

// 10. File Monitor (tail -f)
let monitoringIntervalId = null;

window.stopMonitoring = function() {
  if (monitoringIntervalId) {
    clearInterval(monitoringIntervalId);
    monitoringIntervalId = null;
  }
  const btn = document.getElementById('btn-monitor');
  if (btn) btn.classList.remove('active-btn', 'recording');
  const menuBtn = document.getElementById('menu-view-monitor');
  if (menuBtn) menuBtn.classList.remove('checked');
  if (editor) editor.updateOptions({ readOnly: false });
};

document.getElementById('btn-monitor').onclick = async () => {
  if (monitoringIntervalId) {
    window.stopMonitoring();
    return;
  }
  
  const tab = TabManager.getActiveTab();
  if (!tab) return;
  if (!tab.fileHandle) {
    ToastManager.warning("❌ Solo se pueden monitorear archivos abiertos desde tu disco usando 'Abrir' en navegadores modernos.");
    return;
  }
  
  // Start monitoring
  document.getElementById('btn-monitor').classList.add('active-btn', 'recording'); // Uses the red pulse animation!
  document.getElementById('menu-view-monitor').classList.add('checked');
  editor.updateOptions({ readOnly: true });
  
  monitoringIntervalId = setInterval(async () => {
    try {
      const file = await tab.fileHandle.getFile();
      const newText = await file.text();
      const currentText = tab.model.getValue();
      
      if (newText !== currentText) {
        tab.model.setValue(newText);
        // Scroll to bottom
        const lineCount = tab.model.getLineCount();
        editor.revealLine(lineCount);
      }
    } catch (err) {
      console.error("Error monitoring file:", err);
      window.stopMonitoring();
    }
  }, 1000);
};

document.getElementById('btn-vim-mode').onclick = () => {
  const vimStatusEl = document.getElementById('vim-status');
  const btn = document.getElementById('btn-vim-mode');
  
  if (isVimEnabled) {
    // Disable Vim
    if (vimMode) {
      vimMode.dispose();
      vimMode = null;
    }
    vimStatusEl.style.display = 'none';
    btn.innerText = 'VIM: OFF';
    isVimEnabled = false;
  } else {
    // Enable Vim
    vimStatusEl.style.display = 'inline-block';
    vimMode = initVimMode(editor, vimStatusEl);
    btn.innerText = 'VIM: ON';
    isVimEnabled = true;
  }
  localStorage.setItem('isVimEnabled', isVimEnabled);
};

document.getElementById('theme-selector').onchange = async (e) => {
  const theme = e.target.value;
  localStorage.setItem('theme', theme);
  const option = e.target.options[e.target.selectedIndex];
  const isDark = option.parentElement.label === 'Dark Themes' || theme === 'github-dark';
  
  // Set data-theme attribute for CSS theme variables
  if (isDark) {
    document.body.setAttribute('data-theme', theme);
    document.body.classList.add('dark-mode');
  } else {
    document.body.removeAttribute('data-theme');
    document.body.classList.remove('dark-mode');
  }
  
  // Pre-loaded themes
  if (theme === 'vs' || theme === 'github-dark') {
    monaco.editor.setTheme(theme);
    return;
  }
  
  // Dynamic fetch for other themes
  try {
    const base = import.meta.env.BASE_URL || '/';
    const url = `${base}themes/${encodeURIComponent(theme)}.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Network response was not ok (${res.status})`);
    
    const themeData = await res.json();
    
    // Monaco requires theme names to match /^[a-z0-9\-]+$/i
    const safeThemeName = theme.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
    
    monaco.editor.defineTheme(safeThemeName, themeData);
    monaco.editor.setTheme(safeThemeName);
  } catch (err) {
    console.error("Failed to load theme:", err);
    ToastManager.error(`Error loading theme '${theme}': ` + err.message);
  }
};

function getLanguageFromExt(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    'js': 'javascript',
    'json': 'json',
    'html': 'html',
    'css': 'css',
    'ts': 'typescript',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'sql': 'sql',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'sh': 'shell',
    'go': 'go'
  };
  return map[ext] || 'plaintext';
}



function setupPluginAPI() {
  window.WritepadAPI = {
    getEditor: () => editor,
    getText: () => editor.getValue(),
    setText: (text) => {
       const position = editor.getPosition();
       editor.setValue(text);
       if (position) editor.setPosition(position);
    },
    addToolbarButton: (icon, title, onClick) => {
      const btn = document.createElement('button');
      btn.className = 'toolbar-btn';
      btn.title = title;
      btn.innerText = icon;
      btn.onclick = onClick;
      document.getElementById('toolbar').appendChild(btn);
    },
    showNotification: (msg) => ToastManager.info(msg)
  };
  
  // Apply visual states for toggles
  document.getElementById('btn-word-wrap').classList.toggle('active-btn', isWordWrap);
  applyInvisiblesState();
  document.getElementById('btn-minimap').classList.toggle('active-btn', minimapEnabled);
  
  // Apply Vim visual state
  const vimStatusEl = document.getElementById('vim-status');
  const btnVim = document.getElementById('btn-vim-mode');
  if (isVimEnabled) {
    vimStatusEl.style.display = 'inline-block';
    vimMode = initVimMode(editor, vimStatusEl);
    btnVim.innerText = 'VIM: ON';
  } else {
    vimStatusEl.style.display = 'none';
    btnVim.innerText = 'VIM: OFF';
  }
  
  // Apply saved theme
  const savedTheme = localStorage.getItem('theme') || 'github-dark';
  const themeSelector = document.getElementById('theme-selector');
  themeSelector.value = savedTheme;
  // Trigger onchange to fetch and apply it if it's external
  themeSelector.dispatchEvent(new Event('change'));
  
  // Register AI Context Menu Actions
  registerAIContextMenus(editor, () => TabManager.getActiveTab());
  
  window.MacroEngine = MacroEngine;
  MacroEngine.init(editor);
  
  // Initialize Plugin Manager (only here, not in setupPluginAPI to avoid double init)
  PluginManager.init();
}

// Start app
document.addEventListener('DOMContentLoaded', initEditor);
