# Gestión de memoria

## Qué es la memoria

La memoria principal, normalmente RAM, almacena temporalmente datos e instrucciones que el procesador necesita usar.

Es más rápida que el almacenamiento secundario, pero su contenido se pierde al apagar el equipo.

## Por qué debe gestionarse

Varios procesos pueden ejecutarse al mismo tiempo y todos necesitan memoria.

El sistema operativo debe:

- Asignar memoria a cada proceso.
- Evitar que un proceso acceda a zonas que no le corresponden.
- Liberar memoria cuando ya no se necesita.
- Usar mecanismos de apoyo cuando la RAM no es suficiente.

## Memoria virtual

La memoria virtual permite que el sistema operativo use parte del almacenamiento como apoyo a la memoria RAM.

Esto permite ejecutar más procesos, pero si se usa en exceso el sistema puede volverse lento porque el almacenamiento es mucho más lento que la RAM.

## Protección de memoria

La protección de memoria impide que un proceso modifique datos de otro proceso o del propio sistema operativo.

Esta protección mejora:

- Estabilidad.
- Seguridad.
- Aislamiento entre aplicaciones.

## Idea clave

La gestión de memoria permite que varios programas compartan el equipo sin interferir entre sí y sin tener que conocer los detalles físicos de la RAM.
