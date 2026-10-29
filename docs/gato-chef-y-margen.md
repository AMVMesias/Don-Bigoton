# Margen de hierbas y gato chef — páginas 2–3

La propuesta aprobada forma una U abierta arriba, continua a través del pliegue, y reemplaza el borde geométrico inferior de esta pareja. Las demás parejas mantienen sus diseños diferentes.

`HerbBorder.astro` dibuja tallos, hojas, huellas, batidor y cuchara en coordenadas de doble página (1080 × 760). Cada hoja muestra su mitad. Los adornos quedan fuera del contenido y por encima del pie de página. El gato ocupa el espacio bajo la editorial, a la izquierda de las reflexiones. Las hojas y la respiración del gato tienen movimientos suaves con pausa y movimiento reducido; la impresión queda estática.

## Imagen del gato

El usuario aportó la ilustración del gato chef con gorro, cuchara y delantal. Se utilizó la herramienta integrada de generación de imágenes en modo edición con fondo transparente. El resultado se conserva en `material/creativo/gato-chef-transparente.png`. Astro genera WebP optimizado. La maqueta no se usa como imagen de página completa: el texto permanece seleccionable y el borde es SVG.

Prompt de la edición:

> Use case: background-extraction. Extract the exact orange CHEF CAT character from the provided illustration. Remove ALL beige/cream background and surrounding vignette, leaving genuinely transparent alpha. Preserve the original character faithfully: smiling closed eyes, white muzzle and paws, dark brown whiskers/outline, orange ears and tail, WHITE chef hat, blue apron strip, wooden spoon held by paw, all anatomy and proportions. Do not remove white areas inside the character or hat. Clean antialiased silhouette. Center character tightly with just a small transparent safety margin around ears/hat/spoon/tail/paws. No additions, no redesign, no text, no new shadows, no ornaments, no opaque background.
