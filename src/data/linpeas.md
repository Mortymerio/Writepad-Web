# LinPEAS - Linux Privilege Escalation Awesome Script

LinPEAS es un script extremadamente completo que busca posibles rutas de escalada de privilegios en sistemas Linux/Unix. Busca configuraciones incorrectas, archivos con SUID, contraseñas en texto claro, y vulnerabilidades conocidas.

## Leyenda de Colores (IMPORTANTE)

- **<span style="color:#ff5252; font-weight:bold">Rojo sobre Amarillo</span>**: 99% de probabilidad de ser un vector de escalada de privilegios (¡Revisa esto primero!).
- **<span style="color:#ff5252">Rojo</span>**: Tienes que echarle un vistazo, es algo interesante pero no seguro.
- **<span style="color:#a5d6ff">Azul Celeste</span>**: Algunos usuarios con privilegios, software vulnerable, o configuraciones útiles.
- **<span style="color:#7ee787">Verde</span>**: Configuraciones normales o seguras.

## Ejecución Rápida

### Descargar y Ejecutar Directamente (Desde memoria)
```bash
curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh | sh
```
### Si no tienes curl (Con Wget)
```bash
wget -qO- https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh | sh
```

### Opciones Interesantes
- `-a`: Búsqueda extensa (All). Realizará pruebas más intensas pero puede tomar mucho más tiempo.
- `-o <seccion>`: Ejecutar solo un chequeo específico (ej: `-o system_information,software`).

## Secciones a Revisar con Lupa
1. **System Information**: ¿Hay exploits de kernel conocidos? (Ej: DirtyCow, PwnKit).
2. **Cron Jobs**: ¿Hay tareas programadas ejecutando scripts como root a los que tengas permisos de escritura?
3. **SUID Binaries**: Archivos con permisos SUID. ¡Busca estos binarios en GTFOBins!
4. **Sudo (sudo -l)**: Comandos que puedes ejecutar como root sin contraseña.
5. **Passwords & SSH Keys**: Búsqueda en archivos de historial (`.bash_history`), archivos de configuración, y memoria buscando contraseñas.
6. **Capabilities**: (Ej: `cap_setuid`) Muy similares a los SUID.
7. **NFS Exports**: Directorios exportados con `no_root_squash`.

*Siempre redirige la salida si es muy larga: `./linpeas.sh | tee linpeas_output.txt`.*

## Búsquedas Específicas
A veces no quieres que LinPEAS corra durante 10 minutos. Puedes invocar funciones específicas si ya descargaste el script:

```bash
# Solo buscar archivos con SUID y Capabilities
./linpeas.sh -o suid,capabilities

# Solo buscar contraseñas guardadas y archivos de configuración sensibles
./linpeas.sh -o passwords,software

# Solo revisar contenedores (Docker/LXC) y montajes
./linpeas.sh -o containers,mounts
```

## Tips Pro
- Si el servidor tiene mucha carga (uso de CPU al 100%), LinPEAS puede llegar a colgar el servicio de producción. En entornos reales (fuera de CTF), usa la opción `superfast` o lanza comandos manuales.
- Fíjate siempre en la sección de **"Software Information"**. A veces un binario extraño o una versión obsoleta de Apache/Nginx con exploit público es el camino más fácil.
- Revisa los puertos internos que LinPEAS detecta escuchando en `127.0.0.1`. A menudo hay servicios vulnerables corriendo localmente que no eran accesibles desde fuera.
