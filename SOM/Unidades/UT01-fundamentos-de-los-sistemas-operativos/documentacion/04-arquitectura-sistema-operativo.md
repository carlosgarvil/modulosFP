# Arquitectura del sistema operativo

## Qué es la arquitectura de un sistema operativo

La arquitectura de un sistema operativo describe cómo se organizan sus componentes internos y cómo se comunican entre sí.

Aunque cada sistema operativo tiene sus particularidades, suelen aparecer estos elementos:

- Kernel.
- Controladores.
- Servicios del sistema.
- Bibliotecas.
- Interfaz de usuario.
- Herramientas de administración.

## Kernel

El kernel o núcleo es la parte central del sistema operativo.

Sus responsabilidades principales son:

- Gestionar procesos.
- Asignar memoria.
- Coordinar el acceso a dispositivos.
- Gestionar llamadas al sistema.
- Controlar permisos y seguridad básica.

## Espacio de kernel y espacio de usuario

Para proteger el sistema, muchos sistemas operativos separan dos zonas de ejecución:

- Espacio de kernel: zona privilegiada donde se ejecuta el núcleo y partes críticas del sistema.
- Espacio de usuario: zona donde se ejecutan aplicaciones y procesos normales.

Esta separación evita que una aplicación pueda dañar directamente partes críticas del sistema.

## Controladores

Los controladores o drivers permiten que el sistema operativo se comunique con dispositivos concretos.

Ejemplos:

- Tarjeta gráfica.
- Tarjeta de sonido.
- Impresora.
- Adaptador de red.
- Dispositivo de almacenamiento.

## Interfaces de usuario

El sistema operativo puede ofrecer diferentes interfaces:

- Interfaz gráfica.
- Línea de comandos.
- Menús de configuración.
- Herramientas administrativas.

## Idea clave

El sistema operativo no es un único programa simple, sino un conjunto organizado de componentes que trabajan juntos para hacer usable y seguro el equipo.
