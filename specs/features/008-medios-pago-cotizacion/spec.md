# **008 · Medios de pago y QR en cotización**

**Estado:** Hecho ✅

## Qué hace

Extiende a la cotización el bloque de "FORMA DE PAGO" + QR de pagos que ya existe en la cuenta de cobro (feature `007-rediseno-pdf-v2`), y ajusta el mensaje de cierre de ambos documentos para diferenciar cotización de cuenta de cobro.

## Por qué

Nuevas indicaciones del cliente: quiere poder cobrar directamente desde la cotización sin esperar a la cuenta de cobro, así que la cotización también debe mostrar cómo pagar (cuentas bancarias, Nequi, Bre-B) y el QR de pago. Además pide diferenciar el texto de cierre: la cotización se envía *antes* de hacer el trabajo ("Será un gusto..."), la cuenta de cobro se envía *después* ("Fue un gusto...").

## Alcance

### 1. Bloque "FORMA DE PAGO" + QR en cotización

- `CotizacionPdf.tsx` gana la misma sección que ya tiene `CuentaCobroPdf.tsx`: título "FORMA DE PAGO" con los 3 medios de pago (Davivienda, Nequi, Bre-B) con insignia + ícono, y el bloque de QR (imagen real si está subida a `brandAssets` con nombre `qr`, o placeholder "QR de pagos próximamente" si no).
- El QR se obtiene con el helper ya existente `fetchQrDataUrl()` (`lib/brandAssets.ts`, creado en la feature 007) — no se crea infraestructura nueva, se reutiliza la misma consulta a `/api/brand-assets/qr` que ya usa cuenta de cobro.
- El bloque de firma pasa de estar solo (alineado a la derecha, ancho completo) a compartir fila en 3 columnas (forma de pago | QR | firma), igual que en cuenta de cobro. Esto implica reducir el tamaño de la imagen de firma en cotización de 240×120 a 190×95 para que quepa en la columna, igual que ya pasa en cuenta de cobro.

### 2. Texto de cierre diferenciado

- Cotización: `"¡Estamos para construir juntos!"` → `"¡Será un gusto realizar tu proyecto juntos!"`.
- Cuenta de cobro: `"¡Estamos para construir juntos!"` → `"¡Fue un gusto realizar tu proyecto juntos!"`.
- Se mantiene la línea previa `"Agradecemos su confianza."` sin cambios, y el mismo formato (regular + negrita).

### 3. Logo en producción (corrección, no funcionalidad nueva)

- `public/logo.png` fue reemplazado localmente (versión más liviana, sin texto incrustado) pero nunca se comiteó, por lo que el despliegue seguía sirviendo el logo anterior. Se confirma con el usuario que el archivo local es el correcto y se incluye en el commit de esta feature.
- No hay cambio de código: `PdfBrand.tsx` ya lee `/logo.png` desde `public/` correctamente.

## Criterios de aceptación

- [x] La cotización muestra "FORMA DE PAGO" con los 3 medios de pago (mismos datos que cuenta de cobro) e íconos por medio.
- [x] La cotización muestra el QR real si está subido a `brandAssets` (`nombre: "qr"`), o el placeholder "QR de pagos próximamente" si no.
- [x] El bloque de firma en cotización queda en una fila de 3 columnas junto a forma de pago y QR, sin solaparse ni desbordar la página A4.
- [x] El mensaje de cierre de cotización dice "¡Será un gusto realizar tu proyecto juntos!".
- [x] El mensaje de cierre de cuenta de cobro dice "¡Fue un gusto realizar tu proyecto juntos!".
- [x] `public/logo.png` (versión actualizada) queda comiteado.
- [x] `npx tsc --noEmit` sin errores y `pnpm run test` sigue pasando (64/64).
- [x] Verificación visual generando un PDF de cotización de prueba con datos ficticios (con placeholder y con QR real), ver nota de QA en `tasks.md`.

## Fuera de alcance

- No se cambia la cuenta de cobro más allá del texto de cierre (su bloque de forma de pago/QR/firma ya existe y no se toca su estructura).
- No se sube un QR nuevo a MongoDB ni se cambia el mecanismo de `brandAssets` (se reutiliza el ya existente).
- No se toca `public/qr.jpeg`: el usuario decidió dejarlo como está (archivo local sin trackear, no referenciado por código).
- No cambian cálculos, validaciones de formulario, ni el modelo de datos de cotización.
