import { marked } from 'marked';

export const MarkdownPreviewPanel = {
  callbacks: {},
  container: null,
  disposable: null,

  init(callbacks) {
    this.callbacks = callbacks;
  },

  renderSidebar(container) {
    this.container = container;
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; box-sizing: border-box; background: var(--bg-primary); color: var(--text-primary);">
        <div style="padding: 10px; background: var(--bg-secondary); border-bottom: 1px solid var(--border-light); font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
          <span>Markdown Preview</span>
          <span style="font-size: 0.8em; color: var(--text-secondary); font-weight: normal;">Updates automatically</span>
        </div>
        <div id="md-preview-content" style="flex: 1; padding: 15px; overflow-y: auto; line-height: 1.6; font-family: sans-serif;">
          <i>Loading preview...</i>
        </div>
      </div>
    `;

    this.updatePreview();

    // Listen to changes in the active editor
    const editor = this.callbacks.getEditor();
    if (this.disposable) this.disposable.dispose();
    
    this.disposable = editor.onDidChangeModelContent(() => {
      this.updatePreview();
    });
  },

  updatePreview() {
    if (!this.container) return;
    
    const editor = this.callbacks.getEditor();
    const contentBox = document.getElementById('md-preview-content');
    if (!contentBox) return;

    const activeTabIndex = this.callbacks.getActiveTabIndex();
    const tabs = this.callbacks.getTabs();
    
    if (activeTabIndex === -1) {
      contentBox.innerHTML = '<i>No active document.</i>';
      return;
    }

    const currentTab = tabs[activeTabIndex];
    if (!currentTab.title || !currentTab.title.toLowerCase().endsWith('.md')) {
      contentBox.innerHTML = '<i>Active document is not a Markdown file (.md).</i>';
      return;
    }

    const markdownText = editor.getValue();
    try {
      const html = marked.parse(markdownText);
      contentBox.innerHTML = html;
      
      // Inject simple styles for the markdown to make it look nice
      const style = document.createElement('style');
      style.innerHTML = `
        #md-preview-content h1, #md-preview-content h2, #md-preview-content h3 { border-bottom: 1px solid var(--border-light); padding-bottom: 5px; }
        #md-preview-content code { background: var(--bg-secondary); padding: 2px 4px; border-radius: 4px; font-family: monospace; }
        #md-preview-content pre { background: var(--bg-secondary); padding: 10px; border-radius: 4px; overflow-x: auto; font-family: monospace; }
        #md-preview-content a { color: #58a6ff; text-decoration: none; }
        #md-preview-content blockquote { border-left: 4px solid var(--border-light); padding-left: 15px; color: var(--text-secondary); margin-left: 0; }
        #md-preview-content table { border-collapse: collapse; width: 100%; }
        #md-preview-content th, #md-preview-content td { border: 1px solid var(--border-light); padding: 6px 13px; }
        #md-preview-content tr:nth-child(2n) { background-color: var(--bg-secondary); }
      `;
      contentBox.appendChild(style);
    } catch (e) {
      contentBox.innerHTML = '<i style="color: #f85149;">Error parsing Markdown: ' + e.message + '</i>';
    }
  }
};
