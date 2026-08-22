import { Tab } from './events'; // Forward declaring

export interface EventMap {
  TAB_SWITCHED: { index: number; tab: Tab };
  TAB_CREATED: { index: number; tab: Tab };
  TAB_CLOSED: { index: number };
  TAB_CONTENT_CHANGED: { index: number };
  WORKSPACE_LOADED: { handle: any }; // FileSystemDirectoryHandle
  AGENT_STARTED: { agentId: string };
  AGENT_TOOL_CALL: { agentId: string; tool: string; args: Record<string, string> };
  AGENT_COMPLETED: { agentId: string };
  AGENT_ERROR: { agentId: string; error: string };
  THEME_CHANGED: { theme: string };
  EDITOR_SELECTION_CHANGED: { selection: any };
  SIDEBAR_PANEL_OPENED: { panelId: string };
  SIDEBAR_PANEL_CLOSED: { panelId: string };
}

export interface Tab {
  title: string;
  content: string;
  model: any; // monaco.editor.ITextModel
  encoding: string;
  filePath?: string;
  fileHandle?: any; // FileSystemFileHandle
}
