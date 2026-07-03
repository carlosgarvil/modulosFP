# Sistemas Operativos Monopuesto (SOM)

## Descripción

Repositorio de trabajo del módulo **Sistemas Operativos Monopuesto (0222)** del Ciclo Formativo de Grado Medio de Sistemas Microinformáticos y Redes (SMR).

Este repositorio no pretende ser únicamente una programación didáctica, sino la fuente de todos los materiales utilizados durante el curso:

- Programación.
- Normativa.
- Unidades didácticas.
- Actividades.
- Prácticas.
- Simuladores HTML.
- Presentaciones.
- Banco de preguntas.
- Recursos para Moodle.
- Material para el programa bilingüe.

## Filosofía del módulo

El módulo tiene un enfoque eminentemente práctico.

Se pretende que el alumnado comprenda cómo funciona un sistema operativo antes de aprender a administrarlo.

La secuencia general del curso es:

1. Conceptos comunes a todos los sistemas operativos.
2. Virtualización y laboratorio.
3. Instalación de sistemas operativos.
4. Administración de Windows.
5. Administración de Linux.
6. Proyecto o prácticas de integración.

Los conceptos se introducen primero mediante teoría sencilla y simuladores interactivos y posteriormente se consolidan mediante prácticas reales sobre máquinas virtuales.

## Público objetivo

- Primer curso de SMR.
- Grado Medio.
- Nivel inicial.
- No se presupone experiencia previa con Linux.

## Principios metodológicos

- Aprendizaje basado en la práctica.
- Explicaciones cortas seguidas de actividades.
- Una máquina virtual por alumno.
- Aprendizaje progresivo.
- Resolver problemas antes que memorizar comandos.
- Priorizar la comprensión frente a la memorización.

## Tecnología utilizada

- VirtualBox.
- Windows 10.
- Ubuntu Desktop LTS.
- HTML para simuladores interactivos.
- Moodle Centros.
- GitHub como repositorio de materiales del curso.

## Presentaciones

Las presentaciones se realizan en inglés para adaptarse al programa bilingüe.

El resto de materiales, incluyendo programación, actividades, prácticas, exámenes y documentación, se redactan en español salvo indicación contraria.

## Estructura del repositorio

```text
SOM/
├── Normativa/
│   └── RAyCriterios.md
├── Programacion/
│   ├── planificacion.md
│   └── relacionRA-UT.md
├── Unidades/
│   ├── UT01-fundamentos-de-los-sistemas-operativos/
│   ├── UT02-virtualizacion-y-laboratorio/
│   ├── UT03-instalacion-de-sistemas-operativos/
│   ├── UT04-administracion-y-configuracion-de-windows/
│   ├── UT05-mantenimiento-seguridad-y-recuperacion-en-windows/
│   ├── UT06-administracion-de-linux/
│   ├── UT07-mantenimiento-automatizacion-y-seguridad-en-linux/
│   └── UT08-despliegue-e-implantacion-de-sistemas-operativos/
└── readme.md
```

Cada unidad sigue la estructura definida en `CONVENCIONES.md`: `README.md`, `documentacion/`, `presentacion/`, `actividades/`, `simuladores/` y `recursos/`.

## Criterios para generar nuevo material

Todo el material nuevo debe:

- Ajustarse al currículo oficial de Andalucía.
- Mantener el nivel propio de Grado Medio.
- Priorizar actividades manipulativas frente a memorísticas.
- Evitar introducir contenidos propios de ASIR salvo como curiosidad.
- Evitar introducir contenidos de otros módulos salvo que aporten contexto.
- Favorecer la reutilización de materiales.
- Poder integrarse fácilmente en Moodle.

## Relación con otros módulos

Este módulo prepara al alumnado para:

- Sistemas Operativos en Red (SOR).
- Seguridad Informática.
- Servicios en Red.

No obstante, debe tener entidad propia y no depender de conocimientos que se impartirán posteriormente.

## Objetivo del repositorio

Mantener un conjunto coherente de materiales que pueda reutilizarse y evolucionar durante los próximos cursos académicos.
# Estructura general de las unidades didácticas (SOM)

## Objetivo

Todas las unidades didácticas del módulo **Sistemas Operativos Monopuesto (SOM)** deben seguir una estructura homogénea. El objetivo es que el alumnado encuentre siempre la información organizada de la misma forma y que los materiales puedan evolucionar fácilmente durante los próximos cursos.

La documentación debe priorizar:

- Comprender antes que memorizar.
- Relacionar continuamente teoría y práctica.
- Mostrar aplicaciones reales del contenido.
- Servir tanto para el estudio como para la consulta posterior.

---

# Estructura de una unidad

## 1. Presentación de la unidad

Breve introducción que sitúe al alumnado.

Debe responder a la pregunta:

