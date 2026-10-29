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

- Nombres y aprendizajes personales de los integrantes: completar `authors` en `src/data/edition.ts`. La introducción editorial actual no sustituye el aprendizaje de cada integrante exigido en la consigna. El espacio se presenta como «Autores y aprendizajes».
- Ajustar la duración del video: se recibió `https://youtu.be/pKUBEFdzzbw` el 28 de octubre de 2026 y ya está integrado. YouTube publica una duración de 10:19 (619 segundos), 19 segundos por encima del máximo de diez minutos. El registro original de la transcripción dura 14:43. Si cambia el enlace tras el recorte, actualizar ID, duración, miniatura y QR.
- Confirmar la terminología de clasificación usada en clase. El texto identifica «por necesidad» como una interpretación del caso.

La web y el PDF son un borrador de revisión mientras faltan esos materiales. No se declara la consigna cumplida en su totalidad.

La página 9 contiene un reproductor de YouTube con acceso a pantalla completa y un enlace directo. En impresión, el reproductor se sustituye por la miniatura auténtica enlazada y un código QR del video; el PDF no reproduce video. Los nombres y aprendizajes siguen pendientes y no se inventaron.

## Material de trabajo y contenido público

La transcripción y las notas de verificación se conservan en `docs/` como insumos de edición. No se enlazan desde la revista ni se copian a `public/`. Se retiraron los accesos al Markdown y GitHub, la transcripción desplegable de la lectura continua, las marcas de tiempo y las aclaraciones sobre el proceso de edición. Los créditos públicos se limitan a la revista, las imágenes y el equipo editorial.

Las páginas conservan las decisiones, experiencias y aprendizajes del emprendimiento, el video y su QR, además de los espacios que el equipo pidió reservar para los autores. Esta limpieza se aplica también a la galería y al PDF mediante los componentes compartidos.

## PDF compartido con la web

`MagazinePages.astro` contiene las diez hojas de `/` y `/imprimir/`, con el mismo ajuste tipográfico (`fit-pages.ts`). El PDF conserva texto seleccionable y enlaces. Reproduce la vista de escritorio en seis láminas: portada 1 sola, interiores 2–3, 4–5, 6–7 y 8–9, y contraportada 10 sola. La numeración editorial sigue siendo de diez páginas.

1. Ejecutar `npm run build` y `npm run preview -- --port 4322`.
2. Disponer de `playwright` local o indicar la carpeta compartida de módulos en `PLAYWRIGHT_MODULES`.
3. Si se usa Chrome o Edge instalado, indicar su ejecutable en `BROWSER_EXECUTABLE`. La optimización requiere Python con `pypdf`; `PDF_PYTHON` permite indicar el ejecutable del entorno que lo contiene.
4. Ejecutar `node scripts/export-pdf.mjs` y revisar `output/pdf/revista-don-bigoton.pdf` y las capturas de `tmp/pdfs/`.
5. El script copia el PDF a `public/revista-don-bigoton.pdf`. Ejecutar de nuevo `npm run build` antes de desplegar para incluirlo en `dist/`.

Alternativa manual: abrir `/imprimir/` y pulsar «Imprimir / Guardar PDF», habilitando fondos y márgenes cero con el tamaño definido por el sitio.

Antes de entregar, completar autores y video, regenerar el PDF y comprobar las diez páginas editoriales distribuidas en seis láminas. La tarea requiere tanto el enlace web como el archivo PDF.

## Descarga optimizada sin cambios visuales

La exportación de Chromium repetía imágenes idénticas de la textura de papel en las diez hojas. `scripts/optimize-pdf.py` unifica objetos repetidos sin recomprimir ni reducir imágenes, conservando fuentes, texto seleccionable, enlaces, dimensiones y textura. `export-pdf.mjs` aplica este paso antes de copiar la descarga pública.

La primera optimización pasó de 35.184.131 a 5.032.801 bytes. Las diez páginas del PDF original y el optimizado se renderizaron con Poppler a 760 px y se comprobaron píxel por píxel: no hubo diferencias.

La vista de impresión usa tamaños de página específicos para portada y dobles páginas. La descarga automatizada primero exporta las diez hojas por separado y después une las parejas en el PDF, sin convertirlas en imágenes. Así conserva los elementos compartidos y mantiene la descarga de dobles páginas en torno a 5 MB. Se validan las seis láminas, sus dimensiones, el texto y los enlaces de las diez hojas originales.

## Identidad visual de cada hoja y composición compartida

Cada página tiene dos iconos propios, definidos en `editorial-designs.ts` y dibujados en `EditorialGlyph.astro`, sin repetir los veinte motivos. Los gatos son acentos de marca en las hojas 1, 4 y 10. Se conserva el retrato a página completa.

Las parejas comparten un trazo superior, una figura dividida en el pliegue y una franja inferior continua: 2–3, del relato al comienzo; 4–5, persona y recursos; 6–7, relaciones y equilibrio; 8–9, futuro y voz. Las formas se recortan desde el mismo lienzo de doble página para que coincidan al juntarse en el lector y en el PDF. Se mantienen fuera de las columnas de lectura y se ocultan en el visor de una sola página en móvil.

`spread-layout.ts` agrupa las mismas hojas para impresión y para la galería `/disenos/`. La galería permite revisar la revista completa y sus animaciones sin usar maquetas distintas del contenido real.
