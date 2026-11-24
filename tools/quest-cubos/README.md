# Laboratorio de cubos WebXR para Meta Quest 3S

Experimento mínimo de realidad mixta hecho con A-Frame. La experiencia se renderiza en las propias gafas: no necesita PC con GPU ni instalar una aplicación nativa.

## Qué hace

- Abre una sesión WebXR `immersive-ar` y deja visible el passthrough de las Quest.
- Muestra tres cubos virtuales ligeros.
- Permite apuntar con cualquiera de los mandos y coger, mover y soltar cada cubo con el gatillo.
- Cambia el color del cubo al cogerlo.
- Reinicia las posiciones con el botón **A** o **X**.

## Publicación recomendada: GitHub Pages

WebXR requiere HTTPS. GitHub Pages lo proporciona gratis y el ordenador solo se usa para subir estos cuatro archivos una vez.

1. Crea un repositorio nuevo en GitHub, por ejemplo `quest-cubos`.
2. Sube `index.html`, `styles.css`, `app.js` y `README.md` a la raíz del repositorio.
3. En GitHub abre **Settings → Pages**.
4. En **Build and deployment**, elige **Deploy from a branch**.
5. Selecciona la rama `main`, carpeta `/ (root)`, y pulsa **Save**.
6. Espera uno o dos minutos. GitHub mostrará una dirección parecida a `https://tu-usuario.github.io/quest-cubos/`.
7. En las Quest 3S, abre **Meta Quest Browser**, escribe esa dirección y acepta el permiso de realidad mixta.
8. Pulsa **Entrar en realidad mixta**.

## Alternativa rápida: Netlify Drop

1. Desde un ordenador abre [Netlify Drop](https://app.netlify.com/drop).
2. Arrastra la carpeta completa a la página.
3. Abre en las Quest la URL HTTPS que Netlify genera.

## Prueba local opcional

Para revisar la pantalla 2D en un ordenador:

```bash
python3 -m http.server 8000
```

Después abre `http://localhost:8000`. El modo inmersivo no aparecerá en un navegador de escritorio normal; eso es esperado. Para probar WebXR en las gafas, usa una URL HTTPS publicada.

## Controles

| Acción | Control |
| --- | --- |
| Seleccionar | Apuntar con el láser |
| Coger y mover | Mantener pulsado el gatillo |
| Soltar | Soltar el gatillo |
| Reiniciar cubos | Botón A o X |
| Salir | Botón Meta y cerrar la experiencia |

## Archivos

- `index.html`: escena, cubos, cámaras, luces y mandos.
- `app.js`: interacción de coger/mover, colores, reinicio y comprobación WebXR.
- `styles.css`: pantalla inicial y botón de entrada.
- `README.md`: estas instrucciones.

## Notas

- Se carga A-Frame 1.8.0 desde su CDN oficial, así que las gafas necesitan conexión a internet al abrir la página.
- No se añade cielo ni fondo opaco: el lienzo es transparente para que se vea el passthrough.
- Si no aparece el botón AR, confirma que la dirección empieza por `https://`, actualiza Meta Quest Browser y recarga la página.
