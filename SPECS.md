# SPECS.md — Writepad Web v1.0 Technical Specification

> **Documento generado:** 2026-08-22  
> **Estado:** Draft — Pendiente de aprobación del autor  
> **Baseline auditada:** 40+ archivos fuente, ~4,500 LOC en `src/`

---

## 1. Resumen Ejecutivo

Writepad Web es un IDE web construido sobre Monaco Editor con capacidades de ciberseguridad ofensiva y agentes autónomos de IA. Actualmente funciona como un Proof-of-Concept exitoso, pero presenta deuda técnica significativa que limita su escalabilidad, mantenibilidad y robustez.

Este documento especifica **5 ejes de mejora** identificados durante la auditoría completa del codebase:

| # | Eje | Severidad | Esfuerzo |
|---|-----|-----------|----------|
| 1 | Event Bus y Desacoplamiento | Alta | Medio |
| 2 | Protección del Agente (Circuit Breaker + Context Limits) | Crítica | Medio |
| 3 | Sistema de Estilos (CSS-in-JS → CSS Modules) | Media | Alto |
| 4 | Sandboxing y Ejecución (WebContainers) | Media | Alto |
| 5 | TypeScript y Testing | Alta | Alto |

---

## 2. Estado Actual del Codebase (Baseline)

### 2.1 Estructura de Archivos

```
src/
├── main.js                    (1,089 líneas — Punto de entrada monolítico)
├── aiService.js               (Wrapper de Google Gemini API)
├── aiCopilot.js               (Copilot-style context menus)
├── PluginManager.js           (Sistema de plugins vía eval/Function)
├── EditorState.js             (Estado serializable del editor)
├── style.css                  (CSS global con variables de tema)
├── core/
│   ├── AgentOrchestrator.js   (339 líneas — Loop ReAct autónomo)
│   ├── AgentStore.js          (77 líneas — CRUD localStorage)
│   ├── AgentTools.js          (257 líneas — Registry de 8 herramientas)
│   ├── TabManager.js          (308 líneas — Gestión de pestañas)
│   ├── CyberTools.js          (196 líneas — Utilidades criptográficas)
│   ├── ToolsManager.js        (164 líneas — Hashing con CryptoJS)
│   ├── MacroEngine.js         (Motor de macros)
│   ├── ColorHighlighter.js    (Resaltado de colores inline)
│   └── EncodingManager.js     (Soporte multi-encoding)
├── ui/
│   ├── SidebarManager.js      (798 líneas — Hub de 20+ paneles)
│   ├── AgentPanel.js          (504 líneas — UI de agentes)
│   ├── CommunityHub.js        (239 líneas — Hub comunitario GitHub)
│   ├── MenuManager.js         (244 líneas — Menú superior)
│   ├── ToolbarManager.js      (141 líneas — Barra de herramientas)
│   ├── ToastManager.js        (131 líneas — Notificaciones)
│   ├── MarkdownPreviewPanel.js(81 líneas — Preview de Markdown)
│   └── [+18 paneles de ciberseguridad]
├── data/
│   └── gtfobins.json, sqli.json, xss.js, revshells.js, etc.
└── assets/
```

### 2.2 Problemas Identificados

#### P1: Acoplamiento Directo (Sin Event Bus)
- `main.js` inyecta callbacks en 12+ módulos vía `.init({ getEditor, getTabs, ... })`.
- `AgentPanel.js` importa directamente 7+ módulos.
- `SidebarManager.js` realiza 20+ `import()` dinámicos de paneles.
- **Consecuencia:** Cambiar la firma de un callback rompe múltiples módulos sin warning.

#### P2: Agente sin Protecciones
- `AgentOrchestrator.js` tiene `MAX_ITERATIONS = 10` pero **no** tiene: Circuit Breaker, límite de tokens/contexto, timeout por iteración, ni logging persistente.
- `AgentTools.js` referencia `window.editor` como fallback global.

