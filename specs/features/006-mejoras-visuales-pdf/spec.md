# **006 · Mejoras visuales de PDF**

**Estado:** Hecho ✅ (pendiente un paso manual del usuario: subir la firma real, ver `tasks.md`)

## Qué hace

Mejora la presentación visual del encabezado de los PDF (cotización y cuenta de cobro): agrega iconos junto a los datos de contacto, reemplaza el placeholder de logo por el logo real de la empresa, simplifica el efecto de olas del encabezado/pie a una sola onda sutil, e incorpora la firma real de la empresa en el bloque de firma de ambos documentos.

## Por qué

El cliente considera que el encabezado actual (con placeholders de logo y texto plano de contacto) se ve poco cuidado, y ya cuenta con los archivos reales de marca (logo, logo en fondo claro, firma escaneada). La firma es un dato sensible (permite falsificar documentos a su nombre) y no debe quedar descargable desde el repositorio público de GitHub.

## Alcance

1. **Iconos de contacto:** el bloque de contacto del encabezado (dirección, teléfono, correo, fecha) muestra un ícono SVG simple junto a cada línea.
2. **Logo real:** el placeholder circular "TF" del encabezado se reemplaza por `logo.png` (fondo transparente, apto para el encabezado oscuro).
3. **Ola única sutil:** el encabezado y el pie dejan de tener 3 ondas y pasan a tener una sola onda de menor amplitud.
4. **Firma real:** el bloque de firma (actualmente una línea con el texto "EL TALLER DEL SOLDADOR") incorpora la imagen `firma.png` sobre la línea, manteniendo el texto debajo. Aplica tanto a la cotización como a la cuenta de cobro.

## Manejo de la firma (dato sensible)

- `firma.png` **nunca se commitea al repositorio** ni vive en `public/`.
- Se sube una única vez a MongoDB (colección `brandAssets`, mismo cluster que ya usa el proyecto) mediante un script de carga ejecutado manualmente por el usuario.
- El generador de PDF (que corre en el navegador, ver `DOCS/003-formulario-cotizacion-errores-implementacion.md` punto 1) la obtiene mediante un endpoint autenticado (`GET /api/brand-assets/firma`) justo antes de generar el documento.
- El logo, en cambio, **no es sensible** y sí se commitea en `public/` (`logo.png`, `logo.jpeg`, `logo_blanco.jpeg`), siguiendo la convención ya definida en `tech-stack.md`.

## Criterios de aceptación

- [x] El encabezado de la cotización y de la cuenta de cobro muestra un ícono junto a dirección, teléfono, correo y fecha.
- [x] El encabezado muestra el logo real (`logo.png`) en vez del placeholder "TF".
- [x] El encabezado y el pie usan una sola onda, visiblemente más sutil que la actual (menor amplitud).
- [x] La firma real aparece **encima** de la línea de firma (con el texto debajo) en el PDF de cotización y en el de cuenta de cobro.
- [x] `firma.png` no aparece en ningún commit del repositorio (agregado a `.gitignore`, nunca se hizo `git add`; verificable con `git log --all --full-history -- '*firma*'`).
- [x] Si la firma todavía no se ha subido a MongoDB, el PDF se sigue generando correctamente (con la línea y el texto, sin la imagen) — no bloquea la descarga.
- [x] Las pruebas existentes seguían pasando (64/64) y se agregan pruebas para `brandAssetService`, el endpoint `brand-assets` y `lib/brandAssets`.
- [ ] La firma real está subida a MongoDB y visible en un PDF descargado desde la app — pendiente de que el usuario ejecute `pnpm run upload:brand-asset` (ver `tasks.md`).

## Fuera de alcance

- No se rediseña la disposición general del PDF (tabla de ítems, notas, forma de pago, footer).
- No se sube el logo a MongoDB (se mantiene en `public/` por no ser sensible).
- No se agrega un ícono de soldador editable en el pie de los formularios web (mencionado en `tech-stack.md` > Estilo visual, pero no pedido en esta iteración).
- No se permite editar o reemplazar la firma desde la interfaz; el reemplazo se hace re-ejecutando el script de carga.
