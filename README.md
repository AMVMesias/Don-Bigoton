# Don Bigotón — Revista digital

Repositorio: https://github.com/AMVMesias/Don-Bigoton

## Estado

Revista implementada con Astro: **10 páginas con giro de hoja**, portada con el logo original, dobles páginas interiores en escritorio, una página a la vez en móvil y contraportada. Incluye editorial, historia, perfil, descripción y tipo de emprendimiento, productos, beneficios, obstáculos, características, futuro, espacio para el video y créditos. La investigación y el material original se conservan en el repositorio.

La entrada `/` es el visor de revista. `/imprimir/` comparte sus diez páginas y `/revista-don-bigoton.pdf` es la descarga. Faltan los nombres y aprendizajes individuales y el video de YouTube de máximo diez minutos: esta edición es un borrador hasta recibirlos. Ver `docs/edicion-academica.md` para completarlos y regenerar el PDF. `/lectura/` conserva la versión continua como alternativa y contiene la transcripción completa desplegable.

`/disenos/` muestra las dos ilustraciones aprobadas en movimiento y ampliadas para revisión. En la revista se alternan en los márgenes: gato asomado al encabezado y gato recostado al pie. Las imágenes generadas se componen por capas en `src/components/MarginCat.astro`: cola, respiración, parpadeo, orejas y aparición. Las páginas ocultas pausan sus movimientos; se respeta el movimiento reducido y el botón Ⅱ permite pausarlos manualmente.

Se retiraron los antiguos motivos y las escenas ilustradas de hamburguesas. Se conservan las fotografías de productos y el logo original.

## Desarrollo local

Requiere Node.js compatible con Astro 7 (el desarrollo se verificó con Node 24).

```sh
npm ci
npm run dev
```

Abrir la dirección que imprima Astro, normalmente `http://127.0.0.1:4321/`.

```sh
npm run check
npm run build
npm run preview
```

La compilación genera `dist/`. Las fuentes se sirven localmente; las imágenes se optimizan a WebP durante el build. No hay base de datos ni servicios de pago requeridos por la aplicación.

## Publicar en Vercel

Importar el repositorio `AMVMesias/Don-Bigoton`, seleccionar Astro y dejar el directorio raíz en la raíz del repositorio. `vercel.json` configura `npm run build` y la salida `dist`. No hace falta adaptador de servidor para esta versión estática.

Opcional: definir `SITE_URL` con el dominio final, por ejemplo `https://tu-dominio.example`, para URL canónica y metadatos. En Vercel se detecta también el dominio de producción mediante sus variables de entorno.

Las siguientes publicaciones se generan al actualizar la rama conectada en Vercel. La presencia de configuración en este repositorio no confirma por sí sola un despliegue.

## Accesibilidad e interacciones

- Visor StPageFlip con efecto de hoja, esquinas arrastrables, gestos táctiles, flechas y barra de avance.
- Índice directo a capítulos, ampliación para lectura y estado accesible de la página actual.
- Navegación por teclado con flechas; las páginas inactivas quedan fuera del foco.
- Versión de lectura continua con enlaces nativos, índice móvil y enlace para saltar al contenido.
- Galería con cierre por Escape, navegación con flechas y retorno del foco al disparador.
- Preferencia de movimiento reducido respetada por CSS y GSAP.
- Contenido editorial completo en HTML; las animaciones no lo ocultan de forma permanente.
- Apertura nativa de la transcripción y los créditos con `details`.

## Editar contenido

- Revista paginada: `src/pages/index.astro`, `src/components/Sheet.astro`.
- Visor y estilos editoriales de página: `src/scripts/book.ts`, `src/styles/book.css`.
- Versión continua: `src/pages/lectura.astro`.
- Preguntas y síntesis: `src/data/interview.ts`.
- Diseño responsive: `src/styles/global.css`.
- Controles y animaciones: `src/scripts/magazine.ts`.

No se añadió un nombre de fundadora, año de inicio, local abierto ni precios actuales que no hayan sido confirmados. Para una entrega institucional, agregar los nombres de integrantes y los créditos académicos correctos cuando se disponga de ellos.

## Material preparado

- `docs/investigacion-y-direccion-editorial.md`: propuesta narrativa, diseño, animaciones, referencias y decisiones técnicas.
- `docs/fuentes-y-material.md`: inventario de las imágenes, procedencia y límites de lo verificado.
- `docs/transcripcion_entrevista_don_bigoton.md`: copia de la transcripción original, conservada sin reescritura.
- `material/instagram/`: logo de perfil y 11 imágenes públicas descargadas desde el perfil proporcionado.
- `material/retrato/retrato-enviado.png`: copia sin modificar de la fotografía aportada por el usuario.

## Tecnología propuesta

Astro con salida estática, CSS propio, StPageFlip para el giro de páginas y GSAP/ScrollTrigger para la versión continua. Fuentes Fraunces y Manrope alojadas localmente. Destino de publicación: Vercel, conectado a este repositorio GitHub.

La publicación sirve las imágenes desde el proyecto, sin depender de enlaces temporales de Instagram. Los originales se conservan en `material/`; las versiones optimizadas se generan al compilar. El recurso de portada y su prompt se documentan en `docs/recurso-creativo.md`.
