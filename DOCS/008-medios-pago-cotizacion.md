# Medios de pago y QR en cotización

Documentación funcional y técnica de la feature 008. Ver también `specs/features/008-medios-pago-cotizacion/`.

## Comportamiento

- **`CotizacionPdf.tsx` gana el bloque "FORMA DE PAGO" + QR** que ya existía en `CuentaCobroPdf.tsx` (feature 007): se duplicó la constante `FORMA_PAGO` (Davivienda, Nequi, Bre-B, con ícono `IconBanco`/`IconWallet`) y los estilos `bottomRow`/`formaPago*`/`qrBlock`/`qrPlaceholder*`/`qrImage`/`qrCaption`, siguiendo el mismo patrón visual. Se duplica en vez de extraerse a un componente compartido en `PdfBrand.tsx` — ver justificación en `specs/features/008-medios-pago-cotizacion/plan.md` (Decisiones).
- **Bloque de firma reestructurado:** en cotización pasó de estar solo (alineado a la derecha, ancho completo) a compartir una fila de 3 columnas (`FORMA DE PAGO` | QR | firma), igual que en cuenta de cobro. La imagen de la firma se redujo de 240×120 a 190×95 para que quepa en la columna.
- **Prop `qrUrl?: string`** en `CotizacionPdfProps`: si llega, se muestra la imagen del QR + "ESCANEA PARA PAGAR"; si no, el placeholder punteado "QR de pagos próximamente" — misma lógica condicional que `CuentaCobroPdf.tsx`.
- **`CotizacionForm.tsx`** ahora también llama a `fetchQrDataUrl()` (ya existía en `lib/brandAssets.ts` desde la feature 007) en el `Promise.all` que genera el PDF al guardar, y pasa `qrUrl` a `<CotizacionPdf />`. No hay historial de cotizaciones (a diferencia de cuenta de cobro), así que este es el único lugar donde se genera el PDF de cotización.
- **Textos de cierre diferenciados:**
  - Cotización: `"¡Estamos para construir juntos!"` → `"¡Será un gusto realizar tu proyecto juntos!"`.
  - Cuenta de cobro: `"¡Estamos para construir juntos!"` → `"¡Fue un gusto realizar tu proyecto juntos!"`.
  - Antes ambos documentos compartían el mismo texto; ahora reflejan el momento del envío (cotización = antes del trabajo, cuenta de cobro = después).
- **`public/logo.png` comiteado:** el archivo ya estaba reemplazado localmente por una versión más liviana (~717KB vs ~1.07MB, sin texto incrustado) desde la sesión de la feature 007, pero nunca se había comiteado — por eso el logo en producción seguía siendo el anterior. No hubo cambio de código: `PdfBrand.tsx` ya leía `/logo.png` correctamente desde `public/`.

## Datos pendientes / decisiones del usuario

- `public/qr.jpeg` (sin trackear en git) se deja tal como está por decisión explícita del usuario — es el archivo que se usó para subir el QR real a MongoDB (`uploadBrandAsset.ts`) y no lo referencia ningún código.
- Igual que en features anteriores, el logo (`/logo.png`) no se puede previsualizar en scripts de QA fuera del navegador (ruta relativa no resuelve en Node) — se validó por código y visualmente en el resto del documento.

## Errores previsibles

| Situación | Comportamiento esperado |
| --- | --- |
| El QR no se ha subido a MongoDB (o falla la petición) | Se muestra el placeholder "QR de pagos próximamente" en la cotización, igual que ya pasaba en cuenta de cobro |
| La firma no se ha subido a MongoDB | El bloque de firma se muestra sin imagen (mensaje, línea y nombres igual) |
| Cotización con muchos ítems | La fila de 3 columnas (forma de pago / QR / firma) se valida sin desbordar en A4 con 4 ítems de prueba; con listas más largas, la tabla empuja el bloque hacia abajo igual que ya ocurría con las notas y la firma antes de esta feature |
