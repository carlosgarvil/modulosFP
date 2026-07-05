# Sistemas Operativos Monopuesto (SOM)

| UT | Bloque | Horas aprox. |
|---:|---|---:|
| 1 | Fundamentos de los sistemas operativos | 15 |
| 2 | Virtualización y laboratorio | 15 |
| 3 | Instalación de sistemas operativos | 18 |
| 4 | Windows: administración y configuración | 28 |
| 5 | Windows: mantenimiento, seguridad y recuperación | 20 |
| 6 | Linux: administración y terminal | 24 |
| 7 | Linux: mantenimiento, automatización y seguridad | 20 |
| 8 | Despliegue e implantación de sistemas operativos (Periodo Dual) | |
|  | **Total** | **140 h** |

## UT1. Fundamentos de los sistemas operativos (15 h)

**Pregunta guía:** ¿Qué hace realmente un sistema operativo?

### Contenidos

- Evolución de los sistemas operativos.
- Hardware, firmware y software.
- Arquitectura de un sistema operativo.
- Kernel y espacio de usuario.
- Tipos de sistemas operativos.
- Procesos e hilos.
- Planificación de CPU.
- Gestión de memoria.
- Sistemas de archivos.
- Archivos, directorios y permisos.
- Licencias de software.

### Prácticas

- Simulador HTML de procesos.
- Observación de procesos reales.
- Exploración de un sistema de archivos.
- Comparativa Windows/Linux.

## UT2. Virtualización y laboratorio (15 h)

**Pregunta guía:** ¿Cómo podemos experimentar sin romper un ordenador?

### Contenidos

- Virtualización.
- Hipervisores.
- VirtualBox.
- Creación de máquinas virtuales.
- Snapshots.
- Clonación.
- Redes virtuales.
- Exportación e importación.
- Buenas prácticas del laboratorio.

### Prácticas

- Crear una VM.
- Restaurar snapshots.
- Clonar una máquina.
- Compartir una VM con un compañero.

## UT3. Instalación de sistemas operativos (18 h)

**Pregunta guía:** ¿Qué ocurre desde que pulsamos el botón de encendido hasta que aparece el escritorio?

### Contenidos

- BIOS y UEFI.
- GPT y MBR.
- Secure Boot.
- Arranque del sistema.
- Particionado.
- Sistemas de archivos.
- Planificación de instalaciones.
- Instalación de Windows 10.
- Instalación de Ubuntu.
- Dual Boot.
- Actualizaciones.

### Prácticas

- Instalar Windows.
- Crear particiones.
- Configurar VirtualBox.
- Instalar Linux.

## UT4. Administración y configuración de Windows (28 h)

**Pregunta guía:** ¿Cómo se administra correctamente un equipo Windows?

### Contenidos

- Usuarios y grupos.
- Configuración regional.
- Dispositivos.
- Impresoras.
- Red.
- Instalación de aplicaciones.
- PowerShell básico.
- Variables de entorno.
- Procesos.
- Servicios.
- Programador de tareas.
- Herramientas administrativas.

### Prácticas

- Crear usuarios.
- Compartir carpetas.
- Administrar servicios.
- Automatizar pequeñas tareas.

## UT5. Mantenimiento, seguridad y recuperación en Windows (20 h)

**Pregunta guía:** ¿Cómo mantenemos un equipo seguro y funcionando durante años?

### Contenidos

- NTFS y permisos.
- Firewall.
- Microsoft Defender.
- Copias de seguridad.
- Restauración.
- Recuperación del sistema.
- Monitorización.
- Rendimiento.
- Visor de eventos.
- Diagnóstico de problemas.

### Prácticas

- Restaurar un sistema.
- Recuperar archivos.
- Configurar copias automáticas.
- Analizar eventos.

## UT6. Administración de Linux (24 h)

**Pregunta guía:** ¿Cómo se administra Linux desde el escritorio y la terminal?

### Contenidos

- Estructura del sistema Linux.
- Terminal.
- Navegación.
- Usuarios y grupos.
- Permisos.
- sudo.
- Gestión de paquetes.
- Procesos.
- Servicios.
- Dispositivos.
- Redes.
- Almacenamiento.

### Prácticas

- Navegar por el sistema.
- Gestionar usuarios.
- Instalar software.
- Administrar servicios.
- Explorar `/proc` y `/dev`.
- Uso de `ps`, `top`, `htop` y `journalctl`.

## UT7. Mantenimiento, automatización y seguridad en Linux (20 h)

**Pregunta guía:** ¿Cómo podemos administrar Linux de forma eficiente y automatizada?

### Contenidos

- Bash básico.
- Scripts sencillos.
- Variables.
- Automatización.
- cron.
- Copias con rsync.
- Logs.
- Firewall (UFW).
- Recuperación.
- fsck.
- Superbloques.
- Inodos.
- Mantenimiento preventivo.

### Prácticas

- Crear scripts.
- Programar tareas.
- Recuperar sistemas de archivos.
- Diagnosticar averías.

## UT8. Despliegue e implantación de sistemas operativos (Periodo Dual)

**Pregunta guía:** ¿Cómo planifica e implanta un técnico un sistema operativo para un cliente?

**Duración:** 20-24 horas, adaptable según el alumnado que permanezca en el centro.

### Contenidos

#### Planificación de una instalación

- Análisis de las necesidades del cliente.
- Selección del sistema operativo adecuado.
- Compatibilidad hardware.
- Requisitos mínimos y recomendados.
- Elaboración de un plan de instalación.
- Preparación del material técnico.

#### Configuración inicial del sistema

- Configuración regional.
- Creación de usuarios.
- Nombre del equipo.
- Configuración de red.
- Actualizaciones iniciales.
- Instalación del software básico.
- Comprobaciones posteriores a la instalación.

#### Resolución de incidencias

- Problemas habituales durante la instalación.
- Errores de arranque.
- Fallos de particionado.
- Controladores no detectados.
- Recuperación básica.
- Elaboración de informes de incidencias.

#### Licencias y documentación

- Tipos de licencias.
- Software libre y propietario.
- OEM, Retail y licencias por volumen.
- Buenas prácticas legales.
- Elaboración de documentación técnica.
- Checklist de entrega al usuario.

### Prácticas

- Instalación semiautomática con Rufus: el alumnado la realiza.
- Instalación automática con `autounattend.xml`: el alumnado la observa y modifica un par de campos.
- Autoinstall de Ubuntu: el alumnado lee el YAML y ve una demostración.
- Script postinstalación en Bash: el alumnado lo ejecuta y comprueba cómo termina de configurar el sistema.
