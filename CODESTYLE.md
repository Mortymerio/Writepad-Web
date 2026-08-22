# CODESTYLE.md — Writepad Web Code Style Guide

> **Última actualización:** 2026-08-22  
> **Aplica a:** Todo el código en `src/`

---

## 1. Lenguaje y Tipado

### 1.1 TypeScript Progresivo

- Los archivos **nuevos** se escriben en TypeScript (`.ts`).
- Los archivos **existentes** se migran a `.ts` siguiendo el orden del [ROADMAP.md](./ROADMAP.md).
- `tsconfig.json` mantiene `allowJs: true` para coexistencia.
- **No** usar `any` excepto en interfaces con APIs externas (Monaco, Gemini). Preferir `unknown` + type guard.

```typescript
// ❌ Mal
function process(data: any) { return data.value; }

// ✅ Bien
function process(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String((data as { value: unknown }).value);
  }
  throw new Error('Invalid data');
}
```

### 1.2 Módulos

- Usar `export const` para singletons (no `export default`).
- Usar `export class` para instancias múltiples (como `AgentOrchestrator`).
- Un módulo por archivo. El nombre del archivo debe coincidir con el export principal.

```typescript
// ❌ Mal
export default { foo, bar, baz };

// ✅ Bien
export const MyService = { foo, bar, baz };
```

---

## 2. Arquitectura

### 2.1 Comunicación entre Módulos

- **Prohibido:** Importar un módulo UI desde `core/`.
- **Prohibido:** Acceder a `window.editor` o cualquier global del DOM desde `core/`.
- **Obligatorio:** Usar `EventBus` para comunicación cross-module.
- **Permitido:** Callbacks `.init()` solo como capa de compatibilidad durante la migración.

```
Dirección permitida de dependencias:

  main.js → core/*
  main.js → ui/*
  ui/*    → core/*
  core/*  → core/*

  ❌ core/* → ui/*
  ❌ ui/*  → main.js
```

### 2.2 Patrón de Panel UI

Todos los paneles del sidebar deben seguir esta interfaz:

```typescript
export interface SidebarPanel {
  callbacks: Record<string, Function>;
  init(callbacks: PanelCallbacks): void;
  renderSidebar(container: HTMLElement): void;
}
```

---

## 3. Estilos CSS

### 3.1 Regla de Oro

> **Cero estilos inline en archivos JavaScript.**

```javascript
// ❌ Mal
element.style.cssText = "background: #0d1117; padding: 10px; border-radius: 6px;";
element.style.display = 'flex';
container.innerHTML = `<div style="color: red;">...</div>`;

// ✅ Bien
element.classList.add('hub__card');

// ✅ Excepción permitida: toggle de visibilidad
element.style.display = isVisible ? 'flex' : 'none';
```

### 3.2 Nomenclatura BEM-lite

```css
/* Bloque */
.agent-panel { }

/* Elemento */
.agent-panel__header { }
.agent-panel__card { }
.agent-panel__badge { }

/* Modificador */
.agent-panel__card--active { }
.agent-panel__badge--tool { }
.agent-panel__badge--model { }
```

### 3.3 Variables CSS

- **Todos** los colores deben venir de variables CSS definidas en `:root` o `body.dark-mode`.
- **Prohibido:** Usar valores hex directos en archivos `.css` o `.js`.

```css
/* ❌ Mal */
.hub__card { background: #161b22; border: 1px solid #30363d; }

/* ✅ Bien */
.hub__card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-dark);
}
```

### 3.4 Organización de Archivos CSS

```
src/styles/
├── index.css              ← Importa todos los sub-módulos
├── variables.css          ← :root y dark-mode variables
├── agent-panel.css        ← Estilos de AgentPanel.js
├── hub.css                ← Estilos de CommunityHub.js
├── sidebar.css            ← Estilos de SidebarManager.js
├── modals.css             ← Estilos compartidos de modales
├── toast.css              ← Estilos de ToastManager.js
├── markdown-preview.css   ← Estilos de MarkdownPreviewPanel.js
└── panels.css             ← Estilos compartidos de paneles CyberSec
```

---

## 4. Nombrado

### 4.1 Archivos

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Módulo core | PascalCase | `AgentStore.ts` |
| Módulo UI | PascalCase | `CommunityHub.ts` |
| Tipos/Interfaces | PascalCase en carpeta `types/` | `types/agent.ts` |
| Tests unitarios | `*.test.ts` junto al fuente | `AgentStore.test.ts` |
| Tests E2E | `*.spec.ts` en `tests/e2e/` | `agent.spec.ts` |
| Estilos CSS | kebab-case | `agent-panel.css` |
| Datos estáticos | kebab-case | `gtfobins.json` |

### 4.2 Variables y Funciones