#### P3: CSS Inline Masivo (~200+ definiciones en UI/)
- **AgentPanel.js:** 55+ estilos inline.
- **CommunityHub.js:** 35+ estilos inline.
- **SidebarManager.js:** 24+ estilos inline.
- **Consecuencia:** Imposible cambiar el tema sin buscar/reemplazar en 20+ archivos JS.

#### P4: Sin Capacidad de Ejecución Real
- No hay terminal integrada ni capacidad de ejecutar comandos del sistema.

#### P5: Sin Tipado ni Tests
- 0 tests unitarios, 0 tests de integración, 0 tests E2E.
- `playwright` y `jsdom` en devDependencies pero sin configurar.

---

## 3. Especificaciones de Mejora

### 3.1 SPEC-001: Event Bus Centralizado

**Objetivo:** Desacoplar la comunicación entre módulos con un sistema Pub/Sub.

**API:**
```
src/core/EventBus.ts (NUEVO)
├── on(event, handler)
├── off(event, handler)
├── emit(event, payload)
├── once(event, handler)
└── clear()
```

**Eventos a Registrar:**

| Evento | Emisor | Consumidores |
|--------|--------|-------------|
| `TAB_SWITCHED` | TabManager | MarkdownPreview, AgentPanel, StatusBar |
| `TAB_CREATED` | TabManager | SidebarManager (Document List) |
| `TAB_CLOSED` | TabManager | SidebarManager, StatusBar |
| `TAB_CONTENT_CHANGED` | TabManager | MarkdownPreview, TodoTree, ColorHighlighter |
| `EDITOR_SELECTION_CHANGED` | main.js | CyberTools, StatusBar |
| `WORKSPACE_LOADED` | SidebarManager | AgentTools, StatusBar |
| `AGENT_STARTED` | AgentOrchestrator | AgentPanel |
| `AGENT_TOOL_CALL` | AgentOrchestrator | AgentPanel |
| `AGENT_COMPLETED` | AgentOrchestrator | AgentPanel |
| `AGENT_ERROR` | AgentOrchestrator | AgentPanel, ToastManager |
| `THEME_CHANGED` | MenuManager | ToastManager, todos los paneles |

**Migración:** Incremental, un módulo a la vez, empezando por `TabManager`.

---

### 3.2 SPEC-002: Protección del Agente

#### Circuit Breaker
- Contador de fallos consecutivos por herramienta.
- `MAX_CONSECUTIVE_FAILURES = 3` → emitir `circuit_break` y detener.

#### Context Window Manager
- `MAX_CONTEXT_TOKENS = 100,000` (1 token ≈ 4 chars).
- `trimConversationHistory()` preserva system prompt + último mensaje usuario.

#### Timeout por Iteración
- `ITERATION_TIMEOUT_MS = 60,000` con AbortController combinado.

#### Logging Persistente (`AgentLogger.ts`)
- localStorage con rotación de 500 entradas por agente.
- Tipos: `tool_call`, `tool_result`, `llm_response`, `error`, `circuit_break`.

---

### 3.3 SPEC-003: Sistema de Estilos

**Convención BEM-lite** con extracción a archivos CSS dedicados:

| Módulo | Estilos Inline | Archivo CSS Destino |
|--------|---------------|-------------------|
| AgentPanel.js | 55+ | `src/styles/agent-panel.css` |
| CommunityHub.js | 35+ | `src/styles/hub.css` |
| SidebarManager.js | 24+ | `src/styles/sidebar.css` |
| Modales | 25+ | `src/styles/modals.css` |
| ToastManager.js | 10 | `src/styles/toast.css` |
| Paneles CyberSec (x18) | ~150 | `src/styles/panels.css` |

**Reglas:** Todos los colores hardcodeados → variables CSS. Cada `style.cssText` → `classList.add()`.

---

### 3.4 SPEC-004: Sandboxing (Pospuesto a v2.0)

Tecnología: WebContainers (StackBlitz). Requiere validar COOP/COEP.

---

### 3.5 SPEC-005: TypeScript y Testing

**Orden de migración:** AgentStore → EventBus → AgentLogger → CyberTools → AgentOrchestrator → AgentTools → TabManager → Paneles UI.

