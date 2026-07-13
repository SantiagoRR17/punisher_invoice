# Formulario Cotización

Documentación funcional y técnica del formulario de cotización. Ver también `specs/features/003-formulario-cotizacion/`.

## Comportamiento

- Ruta protegida: `/cotizacion` (requiere sesión válida, igual que el resto de la app).
- `components/CotizacionForm.tsx`: formulario con datos del cliente (tratamiento, nombre, cédula, dirección, barrio) y una tabla de ítems (descripción, cantidad, valor unitario) con filas que se pueden agregar y eliminar.
- El valor de cada fila (`cantidad × valorUnitario`) y el total general se calculan y muestran en vivo mientras se escribe, usando `lib/currency.ts` para el formato de pesos colombianos (`$ 8'900.000,00`, con apóstrofe como separador de millones, igual que `template_model.jpeg`).
- Al hacer clic en "Descargar PDF":
  1. Se valida el formulario (cliente completo, al menos un ítem con descripción, cantidad y valor unitario > 0).
  2. Se envía `POST /api/cotizaciones`, que valida de nuevo en el servidor, calcula el total y guarda el documento en la colección `cotizaciones` de MongoDB.
  3. Se generan y descargan el PDF con `@react-pdf/renderer` (carga diferida, solo al hacer clic, para no aumentar el peso inicial de la página) usando `components/pdf/CotizacionPdf.tsx`.
- Los datos de la empresa (dirección, teléfono, correo) y las notas al pie (abono, plazo de entrega, condiciones) son texto fijo (boilerplate) definido en `CotizacionPdf.tsx`; no se editan desde el formulario.
- La fecha del documento es la fecha actual en el momento de generar el PDF.

## Diseño del PDF

`components/pdf/CotizacionPdf.tsx` reconstruye el diseño de `template_model.jpeg` con los componentes propios de `@react-pdf/renderer` (`View`/`Text`, no HTML/CSS): encabezado oscuro con logo, datos de contacto y fecha; franja amarilla; sección "DATOS DEL CLIENTE" y título "COTIZACIÓN Y ORDEN DE TRABAJO"; tabla de ítems con fila de total resaltada; notas numeradas; firma; y pie de página oscuro con la marca. Es una aproximación fiel pero no una captura pixel-perfect del HTML, ya que la librería usa su propio motor de layout.

## Placeholders de marca pendientes

No existen todavía en `public/` los archivos reales de logo (escudo "TF"), firma escaneada e ícono de soldador. Mientras tanto:

- El PDF muestra un círculo con el texto "TF" en vez del logo real.
- La firma es solo una línea con el nombre de la empresa, sin imagen escaneada.
- El pie de página de la pantalla de captura usa el carácter "⚒" como ícono provisional.

Cuando el usuario entregue los archivos reales, deben reemplazarse en `CotizacionPdf.tsx` (y en `app/cotizacion/page.tsx` para el ícono del footer) usando el componente `Image` de `@react-pdf/renderer` / `next/image` según corresponda.

## Errores previsibles

| Situación | Comportamiento esperado |
| --- | --- |
| Faltan datos del cliente o de algún ítem | Lista de errores clara junto al formulario; no se guarda ni se descarga nada |
| Cantidad o valor unitario ≤ 0 o no numérico | Error específico señalando el ítem afectado |
| Falla el guardado en MongoDB | Mensaje de error genérico; no se genera el PDF |
| Acceso a `/cotizacion` sin sesión iniciada | Redirección a `/login?callbackUrl=...` |

## Pruebas

- `tests/lib/currency.test.ts` — formato de moneda (apóstrofe en millones, casos menores a un millón, decimales).
- `tests/services/cotizacionService.test.ts` — guardado en MongoDB (Mongo Memory Server).
- `tests/components/CotizacionForm.test.tsx` — render, cálculo en vivo, agregar/eliminar ítems, validación de errores, flujo completo de guardado + descarga (con `fetch` y `@react-pdf/renderer` simulados).
- `tests/e2e/cotizacion.spec.ts` — smoke test de protección de ruta (`/cotizacion` sin sesión redirige a `/login`).
- QA manual en navegador contra MongoDB Atlas real: formulario completo, cálculo en vivo, descarga del PDF y verificación visual del documento generado, en viewports de escritorio (1280×800) y móvil (375×667), sin errores de consola.
