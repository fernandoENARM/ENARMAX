# ENARMAX

ENARMAX es una pequeña aplicación web para repasar tarjetas médicas. Las tarjetas se muestran una a una y permiten dar vuelta la carta para ver la respuesta. El avance puede marcarse según la dificultad percibida.

## Uso

1. Clona este repositorio.
2. Abre el archivo `index.html` en tu navegador.
3. Interactúa con las tarjetas usando los botones disponibles.
4. Cambia entre modo día y noche con el botón "Modo Noche".
5. Si deseas compilar los archivos TypeScript ejecuta `npm run build`. Esto creará la carpeta `dist/`, la cual no está versionada y puede eliminarse con `git clean -fd` u otra herramienta similar.
6. Para practicar con límite de tiempo abre `exam.html` y comienza un examen adaptativo de 40 preguntas.

No se requieren dependencias externas ni servidores adicionales; todo funciona de manera estática en el navegador.

## Estructura del proyecto

- `index.html` – Página principal de la aplicación.
- `styles.css` – Hojas de estilo con el diseño de la interfaz.
- `app.js` – Lógica de las tarjetas y manejo de eventos.
- `cloze.html` – Formulario para crear tarjetas tipo cloze.
- `cloze.js` – Lógica de previsualización y guardado de las tarjetas cloze.
- `exam.html` – Modo de examen adaptativo con límite de tiempo.

## Contribuciones

Las contribuciones son bienvenidas. Abre una pull request para sugerir cambios o mejoras.

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` para más información.
