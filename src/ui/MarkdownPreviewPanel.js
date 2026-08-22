import { marked } from 'marked';
import { EventBus } from '../core/EventBus.js';

export const MarkdownPreviewPanel = {
  callbacks: {},
  container: null,

  init(callbacks) {
    this.callbacks = callbacks;
  },

  renderSidebar(container) {
    this.container = container;
    container.innerHTML = `
      <div class="md-preview-container">
        <div class="md-preview-header">
          <span>Markdown Preview</span>
          <span class="md-preview-header__status">Updates automatically</span>
        </div>
        <div id="md-preview-content" class="md-preview-content">
          <i>Loading preview...</i>
        </div>
      </div>
    `;

    this.updatePreview();

    // Migrado a EventBus para desacoplar del editor (F1.6)
    EventBus.on('TAB_CONTENT_CHANGED', () => this.updatePreview());
    EventBus.on('TAB_SWITCHED', () => this.updatePreview());
  },

  updatePreview() {
    if (!this.container) return;
    
    const editor = this.callbacks.getEditor();
    const contentBox = document.getElementById('md-preview-content');
    if (!contentBox || !editor) return;

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
    } catch (e) {
      contentBox.innerHTML = '<i class="md-preview-error">Error parsing Markdown: ' + e.message + '</i>';
    }
  }
};
