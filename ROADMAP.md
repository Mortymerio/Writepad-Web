# ROADMAP.md — Writepad Web v1.0 Development Roadmap

> **Última actualización:** 2026-08-22  
> **Referencia:** [SPECS.md](./SPECS.md) para detalles técnicos completos  
> **Metodología:** Spec Driven Development — Cada fase tiene entregables verificables

---

## Visión General

```
 FASE 0          FASE 1           FASE 2           FASE 3           FASE 4
 Setup &    →   Fundamentos  →   Agente       →   UI/UX        →   Calidad
 Limpieza       Arquitectura     Robusto          Profesional      de Código
 (1 día)        (3 días)         (3 días)         (5 días)         (3 días)
                                                                    
 TS config      Event Bus        Circuit Break    CSS Extraction   Migración TS
 Vitest          Desacoplar       Context Mgr      BEM Classes      Tests Unit
 Rm firebase    TabManager        Timeout          Temas            Tests E2E
                                  Logger           Responsive       CI Pipeline
```

**Duración total estimada:** 15 días de desarrollo  
**Riesgo principal:** Fase 3 (CSS Extraction) es la más larga por volumen de cambios mecánicos

---

## Fase 0: Setup & Limpieza (1 día)

> Preparar el entorno de desarrollo para la migración progresiva.

### Entregables

- [ ] **F0.1** Instalar dependencias: `typescript`, `vitest`, `@vitest/coverage-v8`
- [ ] **F0.2** Crear `tsconfig.json` con `allowJs: true`, `strict: true`, `checkJs: false`
- [ ] **F0.3** Crear `vitest.config.ts` con environment `jsdom`
- [ ] **F0.4** Eliminar `firebase` de `package.json` y limpiar cualquier import residual
- [ ] **F0.5** Crear estructura de carpetas:
  ```
  src/types/          → Interfaces TypeScript compartidas
  src/styles/         → CSS extraídos (preparación para Fase 3)
  src/__tests__/      → Tests de integración
  tests/e2e/          → Tests Playwright
  ```
- [ ] **F0.6** Crear `src/types/agent.ts` y `src/types/events.ts` con las interfaces definidas en SPECS.md
- [ ] **F0.7** Verificar que `npm run build` sigue funcionando correctamente
- [ ] **F0.8** Commit: `chore: setup TypeScript and Vitest infrastructure`

### Criterio de Aceptación
- `npx tsc --noEmit` no lanza errores
- `npx vitest run` ejecuta (aunque sin tests aún)
- `npm run build` produce el bundle correctamente

---

## Fase 1: Fundamentos Arquitectónicos (3 días)

> Crear el Event Bus e iniciar el desacoplamiento del código.

### Día 1: Event Bus

- [ ] **F1.1** Implementar `src/core/EventBus.ts` (singleton, tipado con `EventMap`)
- [ ] **F1.2** Escribir tests unitarios para EventBus (7 casos de SPECS.md §4.1.1)
- [ ] **F1.3** Verificar que todos los tests pasan
- [ ] **F1.4** Commit: `feat(core): add typed EventBus with full test coverage`

### Día 2: Migración de TabManager

- [ ] **F1.5** Integrar EventBus en `TabManager.js`: emitir `TAB_SWITCHED`, `TAB_CREATED`, `TAB_CLOSED`, `TAB_CONTENT_CHANGED`
- [ ] **F1.6** Migrar `MarkdownPreviewPanel.js` para escuchar eventos del bus en lugar de `onDidChangeModelContent` directo
- [ ] **F1.7** Mantener callbacks `.init()` existentes como capa de compatibilidad
- [ ] **F1.8** Commit: `refactor(core): wire TabManager to EventBus`

### Día 3: Migración de AgentOrchestrator

- [ ] **F1.9** Integrar EventBus en `AgentOrchestrator.js`: emitir `AGENT_STARTED`, `AGENT_TOOL_CALL`, `AGENT_COMPLETED`, `AGENT_ERROR`
- [ ] **F1.10** Migrar `AgentPanel.js` para escuchar eventos del bus
- [ ] **F1.11** Agregar `EventBus.debug = true` toggle para logging de desarrollo
- [ ] **F1.12** Commit: `refactor(agents): wire AgentOrchestrator to EventBus`

