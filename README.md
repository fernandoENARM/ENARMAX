# ENARMAX

ENARMAX es una pequeña aplicación web para repasar tarjetas médicas. Las tarjetas se muestran una a una y permiten dar vuelta la carta para ver la respuesta. El avance puede marcarse según la dificultad percibida.

## Uso

1. Clona este repositorio.
2. Abre el archivo `index.html` en tu navegador.
3. Interactúa con las tarjetas usando los botones disponibles.
4. Cambia entre modo día y noche con el botón "Modo Noche".
5. Si deseas compilar los archivos TypeScript ejecuta `npm run build`. Esto creará la carpeta `dist/`, la cual no está versionada y puede eliminarse con `git clean -fd` u otra herramienta similar.
6. Para practicar con límite de tiempo abre el modo Examen desde el menú lateral y comienza una evaluación adaptativa de 40 preguntas.

No se requieren dependencias externas ni servidores adicionales; todo funciona de manera estática en el navegador.

## Estructura del proyecto

- `index.html` – Única página de la aplicación con todas las vistas integradas.
- `styles.css` – Hojas de estilo con el diseño de la interfaz.
- `app.js` – Lógica de las tarjetas y manejo de eventos.
- `cloze.js` – Lógica de previsualización y guardado de las tarjetas cloze.
- `study.js` – Manejo de las sesiones de estudio.

## Contribuciones

Las contribuciones son bienvenidas. Abre una pull request para sugerir cambios o mejoras.

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` para más información.
