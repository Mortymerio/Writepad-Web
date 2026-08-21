import { SidebarManager } from '../ui/SidebarManager.js';
import { TabManager } from './TabManager.js';
import * as monaco from 'monaco-editor';

export const TOOL_REGISTRY = [
  {
    name: 'read_file',
    description: 'Read the contents of a file in the workspace directory. Use this to understand the existing code before making changes.',
    parameters: {
      path: { type: 'string', description: 'Relative path to the file', required: true }
    },
    async execute(args) {
      if (!SidebarManager.workspaceHandle) {
        throw new Error('No workspace folder opened. Cannot read file.');
      }
      
      const parts = args.path.split(/[\\/]/).filter(p => p);
      let currentHandle = SidebarManager.workspaceHandle;
      
      for (let i = 0; i < parts.length - 1; i++) {
        try {
          currentHandle = await currentHandle.getDirectoryHandle(parts[i]);
        } catch (e) {
          throw new Error(`Directory not found: ${parts[i]} in path ${args.path}`);
        }
      }
      
      const fileName = parts[parts.length - 1];
      try {
        const fileHandle = await currentHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        const text = await file.text();
        return text;
      } catch (e) {
        throw new Error(`File not found: ${args.path}`);
      }
    }
  },
  {
    name: 'write_file',
    description: 'Write content to a file in the workspace, creating it if it does not exist. Use this to create new files or completely replace existing ones.',
    parameters: {
      path: { type: 'string', description: 'Relative path to the file', required: true },
      content: { type: 'string', description: 'Content to write', required: true }
    },
    async execute(args) {
      if (!SidebarManager.workspaceHandle) {
        throw new Error('No workspace folder opened. Cannot write file.');
      }
      
      const parts = args.path.split(/[\\/]/).filter(p => p);
      let currentHandle = SidebarManager.workspaceHandle;
      
      // Basic dir creation logic (FSA requires manual traversal)
      for (let i = 0; i < parts.length - 1; i++) {
        currentHandle = await currentHandle.getDirectoryHandle(parts[i], { create: true });
      }
      
      const fileName = parts[parts.length - 1];
      const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(args.content);
      await writable.close();
      
      // Update sidebar if open
      if (SidebarManager.activeSidebar === 'workspace') {
        SidebarManager.updateSidebarContent();
      }
      return `File written successfully: ${args.path}`;
    }
  },
  {
    name: 'edit_file',
    description: 'Replace the first occurrence of `search` with `replace` in a file. Useful for modifying specific parts of a file without rewriting the whole thing.',
    parameters: {
      path: { type: 'string', description: 'Relative path to the file', required: true },
      search: { type: 'string', description: 'Exact text to search for (make sure to include enough context lines so it uniquely matches)', required: true },
      replace: { type: 'string', description: 'Replacement text', required: true }
    },
    async execute(args) {
      if (!SidebarManager.workspaceHandle) {
        throw new Error('No workspace folder opened. Cannot edit file.');
      }
      
      const parts = args.path.split(/[\\/]/).filter(p => p);
      let currentHandle = SidebarManager.workspaceHandle;
      
      for (let i = 0; i < parts.length - 1; i++) {
        currentHandle = await currentHandle.getDirectoryHandle(parts[i]);
      }
      
      const fileName = parts[parts.length - 1];
      let fileHandle;
      try {
        fileHandle = await currentHandle.getFileHandle(fileName);
      } catch (e) {
        throw new Error(`File not found: ${args.path}`);
      }
      
      const file = await fileHandle.getFile();
      const original = await file.text();
      
      if (!original.includes(args.search)) {
        throw new Error(`Search string not found in ${args.path}`);
      }
      
      const updated = original.replace(args.search, args.replace);
      const writable = await fileHandle.createWritable();
      await writable.write(updated);
      await writable.close();
      
      return `File edited successfully: ${args.path}`;
    }
  },
  {
    name: 'create_document',
    description: 'Create a new, unsaved document in the editor with the specified title and content. Use this to draft new files for the user to review before saving.',
    parameters: {
      title: { type: 'string', description: 'The title of the new document (e.g. SPECS.md)', required: true },
      content: { type: 'string', description: 'The initial content of the document', required: true }
    },
    async execute(args) {
      TabManager.createNewTab(args.title);
      const tabs = TabManager.getTabs();
      const newTab = tabs[tabs.length - 1];
      newTab.model.setValue(args.content);
      
      // Try to set language based on extension
      const ext = args.title.split('.').pop();
      if (ext) {
        let lang = 'plaintext';
        if (ext === 'md') lang = 'markdown';
        else if (ext === 'js') lang = 'javascript';
        else if (ext === 'json') lang = 'json';
        else if (ext === 'html') lang = 'html';
        else if (ext === 'css') lang = 'css';
        else if (ext === 'py') lang = 'python';
        monaco.editor.setModelLanguage(newTab.model, lang);
      }
      
      return `Created new document '${args.title}' in the editor.`;
    }
  },
  {
    name: 'read_current_tab',
    description: 'Read the contents of the currently active file tab in the editor.',
    parameters: {},
    async execute(args, context) {
      const activeIdx = TabManager.getActiveTabIndex();
      if (activeIdx === -1) {
        return "No active tab open in the editor.";
      }
      const tab = TabManager.tabs[activeIdx];
      return `File: ${tab.title}\n\n${tab.model.getValue()}`;
    }
  },
  {
    name: 'inject_to_editor',
    description: 'Insert text at the current cursor position in the active editor tab. Use this to write code directly into the users workspace for them.',
    parameters: {
      text: { type: 'string', description: 'Text to insert into the editor', required: true }
    },
    async execute(args, context) {
      if (!context.editor) {
         throw new Error("Editor instance not available in context.");
      }
      const position = context.editor.getPosition();
      if (!position) {
         throw new Error("No active editor position.");
      }
      
      context.editor.executeEdits("AI_Agent", [{
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: args.text,
        forceMoveMarkers: true
      }]);
      
      return "Text injected successfully at cursor position.";
    }
  },
  {
    name: 'list_directory',
    description: 'List files and folders in a specific directory within the workspace.',
    parameters: {
      path: { type: 'string', description: 'Relative path to list. Leave empty for root workspace dir.', required: false }
    },
    async execute(args) {
      if (!SidebarManager.workspaceHandle) {
        throw new Error('No workspace folder opened. Cannot list directory.');
      }
      
      let currentHandle = SidebarManager.workspaceHandle;
      if (args.path) {
        const parts = args.path.split(/[\\/]/).filter(p => p);
        for (let i = 0; i < parts.length; i++) {
          try {
             currentHandle = await currentHandle.getDirectoryHandle(parts[i]);
          } catch(e) {
             throw new Error(`Directory not found: ${parts[i]} in path ${args.path}`);
          }
        }
      }
      
      const entries = [];
      for await (const entry of currentHandle.values()) {
        entries.push(`${entry.kind === 'directory' ? '[DIR]' : '[FILE]'} ${entry.name}`);
      }
      
      if (entries.length === 0) return "Directory is empty.";
      return entries.join('\n');
    }
  },
  {
    name: 'invoke_agent',
    description: 'Invoke another specialized sub-agent to perform a task for you.',
    parameters: {
      agent_name: { type: 'string', description: 'Name of the agent to invoke (e.g. Debugger, Documentation Writer)', required: true },
      task: { type: 'string', description: 'The task description to give to the sub-agent', required: true }
    },
    async execute(args, context) {
      const { AgentStore } = await import('./AgentStore.js');
      const agents = AgentStore.listAgents();
      const targetAgent = agents.find(a => a.name.toLowerCase() === args.agent_name.toLowerCase());
      if (!targetAgent) throw new Error(`Agent not found: ${args.agent_name}`);
      
      const { AgentOrchestrator } = await import('./AgentOrchestrator.js');
      const orchestrator = new AgentOrchestrator(context.editor);
      
      return new Promise((resolve, reject) => {
         let finalOutput = '';
         orchestrator.on('chunk', (data) => { finalOutput += data.delta; });
         
         orchestrator.on('tool_call', (tc) => {
            if (targetAgent.autonomy === 'ask') {
                if (context.onSubagentToolCall) {
                    context.onSubagentToolCall(targetAgent.name, tc, orchestrator);
                } else {
                    orchestrator.approveToolCall(tc.id, true);
                }
            }
         });
         
         orchestrator.on('done', () => resolve(finalOutput));
         orchestrator.on('error', (err) => reject(err));
         
         orchestrator.run(targetAgent, args.task).catch(reject);
      });
    }
  }
];

export async function executeTool(name, args, context) {
  const tool = TOOL_REGISTRY.find(t => t.name === name);
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  return await tool.execute(args, context);
}