### Criterio de Aceptación
- EventBus tiene 7/7 tests pasando
- TabManager emite eventos correctamente
- AgentPanel recibe eventos vía bus
- La app funciona exactamente igual que antes desde la perspectiva del usuario
- `npm run build` exitoso

---

## Fase 2: Agente Robusto (3 días)

> Implementar todas las protecciones del agente autónomo.

### Día 4: Circuit Breaker + Timeout

- [ ] **F2.1** Implementar Circuit Breaker en `AgentOrchestrator.js` (SPECS.md §3.2.1)
- [ ] **F2.2** Implementar Timeout por iteración con AbortController combinado (SPECS.md §3.2.3)
- [ ] **F2.3** Escribir tests unitarios para Circuit Breaker (5 casos de SPECS.md §4.1.4)
- [ ] **F2.4** Commit: `feat(agents): add circuit breaker and iteration timeout`

### Día 5: Context Window Manager

- [ ] **F2.5** Implementar `estimateTokens()` y `trimConversationHistory()` (SPECS.md §3.2.2)
- [ ] **F2.6** Integrar en el loop principal de `AgentOrchestrator.js`
- [ ] **F2.7** Escribir tests unitarios (6 casos de SPECS.md §4.1.5)
- [ ] **F2.8** Commit: `feat(agents): add context window manager with token estimation`

### Día 6: Agent Logger + Tests de extractToolCalls

- [ ] **F2.9** Implementar `src/core/AgentLogger.ts` (SPECS.md §3.2.4)
- [ ] **F2.10** Integrar logging en el loop del orchestrator (log cada tool_call, tool_result, error)
- [ ] **F2.11** Escribir tests unitarios para `extractToolCalls()` (8 casos de SPECS.md §4.1.3)
- [ ] **F2.12** Eliminar fallback `window.editor` de AgentTools.js
- [ ] **F2.13** Commit: `feat(agents): add persistent logger and extractToolCalls tests`

### Criterio de Aceptación
- Circuit Breaker detiene al agente tras 3 fallos consecutivos de la misma herramienta
- Context trimming mantiene <100K tokens estimados
- Cada iteración tiene timeout de 60s
- AgentLogger persiste en localStorage con rotación de 500 entradas
- 19/19 tests nuevos pasando (5 + 6 + 8)
- La app funciona correctamente con agentes en modo `ask` y `full-auto`

---

## Fase 3: UI/UX Profesional (5 días)

> Extraer todos los estilos inline a CSS organizado con BEM-lite.

### Día 7: Infraestructura CSS + ToastManager

- [ ] **F3.1** Crear `src/styles/` con archivo `index.css` que importa todos los sub-módulos
- [ ] **F3.2** Definir variables CSS completas (colores del dark mode + todos los temas) en `src/styles/variables.css`
- [ ] **F3.3** Extraer estilos de `ToastManager.js` (10 inline → `src/styles/toast.css`)
- [ ] **F3.4** Reemplazar `style.cssText` por `classList.add()` en ToastManager
- [ ] **F3.5** Commit: `refactor(ui): extract ToastManager styles to CSS module`

### Día 8: AgentPanel

- [ ] **F3.6** Extraer 55+ estilos inline de `AgentPanel.js` → `src/styles/agent-panel.css`
- [ ] **F3.7** Crear clases BEM: `.agent-panel`, `.agent-panel__header`, `.agent-panel__card`, etc.
- [ ] **F3.8** Reemplazar todos los `style.cssText` y `style="..."` en template literals
- [ ] **F3.9** Commit: `refactor(ui): extract AgentPanel styles to CSS module`

### Día 9: CommunityHub + Modales

- [ ] **F3.10** Extraer 35+ estilos de `CommunityHub.js` → `src/styles/hub.css`
- [ ] **F3.11** Extraer estilos de `PublishAgentModal.js`, `CommunityDisclaimerModal.js`, `ImportAgentModal.js` → `src/styles/modals.css`
- [ ] **F3.12** Commit: `refactor(ui): extract Hub and Modal styles to CSS modules`

### Día 10: SidebarManager + MarkdownPreview

- [ ] **F3.13** Extraer 24+ estilos de `SidebarManager.js` → `src/styles/sidebar.css`
- [ ] **F3.14** Extraer estilos de `MarkdownPreviewPanel.js` → `src/styles/markdown-preview.css`
- [ ] **F3.15** Commit: `refactor(ui): extract Sidebar and Markdown styles to CSS modules`

