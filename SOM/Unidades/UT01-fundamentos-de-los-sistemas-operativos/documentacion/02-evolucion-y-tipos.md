# Evolución y tipos de sistemas operativos

## ¿Por qué aparecieron los sistemas operativos?

Los primeros ordenadores electrónicos no disponían de un sistema operativo como los conocemos en la actualidad. Cada programa se cargaba manualmente y el ordenador se dedicaba exclusivamente a ejecutar esa tarea.

El operador debía preparar el equipo, cargar el programa mediante tarjetas perforadas o cintas magnéticas y esperar a que finalizara su ejecución antes de comenzar el siguiente trabajo. El proceso era lento y requería la intervención constante de personas especializadas.

Conforme los ordenadores fueron aumentando su potencia y reduciendo su precio, surgió la necesidad de aprovechar mejor sus recursos. Los usuarios querían ejecutar varios programas, compartir el equipo con otras personas y utilizar dispositivos cada vez más complejos.

Como respuesta a estas necesidades aparecieron los sistemas operativos.

> Un sistema operativo puede entenderse como el conjunto de programas que permiten utilizar el hardware del ordenador de forma sencilla, segura y eficiente.

---

# Evolución histórica de los sistemas operativos

La evolución de los sistemas operativos está muy relacionada con la evolución del hardware. Cada mejora en los ordenadores hizo posible nuevas funciones.

## 1. Sistemas por lotes (Batch Systems)

Los primeros ordenadores eran extremadamente caros y sólo podían ejecutar un programa cada vez.

Los usuarios entregaban sus programas en tarjetas perforadas al operador del centro de cálculo. El operador agrupaba varios trabajos similares en un lote (*batch*) para ejecutarlos uno detrás de otro.

Durante la ejecución no existía interacción con el usuario.

### Características

* Un único programa en ejecución.
* Sin interacción con el usuario.
* Elevado tiempo de espera.
* Gran aprovechamiento del tiempo del ordenador.

### Ventajas

* Automatizaban parcialmente el trabajo.
* Reducían el tiempo perdido entre programas.

### Inconvenientes

* Los errores se descubrían horas después.
* El usuario no podía intervenir durante la ejecución.

**Ejemplo histórico**

IBM System/360.

**[IMAGEN PROPUESTA: fotografía de tarjetas perforadas o de un centro de cálculo de los años 60.]**

---

## 2. Sistemas de tiempo compartido

Con el aumento de la velocidad de los procesadores surgió una idea revolucionaria: permitir que varios usuarios utilizaran el mismo ordenador al mismo tiempo.

En realidad, el procesador iba alternando muy rápidamente entre los distintos programas, dando la sensación de que todos se ejecutaban simultáneamente.

Este modelo dio lugar a los primeros sistemas multiusuario.

### Características

* Varios usuarios.
* Terminales conectados al ordenador central.
* Reparto del tiempo del procesador.
* Aparición de los primeros mecanismos de protección entre usuarios.

### Importancia

Muchos conceptos actuales nacieron en esta época:

* usuarios
* permisos
* procesos
* planificación del procesador
* memoria protegida

---

## 3. Sistemas personales

La llegada del ordenador personal cambió completamente la informática.

Ya no era necesario compartir un gran ordenador con cientos de usuarios. Cada persona podía disponer de su propio equipo.

Durante esta etapa aparecieron sistemas como:

* MS-DOS
* Macintosh System Software
* primeras versiones de Windows

Estos sistemas estaban orientados principalmente al uso doméstico y profesional.

---

## 4. Sistemas con interfaz gráfica

Durante muchos años los ordenadores se manejaban escribiendo comandos.

Las interfaces gráficas (GUI, *Graphical User Interface*) permitieron controlar el ordenador mediante ventanas, iconos, menús y ratón.

Esto hizo que la informática fuera accesible para millones de personas.

Actualmente prácticamente todos los sistemas operativos incorporan una interfaz gráfica.

Ejemplos:

* Windows 11
* Ubuntu Desktop
* macOS

**[IMAGEN PROPUESTA: comparación entre MS-DOS y un escritorio moderno.]**

---

## 5. Sistemas conectados en red

La expansión de Internet hizo que los sistemas operativos dejaran de trabajar de forma aislada.

Comenzaron a ofrecer servicios como:

* conexión a Internet;
* compartición de archivos;
* impresión en red;
* acceso remoto;
* autenticación de usuarios;
* servicios web.

Aparecieron sistemas especializados en servidores, capaces de atender simultáneamente a cientos o miles de usuarios.

---

## 6. Sistemas actuales

Los sistemas operativos actuales son mucho más complejos que los de hace unas décadas.

