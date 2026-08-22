import{i as e}from"./index-C-BDtW-d.js";var t={show(){let t=document.getElementById(`agent-guide-modal`);t||(t=document.createElement(`div`),t.id=`agent-guide-modal`,t.className=`modal-overlay`,t.style.display=`none`,t.innerHTML=`
        <div class="modal-content" style="width: 850px; max-width: 95vw; height: 85vh; max-height: 850px; display: flex; flex-direction: column; color: var(--text-primary); background: #1e1e1e; border: 1px solid #444; border-radius: 8px;">
          <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #444; background: #2d333b; border-radius: 8px 8px 0 0;">
            <h3 style="margin: 0; font-size: 1.2em; color: #58a6ff;">📖 El Camino del Agent-Fu</h3>
            <button id="btn-close-agent-guide" style="background: transparent; border: none; color: #8b949e; font-size: 1.5em; cursor: pointer;">&times;</button>
          </div>
          <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 20px; background: #0d1117;">
            <div id="agent-guide-content-md" class="markdown-body" style="line-height: 1.6; color: #c9d1d9;"></div>
          </div>
        </div>
      `,document.body.appendChild(t),document.getElementById(`btn-close-agent-guide`).onclick=()=>{t.style.display=`none`},t.onclick=e=>{e.target===t&&(t.style.display=`none`)});let n=document.getElementById(`agent-guide-content-md`);if(n.innerHTML=e.parse(this.getGuideMarkdown()),!document.getElementById(`agent-md-style`)){let e=document.createElement(`style`);e.id=`agent-md-style`,e.innerHTML=`
        #agent-guide-content-md h1 { color: #58a6ff; border-bottom: 2px solid #444; padding-bottom: 5px; margin-top: 0; }
        #agent-guide-content-md h2 { color: #58a6ff; border-bottom: 1px solid #444; padding-bottom: 5px; margin-top: 25px; }
        #agent-guide-content-md h3 { color: #3fb950; margin-top: 20px; }
        #agent-guide-content-md p, #agent-guide-content-md ul { color: #c9d1d9; line-height: 1.6; }
        #agent-guide-content-md li { margin-bottom: 8px; }
        #agent-guide-content-md strong { color: #f0f6fc; }
        #agent-guide-content-md em { color: #a5d6ff; font-style: italic; }
        #agent-guide-content-md code { background: #2d333b; padding: 2px 5px; border-radius: 4px; font-family: monospace; border: 1px solid #444; color: #ff7b72; }
        #agent-guide-content-md pre { background: #2d333b; padding: 15px; border-radius: 6px; overflow-x: auto; border: 1px solid #444; }
        #agent-guide-content-md pre code { background: transparent; padding: 0; border: none; color: #c9d1d9; }
        #agent-guide-content-md blockquote { border-left: 4px solid #3fb950; margin: 0; padding-left: 15px; color: #8b949e; font-style: italic; }
      `,document.head.appendChild(e)}t.style.display=`flex`},getGuideMarkdown(){return`
# 🤖 El Camino del Agent-Fu

> *"Un agente no es un simple buscador de respuestas. Es una extensión de tu mente dentro del editor. Dótalos de personalidad, dales herramientas, y obsérvalos construir mundos."*

Bienvenido al sistema de **Agentes Autónomos (v2)**, una de las características más exclusivas, hermosas y potentes de este entorno. Nunca antes tuviste a un escuadrón de IAs viviendo directamente dentro de tu espacio de trabajo, capaces de leer, escribir e inyectar ideas en tiempo real. Este paradigma se conoce como *Vibecoding*: dirigir a un equipo de IAs para que construyan sistemas completos mientras tú simplemente guías la orquesta.

---

## 🛠️ Anatomía de un Agente

Crear un agente es como programar a un colega. Cada agente necesita:
1. **Name:** Su nombre en clave (ej. *Arquitecto*, *Poeta Cyberpunk*, *Auditor de Seguridad*).
2. **System Prompt (El Alma):** Aquí defines **QUIÉN** es y **CÓMO** debe comportarse. ¿Es estricto? ¿Es sarcástico? ¿Tiene prohibido usar código viejo?
3. **Tools (Las Manos):** ¿Qué le permites hacer en tu editor? 
   - \\\`read_current_tab\\\`: Para que vea en qué estás trabajando.
   - \\\`create_document\\\`: Para que genere nuevos archivos.
   - \\\`inject_to_editor\\\`: Para que escriba directamente donde tienes el cursor.
4. **Autonomy (El Collar):** 
   - **Ask:** Te pide permiso con botones antes de mover un solo dedo.
   - **Full-Auto:** Totalmente liberado. El agente trabajará de forma autónoma (vibecoding) hasta terminar su tarea.

---

## ⚠️ La Regla de Oro: Dirección y Precisión

Los agentes son **increíblemente rápidos y proactivos**, pero también son *sistemas literales*. Si los dotas de herramientas poderosas sin brindarles instrucciones precisas, pueden saturarse intentando ejecutar todas las órdenes simultáneamente, o entrar en bucles de ensayo y error.

Para domar a tus agentes, es fundamental dirigirlos con claridad:
- **Paso a paso:** En el *Initial Prompt* (la orden de arranque), indícales un flujo de trabajo lógico. *"Paso 1: lee la pestaña actual. Paso 2: espera confirmación. Paso 3: crea el documento."*
- **Estructura estricta:** Si esperas que generen múltiples archivos o analicen grandes volúmenes de texto, define formatos claros en su System Prompt.
- **Principio de Mínimo Privilegio:** Limita las herramientas. No le otorgues permisos de escritura (\\\`write_file\\\`) a un agente cuyo único propósito sea auditar código de forma pasiva.

---

## 🏗️ Anatomía Práctica: El Vibecoder Architect

Para entender el verdadero poder del *Agent-Fu*, analicemos un agente diseñado específicamente para planificar proyectos enteros: el **Vibecoder Architect**. 

### 1. El System Prompt
En lugar de una instrucción genérica como *"Eres un buen programador"*, el System Prompt define su identidad y su marco de trabajo:
> *"Eres un Ingeniero de Software Senior especializado en desarrollo moderno y arquitectura de sistemas. Tu objetivo es leer la idea inicial del usuario y diseñar una estructura de proyecto robusta, generando especificaciones (SPECS.md) y una hoja de ruta (ROADMAP.md)."*

**¿Por qué funciona?** Establece un rol de autoridad (Senior), un enfoque tecnológico (arquitectura moderna) y una salida esperada exacta (archivos MD específicos). 

### 2. Expansión y Especialización
Este mismo agente puede clonarse y especializarse para distintos ecosistemas:
- **El Especialista Web3:** Modificas su prompt para enfocarse en Smart Contracts (Solidity), forzándolo a generar archivos \\\`SECURITY.md\\\` y \\\`CONTRACT_SPECS.md\\\`.
- **El Diseñador de Videojuegos:** Le pides que genere un \\\`GDD.md\\\` (Game Design Document) y que defina mecánicas, sistemas de monetización y lore, en lugar de arquitectura de software tradicional.

---

## 🚀 Casos de Uso y Ejemplos Épicos

El paradigma de agentes no se limita al código. Aquí tienes ejemplos de cómo aplicar esta tecnología en múltiples disciplinas:

### 📖 Literatura y Escritura Creativa
* **El Constructor de Mundos (Worldbuilder)**
  * **System Prompt:** "Eres un experto en fantasía épica y diseño narrativo. Tu trabajo es leer la historia actual y sugerir conflictos geopolíticos o sistemas de magia coherentes."
  * **Uso:** Le pides que lea el capítulo que estás escribiendo y que use \\\`create_document\\\` para hacer fichas de personajes, líneas de tiempo o mapas conceptuales en nuevas pestañas.

### 📐 Matemáticas y Lógica
* **El Demostrador Implacable**
  * **System Prompt:** "Eres un matemático riguroso. Vas a revisar las demostraciones del usuario. Si detectas un salto lógico, usarás \\\`inject_to_editor\\\` para escribir una nota roja de advertencia explicando el error matemático."
  * **Uso:** Escribes tu teorema o ecuación, ejecutas al agente, y él inserta notas en tu texto corrigiendo tus cálculos al instante.

### 🔬 Desarrollo e Investigación
* **El Creador de Proyectos (Arquitecto)**
  * **System Prompt:** "Eres un Arquitecto de Software. Lees las ideas sueltas del usuario y diseñas la estructura del proyecto (SPECS.md, ROADMAP.md)."
  * **Uso:** Escribes *"Quiero una app de gatitos cyberpunk"*, ejecutas al agente, y él redacta toda la planificación de desarrollo en 4 documentos distintos frente a tus ojos.

### 🛡️ Seguridad Informática
* **El Red Teamer (Auditor Malicioso)**
  * **System Prompt:** "Eres un experto en ciberseguridad ofensiva. Revisa este código y encuentra vulnerabilidades críticas (XSS, SQLi, LFI). Tu objetivo es explotar el sistema."
  * **Uso:** Le otorgas las herramientas \\\`read_current_tab\\\` y \\\`inject_to_editor\\\`. El agente leerá tu script PHP/JS y te inyectará comentarios con los payloads (exploits) exactos que un atacante usaría para vulnerar tu aplicación.

---

> **Atrévete a experimentar.** Comparte tus mejores agentes exportándolos con el botón **Share** y constrúyete un escuadrón de asistentes hiper-especializados. ¡El límite es tu propia creatividad!
    `}};export{t as AgentGuideModal};