### Día 11: Paneles de Ciberseguridad

- [ ] **F3.16** Extraer ~150 estilos inline de los 18 paneles → `src/styles/panels.css`
- [ ] **F3.17** Crear clases reutilizables: `.panel`, `.panel__header`, `.panel__input`, `.panel__output`, `.panel__btn`, `.panel__badge`
- [ ] **F3.18** Audit final: buscar cualquier `style.cssText` o `style="..."` restante en `src/ui/`
- [ ] **F3.19** Commit: `refactor(ui): extract all CyberSec panel styles to CSS module`

### Criterio de Aceptación
- 0 ocurrencias de `style.cssText` en archivos JS (grep verification)
- Menos de 10 `style="..."` residuales en template literals (solo excepciones justificadas como display toggle)
- Todos los colores hex vienen de variables CSS
- La app se ve idéntica visualmente antes y después
- Todos los temas (Dracula, Nord, Monokai, etc.) siguen funcionando

---

## Fase 4: Calidad de Código (3 días)

> Migrar archivos críticos a TypeScript y establecer el pipeline de CI.

### Día 12: Migración TS de Core

- [ ] **F4.1** Migrar `AgentStore.js` → `AgentStore.ts` (8 tests de SPECS.md §4.1.2)
- [ ] **F4.2** Migrar `CyberTools.js` → `CyberTools.ts` (18 tests de SPECS.md §4.1.6)
- [ ] **F4.3** Commit: `refactor(core): migrate AgentStore and CyberTools to TypeScript`

### Día 13: Tests de Parsers + Integración

- [ ] **F4.4** Extraer funciones puras de `NmapParserPanel.js` y escribir tests (9 casos)
- [ ] **F4.5** Extraer funciones puras de `PeasAnalyzerPanel.js` y escribir tests (8 casos)
- [ ] **F4.6** Escribir tests de integración (4 casos de SPECS.md §4.2)
- [ ] **F4.7** Commit: `test: add parser and integration tests`

### Día 14-15: E2E + CI Pipeline

- [ ] **F4.8** Configurar Playwright con `playwright.config.ts`
- [ ] **F4.9** Escribir tests E2E (15 casos de SPECS.md §4.3)
- [ ] **F4.10** Crear `.github/workflows/ci.yml` con:
  - `npm run build` (verificar que compila)
  - `npx vitest run` (tests unitarios + integración)
  - `npx playwright test` (E2E)
- [ ] **F4.11** Agregar badge de CI al README
- [ ] **F4.12** Commit: `ci: add GitHub Actions pipeline with tests`

### Criterio de Aceptación
- `AgentStore.ts` y `CyberTools.ts` compilan sin errores
- 26+ tests unitarios de core pasando (8 + 18)
- 17+ tests de parsers pasando (9 + 8)
- 4 tests de integración pasando
- 15 tests E2E pasando en Chromium
- Pipeline de CI verde en GitHub Actions
- Cobertura total > 60% en `src/core/`

---

## Post-v1.0: Backlog Futuro

| Item | Prioridad | Descripción |
|------|-----------|-------------|
| WebContainers | Alta | Terminal integrada en el navegador (SPEC-004) |
| Temas claros | Media | Validar que la extracción CSS funciona para temas light |
| Plugin Sandbox | Media | Reemplazar `eval()` en PluginManager por Web Workers |
| Migración TS completa | Baja | Migrar los 18 paneles de CyberSec y `main.js` |
| PWA / Offline | Baja | Service Worker para uso offline |
| Colaboración real-time | Baja | CRDT / Y.js para edición colaborativa |
| LSP en WebContainers | Baja | IntelliSense real para múltiples lenguajes |

---

## Métricas de Éxito

| Métrica | Antes (Baseline) | Objetivo v1.0 |
|---------|-------------------|---------------|
| Tests unitarios | 0 | 69+ |
| Tests E2E | 0 | 15+ |
| Cobertura core/ | 0% | >60% |
| Estilos inline en JS | ~200 | <10 |
| Archivos TypeScript | 0 | 6+ |
| Dependencias no usadas | 1 (firebase) | 0 |
| Circuit Breaker | No | Sí |
| Context Limiting | No | Sí |
| Agent Logging | No | Sí |
| CI Pipeline | No | Sí |
