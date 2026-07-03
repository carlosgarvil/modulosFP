# Procesos, hilos y planificación de CPU

## Procesos

Un proceso es un programa en ejecución.

Cuando se abre una aplicación, el sistema operativo crea uno o varios procesos para ejecutarla. Cada proceso necesita recursos como:

- Tiempo de CPU.
- Memoria.
- Archivos abiertos.
- Acceso a dispositivos.

## Estados de un proceso

Un proceso puede pasar por varios estados:

- Nuevo.
- Preparado.
- En ejecución.
- Bloqueado o en espera.
- Finalizado.

El sistema operativo cambia los procesos de estado según lo que estén haciendo y según los recursos disponibles.

## Hilos

Un hilo es una unidad de ejecución dentro de un proceso.

Un proceso puede tener un solo hilo o varios. Los hilos permiten que una aplicación realice varias tareas de forma aparentemente simultánea.

Ejemplo: un navegador puede usar diferentes hilos para la interfaz, la carga de páginas, el sonido o la descarga de archivos.

## Planificación de CPU

La planificación de CPU es la tarea mediante la cual el sistema operativo decide qué proceso o hilo usa el procesador en cada momento.

Esta decisión es necesaria porque normalmente hay más procesos que procesadores disponibles.

## Objetivos de la planificación

- Repartir el tiempo de CPU.
- Evitar que un proceso bloquee todo el sistema.
- Dar respuesta rápida a las tareas interactivas.
- Aprovechar bien los recursos.

## Práctica relacionada

Esta parte se conecta con el simulador HTML de procesos y con la observación de procesos reales en Windows o Linux.
