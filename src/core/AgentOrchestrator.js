import { AIService } from '../aiService.js';
import { TOOL_REGISTRY, executeTool } from './AgentTools.js';
import { EventBus } from './EventBus.js';
import { AgentLogger } from './AgentLogger.js';

const MAX_ITERATIONS = 10;
const MAX_CONTEXT_TOKENS = 100_000;
const ITERATION_TIMEOUT_MS = 60_000;
const MAX_CONSECUTIVE_FAILURES = 3;

function estimateTokens(messages) {
  return messages.reduce((sum, m) => sum + Math.ceil((m.content || '').length / 4), 0);
}

function trimConversationHistory(messages) {
  let totalTokens = estimateTokens(messages);
  while (totalTokens > MAX_CONTEXT_TOKENS && messages.length > 2) {
    // Keep system prompt (index 0) and try to remove oldest messages
    let removeIndex = messages[0].role === 'system' ? 1 : 0;
    // Don't remove the very last message
    if (removeIndex >= messages.length - 1) break;
    messages.splice(removeIndex, 1);
    totalTokens = estimateTokens(messages);
  }
  return messages;
}

function buildToolDefinitions() {
  return TOOL_REGISTRY.map(t => {
    const paramsString = Object.entries(t.parameters).map(([k, v]) => {
      return `${k} (${v.type}${v.required ? ', required' : ''}): ${v.description}`;
    }).join(', ');
    
    return `- ${t.name}: ${t.description}\n  Parameters: ${paramsString}`;
  }).join('\n\n');
}

function buildSystemPromptWithTools(basePrompt, allowedToolsList) {
  const allowedRegistry = TOOL_REGISTRY.filter(t => allowedToolsList.includes(t.name));
  
  const toolDefs = allowedRegistry.map(t => {
    const paramsString = Object.entries(t.parameters).map(([k, v]) => {
      return `${k} (${v.type}${v.required ? ', required' : ''}): ${v.description}`;
    }).join(', ');
    return `- ${t.name}: ${t.description}\n  Parameters: ${paramsString}`;
  }).join('\n\n');

  return `${basePrompt}

## Available Tools

When you need to use a tool, respond ONLY with an XML block in this exact format:
<action name="tool_name">
  <arg name="param1">value1</arg>
</action>

CRITICAL RULES:
- You MUST use this XML format. Do NOT use JSON. Do NOT use markdown code blocks.
- Output the XML directly in the text.
- If you don't need to pass any arguments, just use <action name="tool_name"></action>.

Available tools:
${toolDefs}
`;
}

export function extractToolCalls(content) {
  const toolCalls = [];
  
  const xmlRegex = /<action\s+name="([^"]+)">([\s\S]*?)<\/action>/g;
  let xmlMatch;
  while ((xmlMatch = xmlRegex.exec(content)) !== null) {
    const name = xmlMatch[1];
    const args = {};
    const argsBlock = xmlMatch[2];
    
    const argRegex = /<arg\s+name="([^"]+)">([\s\S]*?)<\/arg>/g;
    let argMatch;
    let hasArgs = false;
    while ((argMatch = argRegex.exec(argsBlock)) !== null) {
      args[argMatch[1]] = argMatch[2].trim();
      hasArgs = true;
    }
    
    if (!hasArgs) {
      const fallbackRegex = /<([a-zA-Z0-9_]+)>([\s\S]*?)<\/\1>/g;
      while ((argMatch = fallbackRegex.exec(argsBlock)) !== null) {
        args[argMatch[1]] = argMatch[2].trim();
      }
    }
    
    toolCalls.push({
      id: ((window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : Math.random().toString(36)),
      name: name,
      arguments: args
    });
  }

  if (toolCalls.length > 0) return toolCalls;

  const match = content.match(/```action\s*\n([\s\S]*?)\n```/);
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      toolCalls.push({
        id: parsed.id || ((window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : Math.random().toString(36)),
        name: parsed.tool || parsed.name,
        arguments: parsed.args || parsed.arguments
      });
    } catch (err) {
      throw new Error(`Failed to parse tool call JSON. You must escape newlines as \\n. Error: ${err}`);
    }
  }

  // Simplified fallback
  const simpleXmlRegex = /<action><title>([^<]+)<\/title><\/action>/g;
  let simpleMatch;
  while ((simpleMatch = simpleXmlRegex.exec(content)) !== null) {
    toolCalls.push({
      id: ((window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : Math.random().toString(36)),
      name: simpleMatch[1],
      arguments: {}
    });
  }

  return toolCalls;
}

