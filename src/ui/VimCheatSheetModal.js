import { marked } from 'marked';

export const VimCheatSheetModal = {
  show() {
    let modal = document.getElementById('vim-cheat-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'vim-cheat-modal';
      modal.className = 'modal-overlay';
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="modal-content" style="width: 850px; max-width: 95vw; height: 85vh; max-height: 850px; display: flex; flex-direction: column; color: var(--text-primary);">
          <div class="modal-header">
            <h3>🥋 El Camino del VIM-Fu</h3>
            <button id="btn-close-vim-cheat" class="modal-close">&times;</button>
          </div>
          <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 20px; background: var(--bg-primary);">
            <div id="vim-cheat-content-md" class="markdown-body" style="line-height: 1.6;"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      document.getElementById('btn-close-vim-cheat').onclick = () => {
        modal.style.display = 'none';
      };
    }
    
    const content = document.getElementById('vim-cheat-content-md');
    
    // Render the manual
    content.innerHTML = marked.parse(this.getCheatSheetMarkdown());
    
    // Add custom styling for the rendered markdown
    if (!document.getElementById('help-md-style')) {
      const style = document.createElement('style');
      style.id = 'help-md-style';
      style.innerHTML = `
        .markdown-body h1 { color: var(--text-primary); border-bottom: 2px solid var(--border-light); padding-bottom: 5px; }
        .markdown-body h2 { color: var(--text-primary); border-bottom: 1px solid var(--border-light); padding-bottom: 5px; margin-top: 20px; }
        .markdown-body h3 { color: var(--text-primary); margin-top: 15px; }
        .markdown-body p, .markdown-body ul { color: var(--text-primary); line-height: 1.6; }
        .markdown-body li { margin-bottom: 5px; }
        .markdown-body strong { color: var(--text-primary); }
        .markdown-body code { background: var(--bg-secondary); padding: 2px 5px; border-radius: 4px; font-family: monospace; border: 1px solid var(--border-light); color: var(--accent); }
        .markdown-body pre { background: var(--bg-secondary); padding: 10px; border-radius: 4px; overflow-x: auto; border: 1px solid var(--border-light); }
        .markdown-body kbd { background: var(--bg-secondary); padding: 2px 5px; border-radius: 4px; border: 1px solid var(--border-light); box-shadow: 0 2px 0 var(--border-light); font-family: monospace; font-size: 0.9em; color: var(--text-primary); }
      `;
      document.head.appendChild(style);
    }
    
    modal.style.display = 'flex';
  },
  
  getCheatSheetMarkdown() {
    return `
# 🥋 VIM-Fu: El Arte Marcial de la Edición de Texto
> "VIM no es un editor de texto. Es un lenguaje para hablar con tu editor. Quien domina VIM, domina el tiempo."

VIM (Vi IMproved) es un editor modal. En lugar de estar siempre escribiendo (como en un editor normal), en VIM te mueves entre distintos **modos** de combate. Tus dedos rara vez dejarán la fila central del teclado.

En el **Modo Normal** (tu postura de guardia), cada tecla de tu teclado es un comando. Un golpe preciso.

---

## ☯️ Los 3 Modos Fundamentales

1. **Modo Normal (Normal Mode)**: Presiona <kbd>Esc</kbd>. Aquí no escribes. Aquí navegas, copias, borras y das órdenes. Siempre debes volver a este modo al terminar de editar.
2. **Modo Insertar (Insert Mode)**: Aquí escribes texto normal. Entras presionando <kbd>i</kbd>, <kbd>a</kbd>, <kbd>o</kbd>, etc. Sales con <kbd>Esc</kbd>.
3. **Modo Visual (Visual Mode)**: Para seleccionar texto. Entras presionando <kbd>v</kbd> (por letras) o <kbd>V</kbd> (por líneas enteras).

---

## 👣 Movimiento Básico (Navegando el campo de batalla)
¡Olvida las flechas direccionales y el ratón! 
* <kbd>h</kbd> : Izquierda
* <kbd>j</kbd> : Abajo
* <kbd>k</kbd> : Arriba
* <kbd>l</kbd> : Derecha

*Pro tip: Puedes multiplicarlos. \`5j\` te mueve 5 líneas hacia abajo.*

### Movimiento por palabras
* <kbd>w</kbd> : Salta al inicio de la siguiente palabra.
* <kbd>e</kbd> : Salta al final de la palabra actual.
* <kbd>b</kbd> : Salta al inicio de la palabra anterior.

### Movimiento rápido en la línea
* <kbd>0</kbd> (cero): Salta al principio absoluto de la línea.
* <kbd>^</kbd> : Salta al primer carácter (ignorando espacios en blanco).
* <kbd>$</kbd> : Salta al final de la línea.

### Navegación vertical
* <kbd>gg</kbd> : Ve al inicio del documento.
* <kbd>G</kbd> : Ve al final del documento.
* <kbd>42G</kbd> : Ve a la línea 42.

---

## 🗡️ Inserción (Atacando el documento)
¿Cómo pasamos al Modo Insertar para escribir? Tienes varias armas:
* <kbd>i</kbd> (insert): Inserta texto **antes** del cursor.
* <kbd>a</kbd> (append): Inserta texto **después** del cursor.
* <kbd>I</kbd> (Shift+i): Inserta texto al **principio** de la línea.
* <kbd>A</kbd> (Shift+a): Inserta texto al **final** de la línea.
* <kbd>o</kbd> (open): Abre una nueva línea **debajo** de la actual y entra en modo insertar.
* <kbd>O</kbd> (Shift+o): Abre una nueva línea **encima** de la actual.

---

## ✂️ Edición y Borrado (La danza de las espadas)
El comando de borrar en VIM se llama "delete" (<kbd>d</kbd>).

* <kbd>x</kbd> : Borra el carácter bajo el cursor (como la tecla suprimir).
* <kbd>dw</kbd> : Borra desde el cursor hasta el final de la palabra (*delete word*).
* <kbd>dd</kbd> : Borra la línea entera.
* <kbd>D</kbd> o <kbd>d$</kbd>: Borra desde el cursor hasta el final de la línea.
* <kbd>3dd</kbd> : Borra 3 líneas enteras hacia abajo.

**¡OJO!** En VIM, cuando "borras" algo con \`d\`, en realidad lo estás **cortando**. Queda guardado en el portapapeles de VIM para pegarlo luego.

### Reemplazo rápido
* <kbd>r</kbd> + letra: Reemplaza el carácter bajo el cursor por la letra que elijas y vuelve a Modo Normal al instante. (Ej: \`rx\` reemplaza por una 'x').
* <kbd>c</kbd> (change): Igual que \`d\`, pero te deja en Modo Insertar.
  * <kbd>cw</kbd> : Borra la palabra y te permite escribir una nueva (*change word*).
  * <kbd>cc</kbd> : Borra la línea entera y te deja escribir.

---

## 📋 Copiar y Pegar (Yank & Paste)
Copiar en VIM se dice **Yank** (<kbd>y</kbd>).
* <kbd>yy</kbd> : Copia (yank) la línea actual.
* <kbd>yw</kbd> : Copia la palabra actual.
* <kbd>p</kbd> (paste): Pega lo que hayas copiado (o cortado) **después** del cursor.
* <kbd>P</kbd> (Shift+p): Pega **antes** del cursor.

---

## 🧙‍♂️ Combos Avanzados (El dominio del CHI)
VIM brilla por su gramática: **Acción + Modificador + Movimiento**.
Con la letra <kbd>i</kbd> (inside) o <kbd>a</kbd> (around), puedes hacer magias dentro de comillas, paréntesis o llaves.

* <kbd>ci"</kbd> (*change inside quotes*): Si tu cursor está dentro de un string \`"hola mundo"\`, esto borrará \`hola mundo\` y te dejará escribir algo nuevo, respetando las comillas. ¡Pura magia!
* <kbd>di(</kbd> (*delete inside parentheses*): Borra todo el contenido de los paréntesis actuales.
* <kbd>ya{</kbd> (*yank around braces*): Copia todo el bloque de código entre llaves \`{}\`, incluyendo las llaves mismas.
* <kbd>cit</kbd> (*change inside tag*): Borra el contenido de una etiqueta HTML (ej. de \`<div>texto</div>\` borra "texto") y te deja escribir.

---

## 🔍 Búsqueda y Navegación Precisa
* <kbd>/</kbd> + texto: Busca hacia adelante en el documento. (Ej: \`/function\`).
* <kbd>?</kbd> + texto: Busca hacia atrás.
* <kbd>n</kbd> : Ve a la siguiente coincidencia de la búsqueda.
* <kbd>N</kbd> (Shift+n): Ve a la coincidencia anterior.
* <kbd>*</kbd> (asterisco): Busca instantáneamente otras apariciones de la palabra bajo el cursor.
* <kbd>%</kbd> : Si estás sobre un paréntesis, llave o corchete abierto, te lleva automáticamente a su compañero de cierre. Excelente para auditar funciones gigantes.

---

## 🔁 Deshacer y Rehacer (El control del tiempo)
* <kbd>u</kbd> (undo): Deshace la última acción.
* <kbd>Ctrl</kbd> + <kbd>r</kbd> (redo): Rehace.
* <kbd>.</kbd> (punto): ¡El comando más poderoso! **Repite tu última edición**. Si hiciste un \`cw\` para cambiar una palabra y escribiste algo, puedes ir a otra palabra y presionar \`.\` para hacer exactamente el mismo cambio.

---

## 💾 Comandos de Archivo (Modo Comando Ex)
Presiona <kbd>:</kbd> para abrir la línea de comandos abajo.
* <kbd>:w</kbd> (write): Guarda el archivo.
* <kbd>:q</kbd> (quit): Sale (no aplicable en la web, ¡pero es tradición saberlo!).
* <kbd>:%s/viejo/nuevo/g</kbd> : Busca y reemplaza en todo el archivo.

---
> **"Un verdadero maestro de VIM no piensa en qué teclas apretar; piensa en lo que quiere hacer, y sus dedos ejecutan la danza."**
    `;
  }
};
