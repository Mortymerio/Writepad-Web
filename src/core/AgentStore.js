export const DEFAULT_AGENTS = [
  {
    id: 'architect',
    name: 'Architect',
    model: 'gemini-1.5-pro',
    systemPrompt: 'You are an expert software architect. Analyze codebases, design systems, and write high-quality code. Use tools to read, write, and run code.',
    initialPrompt: 'Please review the structure of the current workspace and suggest architectural improvements.',
    tools: ['read_file', 'write_file', 'edit_file', 'read_current_tab', 'inject_to_editor', 'list_directory'],
    autonomy: 'semi-auto',
  },
  {
    id: 'debugger',
    name: 'Debugger',
    model: 'gemini-1.5-flash',
    systemPrompt: 'You are an expert debugger. Find bugs, analyze error messages, and propose fixes. Always read the relevant files before suggesting changes.',
    initialPrompt: 'Review the current active tab for bugs, syntax errors, or logical issues. If you find any, fix them.',
    tools: ['read_file', 'edit_file', 'read_current_tab', 'inject_to_editor'],
    autonomy: 'ask',
  },
  {
    id: 'documenter',
    name: 'Documentation Writer',
    model: 'gemini-1.5-flash',
    systemPrompt: 'You are a technical writer. Write clear, concise documentation for code.',
    initialPrompt: 'Read the current tab and add clear JSDoc or markdown documentation explaining what the code does.',
    tools: ['read_file', 'write_file', 'read_current_tab', 'inject_to_editor'],
    autonomy: 'full-auto',
  }
];

export class AgentStore {
  static getStorageKey() {
    return 'writepad_agents';
  }

  static listAgents() {
    const raw = localStorage.getItem(this.getStorageKey());
    if (!raw) {
      this.initDefaultAgents();
      return DEFAULT_AGENTS;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse agents from localStorage', e);
      return DEFAULT_AGENTS;
    }
  }

  static initDefaultAgents() {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(DEFAULT_AGENTS));
  }

  static saveAgent(agent) {
    const agents = this.listAgents();
    if (!agent.id) {
      agent.id = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    }
    
    const idx = agents.findIndex(a => a.id === agent.id);
    if (idx >= 0) {
      agents[idx] = agent;
    } else {
      agents.push(agent);
    }
    
    localStorage.setItem(this.getStorageKey(), JSON.stringify(agents));
    return agent;
  }

  static deleteAgent(id) {
    let agents = this.listAgents();
    agents = agents.filter(a => a.id !== id);
    localStorage.setItem(this.getStorageKey(), JSON.stringify(agents));
  }
}
