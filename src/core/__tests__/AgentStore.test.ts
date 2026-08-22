import { describe, it, expect, beforeEach } from 'vitest';
import { AgentStore, DEFAULT_AGENTS } from '../AgentStore';
import { Agent } from '../../types/agent';

describe('AgentStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('listAgents() debería retornar DEFAULT_AGENTS si localStorage está vacío', () => {
    const agents = AgentStore.listAgents();
    expect(agents).toHaveLength(3);
    expect(agents[0].name).toBe('Architect');
  });

  it('listAgents() debería retornar DEFAULT_AGENTS si localStorage tiene JSON corrupto', () => {
    localStorage.setItem(AgentStore.getStorageKey(), '{bad json');
    const agents = AgentStore.listAgents();
    expect(agents).toHaveLength(3);
  });

  it('saveAgent() debería persistir un agente nuevo', () => {
    const agent = { name: 'Test', model: 'test', autonomy: 'ask', tools: [], systemPrompt: 'test' } as Agent;
    const saved = AgentStore.saveAgent(agent);
    expect(saved.id).toBeDefined();
    
    const agents = AgentStore.listAgents();
    expect(agents).toContainEqual(expect.objectContaining({ id: saved.id, name: 'Test' }));
  });

  it('saveAgent() debería actualizar un agente existente por ID', () => {
    const agent = AgentStore.listAgents()[0];
    agent.name = 'Updated Name';
    AgentStore.saveAgent(agent);
    
    const agents = AgentStore.listAgents();
    expect(agents[0].name).toBe('Updated Name');
  });

  it('deleteAgent() debería eliminar un agente por ID', () => {
    const agent = AgentStore.listAgents()[0];
    AgentStore.deleteAgent(agent.id);
    
    const agents = AgentStore.listAgents();
    expect(agents).not.toContainEqual(expect.objectContaining({ id: agent.id }));
  });

  it('deleteAgent() no debería crashear si el ID no existe', () => {
    expect(() => {
      AgentStore.deleteAgent('does-not-exist');
    }).not.toThrow();
  });

  it('initDefaultAgents() debería poblar localStorage con los 3 presets', () => {
    AgentStore.initDefaultAgents();
    const raw = localStorage.getItem(AgentStore.getStorageKey());
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toHaveLength(3);
  });
});