Además de gestionar el hardware, ofrecen funciones relacionadas con:

* virtualización;
* seguridad;
* cifrado;
* computación en la nube;
* sincronización entre dispositivos;
* inteligencia artificial;
* actualización automática.

Hoy es habitual que una misma persona utilice varios sistemas operativos a diario:

* ordenador personal;
* teléfono móvil;
* tableta;
* televisor inteligente;
* reloj inteligente;
* consola.

---

# Tipos de sistemas operativos

Los sistemas operativos pueden clasificarse utilizando distintos criterios.

## Según el número de usuarios

### Monousuario

Sólo un usuario utiliza el sistema de forma simultánea.

Ejemplos:

* MS-DOS
* primeras versiones de Windows

### Multiusuario

Permiten que varios usuarios trabajen al mismo tiempo sobre el mismo equipo.

Ejemplos:

* GNU/Linux
* Windows Server
* UNIX

---

## Según el número de tareas

### Monotarea

Sólo permiten ejecutar un programa cada vez.

Ejemplo:

MS-DOS.

### Multitarea

Permiten ejecutar varios programas simultáneamente.

Es el funcionamiento habitual de todos los sistemas actuales.

Por ejemplo, un ordenador puede estar:

* reproduciendo música;
* descargando archivos;
* editando un documento;
* navegando por Internet.

Todo ello al mismo tiempo.

---

## Según el tipo de dispositivo

### Sistemas de escritorio

Pensados para ordenadores personales.

Ejemplos:

* Windows
* Ubuntu
* macOS

### Sistemas de servidor

Optimizados para ofrecer servicios de red durante largos periodos de tiempo.

Ejemplos:

* Ubuntu Server
* Debian
* Windows Server

### Sistemas móviles

Diseñados para teléfonos y tabletas.

Ejemplos:

* Android
* iOS

### Sistemas empotrados (Embedded)

Se ejecutan dentro de dispositivos electrónicos.

Por ejemplo:

* routers;
* televisores inteligentes;
* automóviles;
* electrodomésticos;
* cajeros automáticos;
* maquinaria industrial.

**[IMAGEN PROPUESTA: collage con móvil, router, Smart TV y automóvil.]**

---

## Según la interfaz

### Línea de comandos (CLI)

El usuario introduce órdenes mediante el teclado.

Ventajas:

* rapidez;
* automatización;
* bajo consumo de recursos.

Ejemplos:

* Bash
* PowerShell

### Interfaz gráfica (GUI)

Permite utilizar ventanas, iconos y menús.

Es la interfaz más utilizada actualmente.

### Interfaz mixta

Muchos sistemas modernos ofrecen ambas posibilidades.

Por ejemplo:

Ubuntu dispone tanto de escritorio gráfico como de terminal.

---

## Según la licencia

### Software propietario

El código fuente no está disponible para los usuarios.

Ejemplos:

* Windows
* macOS
* iOS

### Software libre

Garantiza las cuatro libertades del software libre:

* usar;
* estudiar;
* modificar;
* distribuir.

Ejemplos:

* Debian
* Ubuntu
* Fedora

### Código abierto (Open Source)

El código fuente está disponible, aunque la licencia concreta puede imponer determinadas condiciones de uso y distribución.

En la práctica, la mayoría de distribuciones GNU/Linux cumplen tanto los principios del software libre como los del código abierto.

> **Nota:** Aunque a menudo se utilizan como sinónimos, *software libre* y *código abierto* no son exactamente lo mismo. La diferencia principal está en la filosofía de las licencias más que en la disponibilidad del código fuente.

---

# Ejemplos de sistemas operativos actuales

| Sistema operativo | Uso principal           |
| ----------------- | ----------------------- |
| Windows 11        | Ordenadores personales  |
| Ubuntu Desktop    | Escritorio              |
| Ubuntu Server     | Servidores              |
| Debian            | Servidores y escritorio |
| macOS             | Equipos Apple           |
| Android           | Teléfonos y tabletas    |
| iOS               | iPhone                  |
| RouterOS, OpenWrt | Equipos de red          |
| FreeRTOS          | Sistemas embebidos      |

---

# Idea clave

No existe un sistema operativo mejor que otro para todas las situaciones.

La elección depende de factores como:

* el hardware disponible;
* el uso previsto;
* el software necesario;
* el coste de las licencias;
* la seguridad requerida;
* la facilidad de administración;
* el soporte disponible.

Por ello, es habitual encontrar distintos sistemas operativos conviviendo en una misma organización: Windows en los puestos de usuario, Linux en los servidores, Android e iOS en los dispositivos móviles y sistemas embebidos en routers, impresoras o equipos industriales.
