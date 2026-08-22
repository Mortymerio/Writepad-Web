# Writepad Web

> Un IDE web moderno construido sobre Monaco Editor, diseñado para desarrolladores y entusiastas de la ciberseguridad.

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge)](https://mortymerio.github.io/Writepad-Web/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)]()
[![CI](https://img.shields.io/github/actions/workflow/status/Mortymerio/Writepad-Web/ci.yml?style=for-the-badge&logo=github)](https://github.com/Mortymerio/Writepad-Web/actions)

---

## ¿Qué es Writepad Web?

Writepad Web es un clon moderno de Notepad++ que corre 100% en tu navegador. Sin servidores, sin bases de datos, sin rastreo. Tus archivos y secretos nunca abandonan tu computadora.

### Características Principales

| Categoría | Funcionalidades |
|-----------|----------------|
| **Editor** | Multi-pestaña, 40+ temas, modo VIM, Word Wrap, Zoom, motor de macros |
| **IA** | Agentes autónomos (ReAct loop), Copilot inline, hub comunitario de agentes |
| **CyberSec** | RevShells, XSS, SQLi, GTFOBins, Nmap Parser, PEAS Analyzer, Hash Cracker, Encoder, Obfuscator, REST Client, HTTP Repeater |
| **Desarrollo** | Workspace (Folder as Project), Document Map, Function List, TODO Tree, Markdown Preview, Diff Viewer |
| **Extensible** | Sistema de plugins JavaScript |

---

## Quick Start

```bash
# Clonar el repositorio
git clone https://github.com/Mortymerio/Writepad-Web.git
cd Writepad-Web

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir `http://localhost:5173/Writepad-Web/` en el navegador.

---

## Stack Tecnológico

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Editor de código | Monaco Editor | v0.44.0 |
| Bundler | Vite | v8.2.0 |
| Modo VIM | monaco-vim | v0.4.4 |
| Iconos | Lucide | v1.28.0 |
| Hashing | CryptoJS | v4.2.0 |
| Markdown | marked | v18.0.7 |
| Deploy | GitHub Pages | — |

---

## Agentes de IA

Writepad incluye un sistema de agentes autónomos que pueden leer, escribir y editar archivos en tu workspace usando un loop ReAct (Reason → Act → Observe).

### Agentes Preconfigurados

| Agente | Descripción |
|--------|-------------|
| Vibecoder Architect | Genera la estructura de un proyecto a partir de una idea |
| Debugger | Analiza código buscando bugs y propone fixes |
| Documentation Writer | Genera documentación técnica automáticamente |

### Hub Comunitario

Los agentes se comparten vía GitHub Issues:
1. **Publicar:** Clic en ☁️ Publish → se genera un Issue en el repositorio.
2. **Aprobar:** El curador agrega la etiqueta `approved` → un GitHub Action agrega el agente al registry automáticamente.
3. **Importar:** Cualquier usuario puede importar agentes desde el Hub. Se fuerza siempre modo `Ask` por seguridad.

---

## Estructura del Proyecto

```
Writepad-Web/
├── index.html                  Punto de entrada HTML
├── package.json                Dependencias y scripts
├── vite.config.js              Configuración de Vite
├── SPECS.md                    Especificaciones técnicas
├── ROADMAP.md                  Hoja de ruta de desarrollo
├── CODESTYLE.md                Guía de estilo de código
├── public/
│   └── agents_registry.json    Registry oficial de agentes del Hub
├── .github/
│   └── workflows/
│       └── agent-approval.yml  CI/CD para aprobación de agentes
├── src/
│   ├── main.js                 Punto de entrada de la aplicación
│   ├── aiService.js            Wrapper de Google Gemini API
│   ├── aiCopilot.js            Copilot-style context menus
│   ├── PluginManager.js        Sistema de plugins
│   ├── style.css               Estilos globales
│   ├── core/                   Lógica de negocio
│   │   ├── AgentOrchestrator.js
│   │   ├── AgentStore.js
│   │   ├── AgentTools.js
│   │   ├── TabManager.js
│   │   ├── CyberTools.js
│   │   └── ...
│   ├── ui/                     Componentes de interfaz
│   │   ├── SidebarManager.js
│   │   ├── AgentPanel.js
│   │   ├── CommunityHub.js
│   │   └── [+20 paneles]
│   └── data/                   Datasets estáticos
│       ├── gtfobins.json
│       ├── revshells.js
│       └── ...
└── tests/
    └── e2e/                    Tests End-to-End (Playwright)
```

---

## Documentación para Desarrollo

| Documento | Propósito |
|-----------|-----------|
| [SPECS.md](./SPECS.md) | Especificaciones técnicas detalladas, interfaces TypeScript, plan de tests |
| [ROADMAP.md](./ROADMAP.md) | Hoja de ruta con fases, tareas día a día y criterios de aceptación |
| [CODESTYLE.md](./CODESTYLE.md) | Guía de estilo: nombrado, CSS, testing, git, seguridad |

---

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo con HMR |
| `npm run build` | Genera build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción localmente |

---

## Seguridad

- **100% Client-Side:** Cero peticiones a servidores propios. Solo Google Gemini API (si configuras una API key).
- **API Keys:** Se almacenan exclusivamente en `localStorage` de tu navegador.
- **Agentes del Hub:** Se importan forzosamente en modo `Ask` (requieren tu aprobación para cada acción).
- **No Referrer:** `<meta name="referrer" content="no-referrer">` previene filtración de URLs.

---

## Contribuir

1. Fork el repositorio
2. Crea tu feature branch (`git checkout -b feat/mi-feature`)
3. Sigue las convenciones de [CODESTYLE.md](./CODESTYLE.md)
4. Commit con formato Conventional Commits
5. Push y abre un Pull Request

### Contribuir Agentes

1. Crea tu agente en la app (pestaña AI Agents → New Agent)
2. Clic en ☁️ Publish
3. Describe tu agente y envía el Issue
4. Espera la aprobación del curador

---

## Licencia

MIT © [Mortymerio](https://github.com/Mortymerio)
