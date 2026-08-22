import { AgentLogEntry } from '../types/agent';

export class AgentLogger {
  static LOG_KEY = 'writepad_agent_logs';
  
  static log(agentId: string, entry: Omit<AgentLogEntry, 'timestamp'>): void {
    try {
      const logsStr = localStorage.getItem(this.LOG_KEY);
      const logs: Record<string, AgentLogEntry[]> = logsStr ? JSON.parse(logsStr) : {};
      
      if (!logs[agentId]) {
        logs[agentId] = [];
      }
      
      logs[agentId].push({
        timestamp: new Date().toISOString(),
        ...entry
      });
      
      // Keep only last 500 entries
      if (logs[agentId].length > 500) {
        logs[agentId] = logs[agentId].slice(-500);
      }
      
      localStorage.setItem(this.LOG_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to log agent activity', e);
    }
  }
  
  static getHistory(agentId: string): AgentLogEntry[] {
    try {
      const logsStr = localStorage.getItem(this.LOG_KEY);
      const logs = logsStr ? JSON.parse(logsStr) : {};
      return logs[agentId] || [];
    } catch (e) {
      console.warn('Failed to get agent history', e);
      return [];
    }
  }
  
  static clear(agentId: string): void {
    try {
      const logsStr = localStorage.getItem(this.LOG_KEY);
      const logs = logsStr ? JSON.parse(logsStr) : {};
      delete logs[agentId];
      localStorage.setItem(this.LOG_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to clear agent history', e);
    }
  }
}