export class AgentOrchestrator {
  constructor(editor) {
    this.editor = editor;
    this.pendingApprovals = new Map();
    this.abortController = null;
    this.failureCounter = {};
    // Emulate Event Emitter for AgentPanel component using this locally
    this.listeners = {};
  }

  // Local emitter for UI components relying on it (like AgentPanel)
  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }

  emitLocal(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  approveToolCall(toolCallId, approved) {
    const resolve = this.pendingApprovals.get(toolCallId);
    if (resolve) {
      resolve(approved);
      this.pendingApprovals.delete(toolCallId);
    }
  }

  waitForApproval(toolCallId, signal) {
    return new Promise(resolve => {
      this.pendingApprovals.set(toolCallId, resolve);
      signal.addEventListener('abort', () => {
        this.pendingApprovals.delete(toolCallId);
        resolve(false);
      });
    });
  }

  async *streamLLM(model, messages, signal, systemPrompt) {
    const apiKey = AIService.getApiKey();
    if (!apiKey) throw new Error("API Key not configured.");
    
    const contents = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const payload = {
      contents,
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;
    
    const timeoutController = new AbortController();
    const timer = setTimeout(() => timeoutController.abort(), ITERATION_TIMEOUT_MS);

    // Combine signal from user and timeout
    const combinedSignal = signal.aborted ? signal : timeoutController.signal;
    if (!signal.aborted) {
      signal.addEventListener('abort', () => timeoutController.abort());
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: combinedSignal
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API Error (${res.status}): ${errText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let partial = '';

      const processEvent = function*(eventStr) {
        const dataMatch = eventStr.match(/^data:\s*(.*)/s);
        if (!dataMatch) return;
        
        const json = dataMatch[1].trim();
        if (!json || json === '[DONE]') {
          yield { delta: '', done: true };
          return;
        }
        try {
          const parsed = JSON.parse(json);
          const cand = parsed.candidates?.[0];
          
          if (cand && cand.finishReason && cand.finishReason !== 'STOP') {
            yield { delta: `\n[Agent stopped: ${cand.finishReason} - ${cand.finishMessage || ''}]\n`, done: false };
          }

          const text = cand?.content?.parts?.[0]?.text || '';
          if (text) yield { delta: text, done: false };
        } catch(e) { }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        partial += decoder.decode(value, { stream: true });
        const parts = partial.split(/\r?\n\r?\n/);
        partial = parts.pop() || ''; 

        for (const event of parts) {
          if (event.trim() === '') continue;
          yield* processEvent(event.trim());
        }
      }

      if (partial.trim() !== '') {
        yield* processEvent(partial.trim());
      }
      yield { delta: '', done: true };
    } finally {
      clearTimeout(timer);
    }
  }

  async run(agent, userMessage) {
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    const allowedTools = new Set(agent.tools || []);
    
    EventBus.emit('AGENT_STARTED', { agentId: agent.id || 'unknown' });
    this.emitLocal('started', {});
    
    const systemPrompt = buildSystemPromptWithTools(agent.systemPrompt, agent.tools || []);
    let messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    let iterations = 0;
    this.failureCounter = {};

    while (iterations < MAX_ITERATIONS) {
      if (signal.aborted) break;
      iterations++;

      messages = trimConversationHistory(messages);

      let fullContent = '';
      try {
        const stream = this.streamLLM(agent.model, messages, signal, systemPrompt);
        for await (const chunk of stream) {
          if (signal.aborted) break;
          fullContent += chunk.delta;
          this.emitLocal('chunk', { delta: chunk.delta });
        }
      } catch (err) {
        let msg = String(err.message || err);
        if (err.name === 'AbortError') {
          msg = 'Agent execution aborted by user or timeout.';
        }
        this.emitLocal('error', { message: msg });
        EventBus.emit('AGENT_ERROR', { agentId: agent.id || 'unknown', error: msg });
        AgentLogger.log(agent.id || 'unknown', { type: 'error', data: { message: msg } });
        return;
      }

      AgentLogger.log(agent.id || 'unknown', { type: 'llm_response', data: { content: fullContent } });
      messages.push({ role: 'assistant', content: fullContent });

      let toolCalls = [];
      try {
        toolCalls = extractToolCalls(fullContent);
      } catch (err) {
        messages.push({
          role: 'user',
          content: `Tool call failed: ${err.message || String(err)}. Please correct your format and try again.`
        });
        iterations++;
        continue;
      }

      if (!toolCalls || toolCalls.length === 0) {
        this.emitLocal('done', { content: fullContent });
        EventBus.emit('AGENT_COMPLETED', { agentId: agent.id || 'unknown' });
        return;
      }

      let allResultsText = [];

      for (const toolCall of toolCalls) {
        EventBus.emit('AGENT_TOOL_CALL', { agentId: agent.id || 'unknown', tool: toolCall.name, args: toolCall.arguments });
        AgentLogger.log(agent.id || 'unknown', { type: 'tool_call', data: { tool: toolCall.name, args: toolCall.arguments } });

        if (!allowedTools.has(toolCall.name)) {
          const result = {
            id: toolCall.id,
            name: toolCall.name,
            result: '',
            error: `Tool '${toolCall.name}' is not enabled for this agent`
          };
          this.emitLocal('tool_call', toolCall);
          this.emitLocal('tool_result', result);
          allResultsText.push(`Tool result for ${toolCall.name}: ${result.error}`);
          continue;
        }

        this.emitLocal('tool_call', toolCall);

        if (agent.autonomy === 'ask') {
          const approved = await this.waitForApproval(toolCall.id, signal);
          if (!approved) {
            const result = {
              id: toolCall.id,
              name: toolCall.name,
              result: '',
              error: 'Tool call rejected by user'
            };
            this.emitLocal('tool_result', result);
            allResultsText.push(`Tool result for ${toolCall.name}: Rejected by user`);
            continue;
          }
        }

        let toolResultContent = '';
        try {
          // Fallback globally is removed to enforce context passing
          toolResultContent = await executeTool(toolCall.name, toolCall.arguments, this.context || { editor: this.editor });
          this.failureCounter[toolCall.name] = 0; // Reset on success
        } catch (err) {
          toolResultContent = `Error: ${err.message || String(err)}`;
          this.failureCounter[toolCall.name] = (this.failureCounter[toolCall.name] || 0) + 1;
          
          if (this.failureCounter[toolCall.name] >= MAX_CONSECUTIVE_FAILURES) {
             const cbError = `Circuit breaker activated for tool '${toolCall.name}' after ${MAX_CONSECUTIVE_FAILURES} consecutive failures.`;
             EventBus.emit('AGENT_ERROR', { agentId: agent.id || 'unknown', error: cbError });
             AgentLogger.log(agent.id || 'unknown', { type: 'circuit_break', data: { tool: toolCall.name, error: toolResultContent } });
             this.emitLocal('error', { message: cbError });
             return;
          }
        }

        const result = {
          id: toolCall.id,
          name: toolCall.name,
          result: toolResultContent
        };
        
        AgentLogger.log(agent.id || 'unknown', { type: 'tool_result', data: { tool: toolCall.name, result: toolResultContent } });
        this.emitLocal('tool_result', result);
        allResultsText.push(`Tool result for ${toolCall.name}:\n${toolResultContent}`);
      }

      messages.push({ role: 'user', content: allResultsText.join('\n\n') });
    }

    if (iterations >= MAX_ITERATIONS) {
      const msg = `Max iterations (${MAX_ITERATIONS}) reached.`;
      this.emitLocal('error', { message: msg });
      EventBus.emit('AGENT_ERROR', { agentId: agent.id || 'unknown', error: msg });
    }
  }
}
