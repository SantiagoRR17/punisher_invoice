# Mejoras visuales de PDF — Errores durante la implementación

Bitácora de los problemas encontrados al implementar la feature `006-mejoras-visuales-pdf`, con su causa y la solución aplicada.

## 1. Los archivos reales de marca aparecieron en `public/` a mitad de sesión, con riesgo de commitear la firma

**Qué pasó:** El usuario ya había dejado `firma.png` (1.05MB), `logo.jpeg`, `logo.png` y `logo_blanco.jpeg` directamente en `public/`, sin trackear todavía en git. Como `public/` se sirve tal cual y normalmente se commitea completo, cualquier `git add -A` habría subido la firma al repositorio público — justo lo que el usuario pidió evitar.

**Cómo se generó:** El usuario colocó los archivos reales de marca en la carpeta convencional (`public/`, como indicaba `tech-stack.md` en ese momento) sin saber todavía que la firma necesitaba un tratamiento distinto por ser un dato sensible.

**Cómo se corrigió:** Se confirmó con el usuario que los 3 logos se commitean en `public/` (no son sensibles) y la firma se sube a MongoDB. Se agregó `public/firma.png` (y variantes `.jpg`/`.jpeg`) a `.gitignore` como red de seguridad, y nunca se hizo `git add` sobre ese archivo. Se corrigió también `tech-stack.md` (que documentaba `public/` como el lugar de la firma) para reflejar la nueva convención.

## 2. El bloque de firma quedó con la imagen debajo de la línea en vez de encima

**Qué pasó:** La primera implementación agregó `<Image src={firmaUrl}>` dentro de `signaturePlaceholder` (el contenedor con el borde superior que simula la línea de firma), quedando la imagen debajo de la línea. El usuario corrigió: la firma debe ir **encima** de la línea, con el texto debajo — el orden tradicional de un bloque de firma en papel.

**Cómo se generó:** Se interpretó "agregar la firma sobre la línea existente" (texto del plan) de forma ambigua: se puso la imagen dentro del mismo contenedor que ya tenía el borde, en vez de sacarla fuera y ponerla antes del contenedor.

**Cómo se corrigió:** En `CotizacionPdf.tsx` y `CuentaCobroPdf.tsx`, la imagen de firma se movió fuera de `signaturePlaceholder`, como hermano anterior dentro de `signatureBlock`. También se ajustó `signatureImage` (se quitó `alignSelf: "center"`, que la desalineaba respecto al ancho de la línea) para que la imagen comparta el mismo ancho (160) que el contenedor de la línea, quedando ambos alineados a la derecha.

## 3. El driver de MongoDB no devuelve `Buffer` nativo para campos binarios

**Qué pasó:** Al diseñar `getBrandAsset`, se detectó que el driver de MongoDB Node devuelve los campos binarios como una instancia BSON `Binary`, no como un `Buffer` de Node — aunque el campo se guardó como `Buffer` al escribir. Tratarlo como `Buffer` directamente (ej. acceder a `.buffer` sin normalizar) es un error común que puede filtrar bytes de un `ArrayBuffer` compartido/pooled si no se maneja con cuidado.

**Cómo se generó:** Es un detalle de la serialización BSON, no documentado explícitamente en el tipo `Buffer` que se usa en `models/BrandAsset.ts`.

**Cómo se corrigió:** `getBrandAsset` normaliza el valor devuelto con `Buffer.isBuffer(asset.data) ? asset.data : Buffer.from((asset.data as unknown as { buffer: Buffer }).buffer)` antes de devolverlo, así el resto del código (el route handler, los tests) siempre recibe un `Buffer` real y no necesita conocer este detalle.

## 4. El script de QA visual no podía correr fuera de la app (Node vs. navegador)

**Qué pasó:** Para validar visualmente el resultado (iconos, ola, firma) sin generar documentos reales contra la base de datos de producción ni iniciar sesión, se armó un script de Node de un solo uso (`qa-pdf-tmp.tsx`, fuera del repositorio versionado) que invocaba `CotizacionPdf`/`CuentaCobroPdf` directamente con `@react-pdf/renderer`. Ese script no podía resolver `<Image src="/logo.png">` (ruta relativa, que en el navegador se resuelve contra el origen de la app vía Next.js, pero en Node se interpretó como una ruta de archivo absoluta inexistente `C:\logo.png`) ni ejecutar JSX sin un shim manual de `React` en el ámbito global (el `tsconfig.json` usa `"jsx": "preserve"`, pensado para el bundler de Next, no para ejecutarse directo con `tsx`).

**Cómo se generó:** El proyecto no tenía antes un caso de uso que generara PDFs fuera del navegador, así que no existía tooling para esto.

**Cómo se corrigió:** Se ejecutó el render con las imágenes de logo y firma como *data URLs* embebidas manualmente en el script de QA (leyendo los archivos con `fs.readFileSync` + `toString("base64")`), y se asignó `global.React` antes de importar dinámicamente los componentes de PDF. El logo específicamente no se pudo previsualizar con este método (se validó por revisión de código, ya que `/logo.png` es el patrón estándar de Next.js para assets estáticos). El script y los PDFs/imágenes generados se borraron al terminar; nunca se commitearon.