```typescript
// Variables y funciones: camelCase
const activeTabIndex = 0;
function getActiveTab() { }

// Clases: PascalCase
class AgentOrchestrator { }

// Constantes globales: UPPER_SNAKE_CASE
const MAX_ITERATIONS = 10;
const MAX_CONSECUTIVE_FAILURES = 3;

// Tipos e Interfaces: PascalCase con prefijo I opcional (preferir sin)
interface Agent { }
type ToolName = 'read_file' | 'write_file';

// Eventos del bus: UPPER_SNAKE_CASE
EventBus.emit('TAB_SWITCHED', payload);

// CSS variables: kebab-case con prefijo --
--bg-primary, --border-dark, --accent
```

---

## 5. Documentación

### 5.1 Comentarios en Código

- **No** comentar qué hace el código. El código debe ser auto-explicativo.
- **Sí** comentar **por qué** se tomó una decisión no obvia.

```typescript
// ❌ Mal
// Incrementa el contador
counter++;

// ✅ Bien
// Usamos estimación de 4 chars/token porque la tokenización real de Gemini
// no está disponible en el navegador sin el SDK de Python
const estimatedTokens = Math.ceil(text.length / 4);
```

### 5.2 JSDoc para Funciones Públicas

```typescript
/**
 * Extrae tool calls del contenido de respuesta del LLM.
 * Soporta formato XML (<action>) y fallback JSON legacy.
 *
 * @param content - Texto crudo de la respuesta del modelo
 * @returns Array de tool calls parseadas, vacío si no hay ninguna
 */
export function extractToolCalls(content: string): ToolCall[] { }
```

### 5.3 Preservación de Comentarios

- **Nunca** eliminar comentarios existentes que no estén directamente relacionados con tu cambio.
- Si un comentario es incorrecto o desactualizado, actualizarlo, no borrarlo.

---

## 6. Testing

### 6.1 Estructura de Tests

```typescript
describe('AgentStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debería retornar DEFAULT_AGENTS si localStorage está vacío', () => {
    const agents = AgentStore.listAgents();
    expect(agents).toHaveLength(3);
    expect(agents[0].name).toBe('Vibecoder Architect');
  });

  it('debería persistir un agente nuevo', () => {
    const agent = { id: 'test-1', name: 'Test Agent', /* ... */ };
    AgentStore.saveAgent(agent);
    const agents = AgentStore.listAgents();
    expect(agents).toContainEqual(expect.objectContaining({ id: 'test-1' }));
  });
});
```

### 6.2 Reglas de Testing

- Cada función pura **debe** tener al menos 1 test.
- Los tests no deben depender de orden de ejecución.
- Usar `beforeEach` para limpiar estado compartido (localStorage, DOM).
- Nombrar tests en español, describiendo el comportamiento esperado.
- No mockear a menos que sea estrictamente necesario (APIs externas, DOM pesado).

### 6.3 Cobertura Mínima

| Carpeta | Mínimo Requerido |
|---------|-----------------|
| `src/core/` | 60% |
| `src/ui/` | 30% (solo lógica de parseo) |
| `src/types/` | N/A (solo interfaces) |

---

## 7. Git & Commits

### 7.1 Formato de Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<scope>): <descripción>

Tipos:
  feat     → Nueva funcionalidad
  fix      → Corrección de bug
  refactor → Cambio de código sin cambiar comportamiento
  test     → Agregar o modificar tests
  chore    → Tareas de mantenimiento (deps, config)
  ci       → Cambios en CI/CD
  docs     → Documentación

Ejemplos:
  feat(agents): add circuit breaker to orchestrator
  fix(hub): display initial task in hub modal
  refactor(ui): extract AgentPanel styles to CSS module
  test(core): add CyberTools unit tests
  chore: remove unused firebase dependency
```

### 7.2 Reglas de Branch

- `master` → Producción (desplegado en GitHub Pages).
- Feature branches: `feat/<nombre>` (opcional para cambios grandes).
- **Nunca** hacer force push a `master`.
- Cada commit en `master` debe compilar (`npm run build` exitoso).

---

## 8. Seguridad

### 8.1 API Keys

- Las API keys se almacenan **solo** en `localStorage` del navegador del usuario.
- **Nunca** hardcodear API keys en el código fuente.
- **Nunca** enviar API keys a servidores externos (excepto la API de Gemini para la que fueron creadas).

### 8.2 Agentes del Hub

- Todo agente importado del Hub se fuerza a `autonomy: 'ask'`.
- El disclaimer de seguridad debe mostrarse antes del primer acceso al Hub.
- El `issue_number` vincula cada agente a su hilo público de GitHub para auditoría.

### 8.3 innerHTML

- **Prohibido:** Inyectar contenido de usuario directamente en `innerHTML`.
- **Permitido:** `innerHTML` con template literals que solo contienen datos controlados (labels, iconos).
- Para contenido de usuario, usar `textContent` o `innerText`.

```javascript
// ❌ Peligroso
element.innerHTML = userInput;

// ✅ Seguro
element.textContent = userInput;
```

### 8.4 eval / Function

- El uso de `eval()` y `new Function()` en `PluginManager.js` es un riesgo conocido.
- Backlog: Migrar a Web Workers con sandbox (post-v1.0).
