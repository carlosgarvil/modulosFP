# Encargo: Simulador HTML de computadora primitiva

Crea un simulador web educativo, en HTML/CSS/JavaScript puro, inspirado en una computadora de los años 40. El objetivo es que alumnado de 1º SMR entienda cómo se introducían instrucciones y datos directamente en memoria mediante interruptores binarios.

Usa como referencia visual la imagen adjunta. No hace falta copiarla exactamente, pero sí mantener la idea: panel oscuro, interruptores, tabla de memoria, botones de control y consola de salida.

## Requisitos técnicos

- Crear una aplicación estática: `index.html`, `style.css` y `script.js`.
- No usar frameworks.
- Debe funcionar abriendo `index.html` en navegador.
- Interfaz en español.
- Código claro y comentado.
- Diseño responsive razonable para pantalla de aula/proyector.

## Objetivo didáctico

El simulador debe mostrar que:
- La memoria almacena bytes.
- Cada byte puede representar una instrucción o un dato.
- Una dirección de memoria indica dónde se guarda un byte.
- La CPU lee una instrucción desde memoria usando el contador de programa.
- El registro de instrucción guarda la instrucción actual.
- El acumulador guarda resultados temporales.
- Un programa puede cargarse manualmente con interruptores y ejecutarse paso a paso.

## Modelo simplificado de máquina

Usar una máquina de 8 bits.

### Memoria

- 256 posiciones de memoria: direcciones `00` a `FF`.
- Cada posición guarda un byte: `00000000` a `11111111`.
- Mostrar una tabla con:
  - Dirección
  - Contenido binario
  - Valor hexadecimal
  - Interpretación simple

La tabla debe resaltar:
- La dirección seleccionada.
- La dirección apuntada por el PC.
- La última posición modificada.

### Registros

Mostrar en un panel de estado:

- PC: contador de programa.
- IR: registro de instrucción.
- AC: acumulador.
- Estado: detenido / ejecutando / error.

## Entrada mediante interruptores

Crear dos grupos de interruptores:

### Dirección

8 interruptores para seleccionar la dirección de memoria.

Mostrar automáticamente:
- valor binario;
- valor hexadecimal;
- valor decimal.

### Datos

8 interruptores para seleccionar el byte que se va a cargar.

Mostrar automáticamente:
- valor binario;
- valor hexadecimal;
- valor decimal;
- carácter ASCII si es imprimible.

Cada interruptor debe poder alternarse con clic. Visualmente debe verse claro si está a 0 o a 1.

## Botones de control

Incluir al menos:

- `LOAD`: carga el byte de datos en la dirección seleccionada.
- `STEP`: ejecuta una instrucción.
- `RUN`: ejecuta instrucciones automáticamente hasta HALT o error.
- `STOP`: detiene la ejecución automática.
- `RESET`: reinicia registros, consola y memoria.
- `CLEAR MEMORY`: borra la memoria.
- `LOAD DEMO`: carga un programa de ejemplo.

## Juego de instrucciones

Diseñar un conjunto pequeño de instrucciones. Para simplificar, cada instrucción ocupa 2 bytes:

- Byte 1: código de operación.
- Byte 2: dirección o parámetro.

Instrucciones:

| Código | Ensamblador | Descripción |
|---|---|---|
| `00` | `HALT` | Detiene la ejecución |
| `01` | `LOAD addr` | Carga en AC el contenido de memoria[addr] |
| `02` | `STORE addr` | Guarda AC en memoria[addr] |
| `03` | `ADD addr` | Suma memoria[addr] al AC |
| `04` | `SUB addr` | Resta memoria[addr] al AC |
| `05` | `JMP addr` | Salta a una dirección |
| `06` | `JZ addr` | Salta si AC es 0 |
| `07` | `JNZ addr` | Salta si AC no es 0 |
| `08` | `OUT addr` | Escribe en consola el carácter ASCII guardado en memoria[addr] |
| `09` | `OUTN addr` | Escribe en consola el valor numérico guardado en memoria[addr] |

Reglas:
- `HALT` puede ocupar sólo un byte, pero para simplificar puede tratarse como instrucción de 2 bytes ignorando el segundo.
- Si se encuentra una instrucción desconocida, detener y mostrar error.
- Después de cada instrucción normal, PC avanza 2 posiciones.
- En saltos, PC pasa a la dirección indicada.
- Las operaciones son de 8 bits: si se supera 255, aplicar módulo 256.

## Programa de demostración

El botón `LOAD DEMO` debe cargar un programa sencillo que demuestre el funcionamiento.

Ejemplo recomendado:

Programa que suma dos números guardados en memoria y muestra el resultado:

```asm
00: LOAD 20
02: ADD 21
04: STORE 22
06: OUTN 22
08: HALT

20: 05
21: 07
22: 00