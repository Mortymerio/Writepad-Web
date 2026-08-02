export class AIService {
  static getApiKey() {
    return localStorage.getItem('ai-api-key') || '';
  }

  static getModel() {
    return localStorage.getItem('ai-model') || 'gemini-1.5-pro';
  }

  static async generateCompletion(prompt, contextText = '') {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("No has configurado la API Key de Gemini. Ve al menú superior 'AI ✨' para configurarla.");
    }

    const model = this.getModel();
    
    // Construct the payload matching M3Flow's gemini call structure
    const baseSystemMessage = "Eres un programador experto ayudando a modificar o explicar código en Writepad Web. Si se te pide refactorizar, optimizar o crear código, responde SOLO con el código resultante, sin backticks de markdown (```), para que pueda ser insertado directamente en el editor. Si se te pide explicar, puedes usar markdown normal.";
    
    const fullPromptContext = contextText 
      ? `=== CONTEXTO DEL ARCHIVO ACTUAL ===\n${contextText}\n\n=== INSTRUCCIÓN DEL USUARIO ===\n${prompt}`
      : prompt;

    const payload = {
      contents: [{
        parts: [{
          text: fullPromptContext
        }]
      }],
      systemInstruction: {
        parts: [{ text: baseSystemMessage }]
      }
    };

    // We use v1beta as it supports systemInstruction
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message || 'Error en Gemini API');

    if (data.candidates && data.candidates.length > 0) {
      const cand = data.candidates[0];
      if (cand.content?.parts?.[0]?.text) {
        let text = cand.content.parts[0].text;
        // Clean up markdown block if it's pure code replacement
        if (text.startsWith('```') && text.endsWith('```')) {
          const lines = text.split('\n');
          lines.shift(); // remove first line (e.g. ```javascript)
          lines.pop(); // remove last line (```)
          text = lines.join('\n');
        }
        return text;
      } else if (cand.finishReason && cand.finishReason !== 'STOP') {
        throw new Error(`Gemini bloqueó la respuesta. Motivo: ${cand.finishReason}`);
      }
    }
    return '';
  }
}