**Framework:** Vitest + jsdom (unitarios), Playwright (E2E).

---

## 4. Plan de Tests (~80 casos)

### 4.1 Tests Unitarios (Vitest)

**EventBus (7):** registro, emisión, desubscripción, once, múltiples subscribers, payloads, clear.

**AgentStore (8):** defaults vacío, JSON corrupto, save nuevo, update existente, delete, delete inexistente, init defaults, schema.

**extractToolCalls (8):** XML válido, múltiples acciones, args multilinea, fallback JSON, sin calls, XML malformado, formato simplificado, HTML entities.

**Circuit Breaker (5):** reset tras éxito, incremento fallo, error tras 3 fallos, independencia tools, evento circuit_break.

**Context Manager (6):** estimación tokens, preservar system prompt, preservar último usuario, trim intermedios, no modificar si OK, vacíos.

**CyberTools (18):** Base64 (ASCII/Unicode/inválido), Hex (encode/decode/sanitize), Shannon (repetido/equiprobable/aleatorio/vacío), IOC (IP/URL/Email/dedup/vacío), Defang/Refang/idempotencia, JWT (decode/URL-safe/malformado), ROT13 (rot/inversa/no-alpha), XOR (key/inversa).

**NmapParser (9):** IP simple, IP+hostname, puertos, múltiples puertos, cmds HTTP/SMB/SSH, sin puertos, vacío.

**PeasAnalyzer (8):** CVE extraction, dedup, SUID, Capabilities, Cron, Credentials, Markdown, sin hallazgos.

### 4.2 Tests de Integración (4)
- Crear agente → guardar → recuperar.
- Importar agente del hub → forzar ask.
- Publicar agente → generar URL de Issue.
- Tab lifecycle.

### 4.3 Tests E2E Playwright (15)
- Editor: carga, nueva tab, abrir archivo, guardar, cambiar tema.
- Agentes: panel visible, crear, ejecutar, modo ask, error sin API key.
- Hub: cargar registry, disclaimer, importar, publicar.
- Markdown: preview .md, actualización real-time, error no-.md.

---

## 5. Tipos TypeScript Clave

```typescript
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
  editor: monaco.editor.IStandaloneCodeEditor;
  workspaceHandle?: FileSystemDirectoryHandle;
}

export interface AgentLogEntry {
  timestamp: string;
  type: 'tool_call' | 'tool_result' | 'llm_response' | 'error' | 'circuit_break';
  data: Record<string, unknown>;
}

export interface EventMap {
  TAB_SWITCHED: { index: number; tab: Tab };
  TAB_CREATED: { index: number; tab: Tab };
  TAB_CLOSED: { index: number };
  TAB_CONTENT_CHANGED: { index: number };
  WORKSPACE_LOADED: { handle: FileSystemDirectoryHandle };
  AGENT_STARTED: { agentId: string };
  AGENT_TOOL_CALL: { agentId: string; tool: string; args: Record<string, string> };
  AGENT_COMPLETED: { agentId: string };
  AGENT_ERROR: { agentId: string; error: string };
  THEME_CHANGED: { theme: string };
}

export interface Tab {
  title: string;
  content: string;
  model: monaco.editor.ITextModel;
  encoding: string;
  filePath?: string;
  fileHandle?: FileSystemFileHandle;
}
```

---

## 6. Dependencias

**Nuevas:** `typescript`, `vitest`, `@vitest/coverage-v8` (devDeps).

**A eliminar:** `firebase` (Cloud Sync removido, infla el bundle).

---

## 7. Restricciones de Diseño

1. **Incrementalidad:** Cada commit debe ser funcional. Build nunca se rompe.
2. **`allowJs: true`:** Coexistencia JS+TS durante migración.
3. **Sin frameworks UI:** Vanilla JS/TS. No React, Vue, ni Svelte.
4. **GitHub Pages:** No se migra de host.
5. **WebContainers pospuesto a v2.0.**
6. **Tests opcionales en CI** hasta cobertura mínima del 60%.
