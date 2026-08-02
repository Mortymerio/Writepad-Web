import * as monaco from 'monaco-editor';
import { AIService } from './aiService.js';
import { marked } from 'marked';

let aiDecorations = [];
let aiContentWidget = null;

let profileContextKey = null;

export function registerAIContextMenus(editor, getActiveTab) {
  profileContextKey = editor.createContextKey('writepadProfile', localStorage.getItem('writepad_profile') || 'all');

  const actions = [
    { id: 'ai-explain', label: 'AI: Explain Code ✨', profile: 'dev', prompt: 'Explica paso a paso el funcionamiento del siguiente código.', isExplain: true },
    { id: 'ai-refactor', label: 'AI: Refactor/Optimize Code ✨', profile: 'dev', prompt: 'Refactoriza y optimiza el siguiente código para que sea más eficiente y legible. Devuelve SOLAMENTE el código refactorizado.' },
    { id: 'ai-bugs', label: 'AI: Find Bugs/Vulns ✨', profile: 'all', prompt: 'Encuentra posibles bugs o vulnerabilidades de seguridad en el siguiente código y devuélvelo asegurado. Si devuelves código, que sea SOLAMENTE el código corregido.' },
    { id: 'ai-comments', label: 'AI: Add Comments ✨', profile: 'dev', prompt: 'Añade comentarios explicativos a este código para documentarlo. Devuelve SOLAMENTE el código comentado.' },
    { id: 'ai-deobfuscate', label: 'AI: Deobfuscate Code 🛡️', profile: 'sec', prompt: 'Desofusca el siguiente código. Intenta darle nombres significativos a las variables y reestructúralo para que sea legible. Devuelve SOLAMENTE el código desofuscado.' },
    { id: 'ai-malware', label: 'AI: Analyze Malware Behavior 🛡️', profile: 'sec', prompt: 'Analiza el siguiente código desde una perspectiva de ciberseguridad (Blue Team). Explica detalladamente si ves indicadores de compromiso, técnicas de evasión o comportamiento malicioso.', isExplain: true }
  ];

  actions.forEach(act => {
    let precondition = undefined;
    if (act.profile === 'dev') {
      precondition = "writepadProfile == 'dev' || writepadProfile == 'all'";
    } else if (act.profile === 'sec') {
      precondition = "writepadProfile == 'sec' || writepadProfile == 'all'";
    }

    editor.addAction({
      id: act.id,
      label: act.label,
      precondition: precondition,
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1,
      run: () => executeAIPrompt(editor, getActiveTab, act.prompt, act.label, act.isExplain)
    });
  });
}

export function updateAIProfileContext(profile) {
  if (profileContextKey) {
    profileContextKey.set(profile);
  }
}

function showAIExplanationModal(text) {
  let modal = document.getElementById('ai-explanation-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ai-explanation-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="width: 600px; max-height: 80vh; overflow-y: auto;">
        <div class="modal-header">
          <h2>✨ AI Explanation</h2>
          <button class="modal-close" id="btn-close-ai-explanation">×</button>
        </div>
        <div class="modal-body ai-markdown-body" id="ai-explanation-body"></div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#btn-close-ai-explanation').onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
  }
  modal.querySelector('#ai-explanation-body').innerHTML = marked.parse(text);
  modal.style.display = 'flex';
}

