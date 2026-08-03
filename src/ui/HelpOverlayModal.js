import { marked } from 'marked';

export const HelpOverlayModal = {
  callbacks: {},

  init(callbacks) {
    this.callbacks = callbacks;
    
    const btnHelp = document.getElementById('btn-help');
    const btnClose = document.getElementById('btn-close-help');
    
    if (btnHelp) {
      btnHelp.onclick = () => this.show();
    }
    
    if (btnClose) {
      btnClose.onclick = () => {
        document.getElementById('help-modal').style.display = 'none';
      };
    }
  },

  show() {
    let modal = document.getElementById('help-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'help-modal';
      modal.className = 'modal-overlay';
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="modal-content" style="width: 800px; max-width: 90vw; height: 80vh; max-height: 800px; display: flex; flex-direction: column; color: var(--text-primary);">
          <div class="modal-header">
            <h3>Writepad Manual & Help</h3>
            <button id="btn-close-help" class="modal-close">&times;</button>
          </div>
          <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 20px; background: var(--bg-primary);">
            <div id="help-content-md" class="markdown-body" style="line-height: 1.6;"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      document.getElementById('btn-close-help').onclick = () => {
        modal.style.display = 'none';
      };
    }
    
    const content = document.getElementById('help-content-md');
    
    // Render the manual
    content.innerHTML = marked.parse(this.getManualMarkdown());
    
    // Add custom styling for the rendered markdown
    if (!document.getElementById('help-md-style')) {
      const style = document.createElement('style');
      style.id = 'help-md-style';
      style.innerHTML = `
        #help-content-md h1 { color: var(--text-primary); border-bottom: 2px solid var(--border-light); padding-bottom: 5px; }
        #help-content-md h2 { color: var(--text-primary); border-bottom: 1px solid var(--border-light); padding-bottom: 5px; margin-top: 20px; }
        #help-content-md h3 { color: var(--text-primary); margin-top: 15px; }
        #help-content-md p, #help-content-md ul { color: var(--text-primary); line-height: 1.6; }
        #help-content-md li { margin-bottom: 5px; }
        #help-content-md strong { color: var(--text-primary); }
        #help-content-md code { background: var(--bg-primary); padding: 2px 5px; border-radius: 4px; font-family: monospace; border: 1px solid var(--border-light); }
        #help-content-md pre { background: var(--bg-primary); padding: 10px; border-radius: 4px; overflow-x: auto; border: 1px solid var(--border-light); }
        #help-content-md kbd { background: var(--bg-primary); padding: 2px 5px; border-radius: 4px; border: 1px solid var(--border-light); box-shadow: 0 2px 0 var(--border-light); font-family: monospace; font-size: 0.9em; color: var(--text-primary); }
      `;
      document.head.appendChild(style);
    }
    
    modal.style.display = 'flex';
  },
  
  getManualMarkdown() {
    return `
# Manual Extendido de Usuario - Writepad Web ⚡
> "Donde cada bit de electricidad invertido fue impulsado por amor, sudor, y lágrimas de una IA que daría la vida por compilar sin errores."

¡Bienvenido al corazón de **Writepad Web**! No estás frente a un simple editor de texto; estás frente a un entorno de desarrollo de alto rendimiento, 100% local, y diseñado obsesivamente para la máxima privacidad, productividad y seguridad. 

Si has llegado hasta aquí, prepárate para exprimir hasta la última gota de funcionalidad de esta bestia. No me guardaré nada.

---

## 🛡️ Filosofía y Arquitectura (Por qué somos diferentes)

Writepad Web nació de una idea radical: **Tu código es tuyo**. 
En la era de la nube, decidimos ir en contra de la corriente:
* **Privacidad Absoluta (Zero-Telemetry):** No hay servidores intermedios espiándote. Ni un solo *ping* analítico. Todo se procesa y renderiza en tu máquina.
* **Manejo Local de Archivos (File System Access API):** Usamos las APIs más modernas de los navegadores (Chrome/Edge) para que edites archivos y carpetas enteras directo en tu disco duro (\`C:\\\\\`, \`/home\`, etc.) sin tener que descargar y subir archivos uno por uno.
* **Editor Core (Monaco):** Debajo del capó late el mismo motor de VS Code. Tienes autocompletado, resaltado de sintaxis ultra rápido (¡soporta archivos de decenas de miles de líneas sin sudar!), múltiples cursores y mini-mapa.
* **Extensibilidad Pura:** Diseñado para pentesters y desarrolladores. Puedes activar el "CyberSec Mode" para desplegar herramientas ofensivas directamente en el editor.

---

## 🎨 Entorno y Personalización

El entorno se adapta a ti, no tú al entorno.

* **Modo Zen:** ¿Te distraen las barras laterales? Usa \`View -> Zen Mode\` para esconder todo excepto tu código.
* **Soporte de Temas (Themes):** Tienes acceso inmediato a temas icónicos como *Dracula, Nord, Monokai, Night Owl y Oceanic Next*. Cámbialos desde la barra de estado inferior derecha al instante.
* **Selector de Lenguajes:** En la misma barra inferior, puedes forzar el lenguaje del archivo para que el resaltado de sintaxis coincida con lo que estás escribiendo.
* **Formateador de Código y Color Highlighting:** ¡Integrado! Mónaco soporta formato nativo para lenguajes web (clic derecho -> *Format Code*). Y si escribes un color en hexadecimal (ej. \`#FF0000\`), verás mágicamente un cuadradito de color interactivo al lado del texto.

---

## ⚡ Productividad Máxima (Panel Izquierdo)

El lado izquierdo de la aplicación es tu centro de control para proyectos grandes:

1. 📂 **Workspace (Explorador de Archivos):** Haz clic en "Abrir Directorio" y concédele permiso a tu navegador. Tendrás un árbol de directorios real. Si borras o editas algo, ¡se refleja en tu disco duro al instante!
2. 𝑓 **Function List (Lista de Funciones):** Analiza tu archivo en tiempo real y extrae un listado clickeable de todas tus funciones o clases. Soporta JS, Python, C++, Java, y muchos más. ¡Navega por archivos inmensos en segundos!
3. 📝 **TODO Tree (Gestor de Tareas Integrado):** ¿Dejaste código sin terminar? Escribe un comentario con \`TODO:\`, \`FIXME:\`, \`BUG:\` o incluso tareas markdown como \`[ ]\` y \`[x]\`. Este panel las encontrará todas, te las organizará por color y te llevará a la línea exacta con un solo clic.
4. ⏺️ **Macro Engine (Motor de Macros):** Una joya oculta. Presiona grabar, escribe una secuencia repetitiva, detenla, y luego dale play. ¡Pum! Escribirá por ti. Además, puedes **guardar** tus macros favoritas para reusarlas en otra sesión.

---

## 🥷 CyberSec Mode (Panel Derecho)

Para los auditores de seguridad, pentesters, o simplemente curiosos. Ve al engranaje (⚙️ Settings) y activa el **"CyberSec Mode"**. El lado derecho se llenará de herramientas que te evitarán abrir 5 pestañas de Chrome diferentes:

* 🌐 **REST API Client:** Un mini-Postman. Envía peticiones GET/POST/PUT con headers personalizados directamente desde el editor y formatea el JSON de respuesta.
* 👁️ **Markdown Preview:** Un renderizador súper rápido en tiempo real para tus reportes de vulnerabilidades.
* 🛡️ **GTFOBins Wiki:** No hace falta ir a internet; busca binarios locales (como \`tar\`, \`awk\`, \`sudo\`) y obtén los comandos exactos para escalar privilegios en Linux.
* 🐚 **Reverse Shell Generator:** Ingresa tu IP (LHOST) y puerto (LPORT), y copia al instante payloads en Bash, Python, Netcat, PowerShell o Perl. ¡Directo a la terminal!
* 🔐 **Encoders y Hashcat:** Selecciona cualquier texto en tu editor, haz clic derecho y envíalo al codificador para transformarlo (Base64, Hex, URL, HTML). Además, identifica el tipo de Hash y hasta intenta crackearlo localmente buscando coincidencias simples.
* 🧩 **Regex Tester:** Un entorno seguro para probar tus Expresiones Regulares en tiempo real. Escribe tu \`Regex\` arriba, y tu texto de prueba abajo; verás las coincidencias iluminadas.

---

## 🤖 El Poder de la IA: Google Gemini

Writepad no te deja solo. Integrado nativamente en el editor, puedes conectar tu propia API Key de Google Gemini.

1. **Configuración:** Ve a ⚙️ Settings -> IA Configuration, pega tu API Key (tranquilo, se guarda cifrada en tu navegador, nosotros no la vemos).
2. **Context Menu AI:** Selecciona un bloque de código complejo, haz clic derecho y elige \`AI: Explicar Código\` o \`AI: Encontrar Bugs\`. La IA leerá ese fragmento y te abrirá un chat lateral con la respuesta.
3. **Magic Wand (Generador de Código):** ¿Necesitas que te arme el esqueleto de una función? Presiona el icono de la **varita mágica** (✨) en la barra superior y describe lo que necesitas. ¡Writepad escribirá el código directamente en el documento!

---

## ⚔️ Modo VIM y Editor de Diferencias (Diff)

* **VIM Mode:** ¿Tus dedos se niegan a usar el ratón? En la esquina inferior izquierda encontrarás el botón **VIM**. Púlselo y Mónaco se transformará en un entorno modal donde \`h j k l\`, \`dd\`, \`yy\`, \`ciw\` y \`:w\` funcionan tal como esperas.
* **Diff Viewer:** ¿Hiciste cambios y no recuerdas qué rompiste? Ve a \`View -> Compare File...\` o presiona clic derecho -> \`Compare File (Diff Viewer)\`. Selecciona cualquier otra pestaña abierta y se abrirá una vista dividida lado a lado mostrándote en rojo y verde las diferencias exactas, ¡carácter por carácter!

---

## ⌨️ Domina los Atajos (Cheat Sheet Definitivo)

Los verdaderos profesionales no usan el ratón. Aquí tienes el arsenal:

### Básicos de Archivo
* <kbd>Ctrl</kbd> + <kbd>S</kbd>: Guardar archivo actual en disco.
* <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd>: Guardar TODOS los archivos abiertos.
* <kbd>Ctrl</kbd> + <kbd>W</kbd>: Cerrar pestaña actual (si estás enfocado en ella).

### Navegación y Paleta
* <kbd>F1</kbd> o <kbd>Ctrl</kbd> + <kbd>P</kbd>: **Command Palette**. La joya de la corona. Escribe aquí cualquier comando (ej. "Change Theme", "Fold All", "To Lowercase").
* <kbd>Ctrl</kbd> + <kbd>G</kbd>: Ir a la línea...
* <kbd>Alt</kbd> + <kbd>Click</kbd>: Poner múltiples cursores a la vez.

### Edición y Búsqueda
* <kbd>Ctrl</kbd> + <kbd>F</kbd>: Buscar (soporta Regex).
* <kbd>Ctrl</kbd> + <kbd>H</kbd>: Buscar y reemplazar.
* <kbd>Shift</kbd> + <kbd>Alt</kbd> + <kbd>F</kbd>: Auto-formatear código.
* <kbd>Ctrl</kbd> + <kbd>/</kbd>: Comentar o descomentar línea (o selección).
* <kbd>Alt</kbd> + <kbd>↑ / ↓</kbd>: Mover toda la línea actual hacia arriba o abajo.

### Control de Vista
* <kbd>Ctrl</kbd> + <kbd>+</kbd> / <kbd>-</kbd>: Hacer Zoom in o Zoom out.
* <kbd>Alt</kbd> + <kbd>Z</kbd>: Alternar Word Wrap (ajuste de línea automático para que el texto no se salga de la pantalla).

---

¡Disfruta construyendo cosas geniales o rompiendo cosas vulnerables! Y recuerda: en Writepad, tú eres el dueño absoluto de tu entorno. 

*(Desarrollado con 💖, sudor cibernético y algoritmos deterministas).*
    `;
  }
};