> ¿Por qué vamos a estudiar esto?

Se recomienda explicar cómo esos conocimientos aparecerán posteriormente en otras unidades y en el trabajo de un técnico de sistemas.

---

## 2. Objetivos de aprendizaje

Lista breve (5-10 objetivos).

Siempre redactados desde el punto de vista del alumnado.

Ejemplo:

- Comprender...
- Identificar...
- Configurar...
- Diferenciar...
- Explicar...

---

## 3. Índice de contenidos

Relación ordenada de los apartados de la unidad.

Debe ser coherente con la planificación general del módulo.

---

## 4. Desarrollo de los contenidos

Cada apartado debe seguir una estructura similar.

### Introducción

Explicación del concepto.

No excesivamente extensa.

### Idea clave

Caja destacada con la idea más importante.

Debe poder recordarse incluso varios meses después.

### Ejemplo real

Aplicación en un ordenador, servidor, móvil, router, etc.

Siempre que sea posible utilizar ejemplos cotidianos.

### En el taller...

Pequeño apartado indicando cuándo volverá a aparecer ese contenido durante las prácticas del curso.

### Curiosidad

Dato interesante relacionado con la historia, funcionamiento interno o aplicaciones reales.

### Mini actividad

Una actividad corta para comprobar la comprensión antes de continuar.

---

## 5. Actividades guiadas

Actividades desarrolladas paso a paso.

Su objetivo es reforzar los contenidos recién aprendidos.

Siempre que sea posible deberán realizarse utilizando:

- Windows
- Ubuntu
- VirtualBox
- Terminal
- PowerShell

---

## 6. Actividades de ampliación

No obligatorias.

Pensadas para alumnado con mayor interés o que finalice antes.

Pueden incluir:

- Investigación
- Instalaciones adicionales
- Software alternativo
- Sistemas históricos
- Laboratorios opcionales

---

## 7. Resumen visual

Todas las unidades terminarán con un resumen visual.

No será una imagen estática.

Se generará automáticamente mediante código.

### Tecnología seleccionada

Se utilizará **Mermaid.js** como herramienta principal.

Ventajas:

- Diagramas mantenibles.
- Integración con HTML.
- Integración con Markdown.
- Compatible con GitHub.
- Fácil modificación mediante texto.
- Posibilidad de generación automática.

Los mapas visuales deberán representar únicamente las ideas principales de la unidad.

En el futuro podrán generarse automáticamente a partir de un fichero JSON o YAML.

---

## 8. Lo que debes saber

Este apartado recogerá únicamente los conceptos imprescindibles.

No es un resumen.

Debe responder a la pregunta:

> ¿Qué debo recordar dentro de seis meses?

Se recomienda un listado corto de ideas clave.

---

## 9. Conexiones con el resto del módulo

Cada unidad explicará dónde volverán a aparecer esos conocimientos.

Ejemplo:

- Unidad 2
- Unidad 3
- Proyecto final

El alumnado debe percibir el módulo como un único proyecto de aprendizaje y no como temas independientes.

---

## 10. Glosario

Listado de términos importantes.

Definiciones breves (1-3 líneas).

El glosario será acumulativo durante el curso.

---

## 11. Autoevaluación

Cada unidad finalizará con preguntas similares a las utilizadas en Moodle.

Se recomienda incluir:

- Tipo test
- Verdadero/Falso
- Respuesta corta
- Casos prácticos sencillos

Estas preguntas podrán incorporarse posteriormente al banco de preguntas del módulo.

---

# Filosofía del material

La documentación no pretende ser un libro universitario.

Debe ser:

- Clara.
- Visual.
- Muy práctica.
- Cercana al trabajo de un técnico de sistemas.
- Reutilizable durante varios cursos.

Siempre que sea posible se partirá de situaciones reales antes de introducir la teoría.

---

# Recursos gráficos

Los recursos visuales deben ser generados mediante código siempre que sea posible.

Se evitarán imágenes difíciles de mantener.

Tecnologías preferentes:

- Mermaid.js (diagramas y mapas conceptuales)
- HTML5
- CSS
- JavaScript

En un futuro podrán incorporarse simuladores HTML interactivos dentro de cada unidad.

---

# Relación con otros materiales

Cada unidad podrá disponer de:

- Guía del alumnado
- Presentación (PowerPoint en inglés)
- Simuladores HTML
- Actividades prácticas
- Banco de preguntas Moodle
- Material de ampliación

Todos estos recursos deberán mantener la misma organización y nomenclatura.

---

# Objetivo a largo plazo

Construir un material propio del módulo SOM que sea:

- Fácil de actualizar.
- Fácil de ampliar.
- Reutilizable durante varios cursos.
- Coherente entre todas las unidades.
- Centrado en el aprendizaje práctico.