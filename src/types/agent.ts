export interface Agent {
  id: string;
  name: string;
  model: string;
  systemPrompt: string;
  initialPrompt?: string;
  tools: ToolName[];
  autonomy: 'ask' | 'semi-auto' | 'full-auto';
  author?: string;
  description?: string;
  issue_number?: number | null;
}

export type ToolName =
  | 'read_file' | 'write_file' | 'edit_file'
  | 'create_document' | 'read_current_tab'
  | 'inject_to_editor' | 'list_directory' | 'invoke_agent';

export interface ToolDefinition {
  name: ToolName;
  description: string;
  parameters: { name: string; type: 'string'; description: string; required?: boolean }[];
  execute: (args: Record<string, string>, context: ToolContext) => Promise<string>;
}

export interface ToolContext {
  editor: any; // monaco.editor.IStandaloneCodeEditor
  workspaceHandle?: any; // FileSystemDirectoryHandle
}

export interface AgentLogEntry {
  timestamp: string;
  type: 'tool_call' | 'tool_result' | 'llm_response' | 'error' | 'circuit_break';
  data: Record<string, unknown>;
}
