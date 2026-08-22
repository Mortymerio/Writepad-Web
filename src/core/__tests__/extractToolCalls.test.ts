import { describe, it, expect } from 'vitest';
import { extractToolCalls } from '../AgentOrchestrator';

describe('extractToolCalls', () => {
  it('debería parsear XML válido', () => {
    const xml = '<action name="read_file"><arg name="path">test.js</arg></action>';
    const calls = extractToolCalls(xml);
    expect(calls).toHaveLength(1);
    expect(calls[0].name).toBe('read_file');
    expect(calls[0].arguments).toEqual({ path: 'test.js' });
  });

  it('debería parsear múltiples acciones en un solo bloque', () => {
    const xml = `
      <action name="read_file"><arg name="path">a.js</arg></action>
      <action name="write_file"><arg name="path">b.js</arg></action>
    `;
    const calls = extractToolCalls(xml);
    expect(calls).toHaveLength(2);
    expect(calls[0].name).toBe('read_file');
    expect(calls[1].name).toBe('write_file');
  });

  it('debería manejar argumentos con saltos de línea y caracteres especiales', () => {
    const xml = `<action name="write_file"><arg name="content">
    function test() {
      return 1;
    }
    </arg></action>`;
    const calls = extractToolCalls(xml);
    expect(calls).toHaveLength(1);
    expect(calls[0].arguments.content).toContain('function test()');
  });

  it('debería retornar array vacío si no hay tool calls', () => {
    const calls = extractToolCalls('Just a regular response');
    expect(calls).toHaveLength(0);
  });

  it('debería parsear formato simplificado', () => {
    const xml = '<action><title>list_directory</title></action>';
    const calls = extractToolCalls(xml);
    expect(calls).toHaveLength(1);
    expect(calls[0].name).toBe('list_directory');
    expect(calls[0].arguments).toEqual({});
  });
});
