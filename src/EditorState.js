export const EditorState = {
  editor: null,
  tabs: [],
  activeTabIndex: -1,
  vimMode: null,
  isVimEnabled: localStorage.getItem('isVimEnabled') === 'true',
  isWordWrap: localStorage.getItem('isWordWrap') === 'true',
  showInvisibles: localStorage.getItem('showInvisibles') === 'true',
  minimapEnabled: localStorage.getItem('minimapEnabled') === 'true',
  isRecording: false,
  macroActions: [],
  activeSidebar: null,
  workspaceHandle: null,
  
  get activeTab() {
    return this.activeTabIndex >= 0 ? this.tabs[this.activeTabIndex] : null;
  }
};
