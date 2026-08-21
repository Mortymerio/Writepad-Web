import { AIService } from '../aiService.js';
import { TOOL_REGISTRY, executeTool } from './AgentTools.js';

const MAX_ITERATIONS = 10;

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
  
  // Support the new XML format for multiple calls
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

  // Fallback for old JSON format in case it still generates it (only extracts the first one)
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

  return toolCalls;
}

// Simple event emitter implementation for browser
class EventEmitter {
  constructor() {
    this.listeners = {};
  }
  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

export class AgentOrchestrator extends EventEmitter {
  constructor(editor) {
    super();
    this.editor = editor;
    this.pendingApprovals = new Map();
    this.abortController = null;
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

  // Wraps AIService.generateCompletion to support streaming if possible, 
  // or falls back to non-streaming if AIService doesn't support it natively yet.
  async *streamLLM(model, messages, signal, systemPrompt) {
    const apiKey = AIService.getApiKey();
    if (!apiKey) throw new Error("API Key not configured.");
    
    // We rewrite the Gemini API call to support proper streaming (SSE)
    const contents = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const payload = {
      contents,
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal
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
          // If the model was blocked or encountered an API error, yield it so the user knows why it stopped
          yield { delta: `\n[Agent stopped: ${cand.finishReason} - ${cand.finishMessage || ''}]\n`, done: false };
        }

        const text = cand?.content?.parts?.[0]?.text || '';
        if (text) yield { delta: text, done: false };
      } catch(e) {
         // ignore parse errors for partial chunks
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      partial += decoder.decode(value, { stream: true });
      
      // SSE events can be separated by \r\n\r\n or \n\n
      const parts = partial.split(/\r?\n\r?\n/);
      partial = parts.pop() || ''; // Keep the last incomplete chunk

      for (const event of parts) {
        if (event.trim() === '') continue;
        yield* processEvent(event.trim());
      }
    }

    // Process anything left in partial after stream ends
    if (partial.trim() !== '') {
      yield* processEvent(partial.trim());
    }

    yield { delta: '', done: true };
  }

  async run(agent, userMessage) {
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    const allowedTools = new Set(agent.tools || []);
    
    const systemPrompt = buildSystemPromptWithTools(agent.systemPrompt, agent.tools || []);
    const messages = [
      { role: 'user', content: userMessage }
    ];

    let iterations = 0;

    while (iterations < MAX_ITERATIONS) {
      if (signal.aborted) break;
      iterations++;

      let fullContent = '';
      try {
        const stream = this.streamLLM(agent.model, messages, signal, systemPrompt);
        for await (const chunk of stream) {
          if (signal.aborted) break;
          fullContent += chunk.delta;
          this.emit('chunk', { delta: chunk.delta });
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          this.emit('error', { message: 'Agent execution aborted by user.' });
        } else {
          this.emit('error', { message: String(err.message || err) });
        }
        return;
      }

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
        this.emit('done', { content: fullContent });
        return;
      }

      let allResultsText = [];

      for (const toolCall of toolCalls) {
        if (!allowedTools.has(toolCall.name)) {
          const result = {
            id: toolCall.id,
            name: toolCall.name,
            result: '',
            error: `Tool '${toolCall.name}' is not enabled for this agent`
          };
          this.emit('tool_call', toolCall);
          this.emit('tool_result', result);
          allResultsText.push(`Tool result for ${toolCall.name}: ${result.error}`);
          continue;
        }

        this.emit('tool_call', toolCall);

        if (agent.autonomy === 'ask') {
          const approved = await this.waitForApproval(toolCall.id, signal);
          if (!approved) {
            const result = {
              id: toolCall.id,
              name: toolCall.name,
              result: '',
              error: 'Tool call rejected by user'
            };
            this.emit('tool_result', result);
            allResultsText.push(`Tool result for ${toolCall.name}: Rejected by user`);
            continue;
          }
        }

        let toolResultContent = '';
        try {
          toolResultContent = await executeTool(toolCall.name, toolCall.arguments, this.context || { editor: window.editor });
        } catch (err) {
          toolResultContent = `Error: ${err.message || String(err)}`;
        }

        const result = {
          id: toolCall.id,
          name: toolCall.name,
          result: toolResultContent
        };
        this.emit('tool_result', result);
        allResultsText.push(`Tool result for ${toolCall.name}:\n${toolResultContent}`);
      }

      messages.push({ role: 'user', content: allResultsText.join('\n\n') });
    }

    if (iterations >= MAX_ITERATIONS) {
      this.emit('error', { message: `Max iterations (${MAX_ITERATIONS}) reached.` });
    }
  }
}
