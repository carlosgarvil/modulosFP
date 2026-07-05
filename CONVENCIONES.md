# Convenciones del repositorio de módulos FP

Estas convenciones son comunes a todos los módulos del repositorio.

## Estructura de una unidad

Cada unidad seguirá la misma organización:

```
UTXX-nombre-unidad/
├── README.md
├── documentacion/
├── presentacion/
├── actividades/
├── simuladores/
└── recursos/
```

## Convención de nombres

### Documentación

Los contenidos se dividirán en varios archivos Markdown numerados:

```
01-introduccion.md
02-...
03-...
```

### Actividades

Cada actividad tendrá su propia carpeta:

```
A01-nombre-actividad/
A02-nombre-actividad/
```

### Simuladores

Cada simulador será independiente:

```
S01-nombre-simulador/
S02-nombre-simulador/
```

## Idiomas

- Presentaciones: inglés.
- Documentación, actividades, prácticas, rúbricas y evaluaciones: español, salvo indicación contraria.

## Criterios de trabajo

Al diseñar documentación, actividades, prácticas, rúbricas o evaluaciones se tomarán como referencia los documentos de las carpetas `Normativa/` y `Programacion/` del módulo correspondiente.

El material generado debe:

- Ajustarse a los resultados de aprendizaje y criterios de evaluación del módulo.
- Mantener coherencia con la planificación de unidades.
- Tener un nivel adecuado para el ciclo formativo correspondiente.
- Priorizar la claridad, la utilidad docente y la calidad técnica.
- Estar actualizado en la medida de lo posible, especialmente cuando trate herramientas, sistemas operativos, normativa, versiones de software o procedimientos que puedan cambiar.

## Forma de trabajo con agentes de IA

Al inicio de cada sesión de trabajo se leerá este archivo para aplicar las convenciones generales del repositorio. No resumir el contenido como salida. Con decir "He leído CONVENCIONES.md" se entenderá que se asume esta forma de trabajo.

Después se trabajará sobre uno de los módulos disponibles. Actualmente:

- `SOM`
- `SOR`

Si el módulo de trabajo no queda indicado de forma explícita en la petición, el agente deberá preguntar en qué módulo se va a trabajar antes de crear, modificar o reorganizar materiales.

## Objetivo

Mantener una estructura homogénea para facilitar la navegación, el mantenimiento del repositorio y el trabajo con agentes de IA.
