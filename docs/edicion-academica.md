# Edición académica de diez páginas

La edición sustituye al visor de 24 páginas y aplica el máximo de 10 de la consigna recibida. La versión anterior se conserva en Git; la lectura continua queda como archivo complementario.

1. Portada, con el título a la derecha del logo.
2. Editorial y aprendizajes individuales.
3. Historia y motivación.
4. Perfil de la emprendedora.
5. Recursos y organización: aportes familiares, costos iniciales, proveedores, operación, tipo e impacto.
6. Estrategias y clientes: recomendaciones, WhatsApp, plataformas, atención y diferenciación. Los productos se describen como contexto con una sola foto.
7. Beneficios y obstáculos.
8. Evolución de capacidades, características y visión de futuro. Los avances descritos son cualitativos; no se inventan resultados económicos.
9. Entrevista en YouTube.
10. Contraportada y créditos.

## Material pendiente

- Nombres y aprendizajes personales de los integrantes: completar `authors` en `src/data/edition.ts`. La introducción editorial actual no sustituye las reflexiones individuales.
- ID del video de YouTube editado a un máximo de diez minutos: completar `youtubeVideoId` en el mismo archivo. El registro original dura 14:43. No se recibió el archivo de video ni su enlace.
- Confirmar la terminología de clasificación usada en clase. El texto identifica «por necesidad» como una interpretación del caso.

La web y el PDF son un borrador de revisión mientras faltan esos materiales. No se declara la consigna cumplida en su totalidad.

## PDF compartido con la web

`MagazinePages.astro` contiene las diez hojas de `/` y `/imprimir/`, con el mismo ajuste tipográfico (`fit-pages.ts`). El PDF conserva texto seleccionable y enlaces.

1. Ejecutar `npm run build` y `npm run preview -- --port 4322`.
2. Disponer de `playwright` local o indicar la carpeta compartida de módulos en `PLAYWRIGHT_MODULES`.
3. Si se usa Chrome o Edge instalado, indicar su ejecutable en `BROWSER_EXECUTABLE`. La optimización requiere Python con `pypdf`; `PDF_PYTHON` permite indicar el ejecutable del entorno que lo contiene.
4. Ejecutar `node scripts/export-pdf.mjs` y revisar `output/pdf/revista-don-bigoton.pdf` y las capturas de `tmp/pdfs/`.
5. El script copia el PDF a `public/revista-don-bigoton.pdf`. Ejecutar de nuevo `npm run build` antes de desplegar para incluirlo en `dist/`.

Alternativa manual: abrir `/imprimir/` y pulsar «Imprimir / Guardar PDF», habilitando fondos y márgenes cero con el tamaño definido por el sitio.

Antes de entregar, completar autores y video, regenerar el PDF y comprobar las diez páginas. La tarea requiere tanto el enlace web como el archivo PDF.

## Descarga optimizada sin cambios visuales

La exportación de Chromium repetía imágenes idénticas de la textura de papel en las diez hojas. `scripts/optimize-pdf.py` unifica objetos repetidos sin recomprimir ni reducir imágenes, conservando fuentes, texto seleccionable, enlaces, dimensiones y textura. `export-pdf.mjs` aplica este paso antes de copiar la descarga pública.

La primera optimización pasó de 35.184.131 a 5.032.801 bytes. Las diez páginas del PDF original y el optimizado se renderizaron con Poppler a 760 px y se comprobaron píxel por píxel: no hubo diferencias.