export async function executeAIPrompt(editor, getActiveTab, promptText, commandLabel, isExplain = false) {
  if (!getActiveTab() || !editor) return;
  
  const model = editor.getModel();
  const selection = editor.getSelection();
  const selectedText = model.getValueInRange(selection);
  const contextText = selectedText || model.getValue();
  
  const statusEl = document.createElement('div');
  statusEl.innerText = `⏳ AI is thinking (${commandLabel})...`;
  statusEl.style.cssText = 'position:fixed;bottom:30px;right:30px;background:var(--bg-active);color:var(--text-primary);padding:10px 20px;border-radius:20px;box-shadow:0 4px 12px rgba(0,0,0,0.5);z-index:2000;';
  document.body.appendChild(statusEl);

  try {
    const aiResponse = await AIService.generateCompletion(promptText, contextText);
    
    if (isExplain) {
      showAIExplanationModal(aiResponse);
      return;
    }
    
    const insertRange = selectedText 
      ? selection 
      : new monaco.Range(
          selection.startLineNumber, selection.startColumn,
          selection.startLineNumber, selection.startColumn
        );
    
    const op = {
      range: insertRange,
      text: aiResponse,
      forceMoveMarkers: true
    };
    
    editor.pushUndoStop();
    editor.executeEdits("AI", [op]);
    editor.pushUndoStop();
    
    const responseLines = aiResponse.split('\n');
    const newEndLine = insertRange.startLineNumber + responseLines.length - 1;
    const lastLineCol = responseLines[responseLines.length - 1].length + 1;
    const newRange = new monaco.Range(
      insertRange.startLineNumber,
      1,
      newEndLine,
      model.getLineMaxColumn(newEndLine) || lastLineCol
    );
    
    aiDecorations = editor.deltaDecorations(aiDecorations, [{
      range: newRange,
      options: {
        isWholeLine: true,
        className: 'ai-diff-insert',
        linesDecorationsClassName: 'ai-diff-insert-margin'
      }
    }]);
    
    showAIWidget(editor, getActiveTab, newEndLine, prompt, actionLabel);
    
  } catch (err) {
    alert(err.message);
  } finally {
    document.body.removeChild(statusEl);
  }
}

function showAIWidget(editor, getActiveTab, lineNumber, originalPrompt, actionLabel) {
  if (aiContentWidget) {
    editor.removeContentWidget(aiContentWidget);
  }
  
  const domNode = document.createElement('div');
  domNode.className = 'ai-widget-container';
  
  const label = document.createElement('span');
  label.innerText = '✨ AI Sugerencia:';
  label.style.fontWeight = 'bold';
  label.style.marginRight = '5px';
  domNode.appendChild(label);
  
  const btnKeep = document.createElement('button');
  btnKeep.className = 'ai-widget-btn primary';
  btnKeep.innerText = '✅ Keep';
  btnKeep.onclick = () => {
    editor.removeContentWidget(aiContentWidget);
    aiContentWidget = null;
    aiDecorations = editor.deltaDecorations(aiDecorations, []);
  };
  
  const btnTryAgain = document.createElement('button');
  btnTryAgain.className = 'ai-widget-btn';
  btnTryAgain.innerText = '🔄 Try Again';
  btnTryAgain.onclick = () => {
    editor.trigger('keyboard', 'undo');
    editor.removeContentWidget(aiContentWidget);
    aiContentWidget = null;
    aiDecorations = editor.deltaDecorations(aiDecorations, []);
    executeAIPrompt(editor, getActiveTab, originalPrompt, actionLabel);
  };
  
  const btnDiscard = document.createElement('button');
  btnDiscard.className = 'ai-widget-btn';
  btnDiscard.innerText = '❌ Discard';
  btnDiscard.onclick = () => {
    editor.trigger('keyboard', 'undo');
    editor.removeContentWidget(aiContentWidget);
    aiContentWidget = null;
    aiDecorations = editor.deltaDecorations(aiDecorations, []);
  };
  
  domNode.appendChild(btnKeep);
  domNode.appendChild(btnTryAgain);
  domNode.appendChild(btnDiscard);
  
  aiContentWidget = {
    getId: function() { return 'ai.content.widget'; },
    getDomNode: function() { return domNode; },
    getPosition: function() {
      return {
        position: { lineNumber: lineNumber, column: 1 },
        preference: [monaco.editor.ContentWidgetPositionPreference.BELOW]
      };
    }
  };
  
  editor.addContentWidget(aiContentWidget);
}
