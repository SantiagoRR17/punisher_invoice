# Rediseño de encabezado, tabla y pie de PDF (v2)

Documentación funcional y técnica del rediseño de PDF. Ver también `specs/features/007-rediseno-pdf-v2/`.

## Comportamiento

> **Nota:** esta sección describe el estado **actual** (tras la revisión del usuario del mismo día que reemplazó la paleta azul/plateado y la onda vertical del primer intento). El detalle de qué cambió y por qué está en la sección "Ajuste posterior" de `spec.md`/`tasks.md` y en el error-log de esta carpeta.

- **Encabezado (`PdfBrand.tsx` > `PdfHeader`):** dos paneles lado a lado, altura `HEADER_ZONE_HEIGHT` (150pt), divididos por un **corte diagonal recto** (`pdfWave.ts` > `buildLeftPanelPath`/`buildRightPanelPath`, sin onda) más un trazo claro fino sobre la diagonal a modo de filo metálico.
  - **Panel izquierdo** (48% del ancho, `COLORS.metal` = `#e8e9ea`, metálico claro): logo (108×108) + nombre de la empresa (`COLORS.dark`) + tagline en dos líneas (`COLORS.accent` / `COLORS.textMuted`), todo en fila.
  - **Panel derecho** (52%, `COLORS.dark` = `#1b2a31`): solo datos de contacto, cada uno con su ícono en blanco — teléfono, correo, dirección y, **solo en cotización**, la fecha justo debajo de la dirección (ícono `IconFecha`, condicionado a que `PdfHeader` reciba la prop `fecha`). `CuentaCobroPdf` no pasa `fecha` a `PdfHeader`: mantiene su propia fila `FECHA` junto a `N° CUENTA`, al lado del título.
  - **Ola amarilla:** una sola onda horizontal (`COLORS.yellow` = `#f2b705`) atraviesa todo el ancho, pegada al borde inferior del encabezado (recupera la ola de la feature 006, ahora sobre los dos paneles). Para que el encabezado "corte" limpio a la altura de la ola sin dejar sobrante de color de panel debajo, se dibuja una máscara blanca (`buildBelowRibbonMaskPath`) justo debajo de la ola, del mismo ancho, hasta el borde inferior de la zona del encabezado.
  - Paleta: sin azul ni plateado oscuro (`#00293b`/`#023145`/`#04445d`/`#cdcdcf` descartados); solo `COLORS.dark`, `COLORS.yellow`, `COLORS.accent`, `COLORS.metal`.
- **Tabla de ítems:** encabezado con fondo `COLORS.dark` (ya no una constante `TABLE_HEADER` propia). Filas de datos alternan `TABLE_ROW_LIGHT`/`TABLE_ROW_ALT` (`#fefefe`/`#edeef0`) vía `tableRowBackground(index)`. La fila destacada (`TOTAL` en cotización, `SALDO PENDIENTE` en cuenta de cobro) volvió al patrón de **dos tonos** original: fila con fondo `COLORS.dark` y texto blanco para la etiqueta, celda de valor con fondo `COLORS.yellow` y texto `COLORS.dark` (ya no un solo color oscuro/azul uniforme para toda la fila).
- **Texto introductorio de cotización** ("De manera atenta..."): ya no comparte línea con la fecha (que se movió al encabezado); queda inmediatamente debajo del título "COTIZACIÓN Y ORDEN DE TRABAJO", alineado al mismo margen derecho (`alignSelf: "flex-end"` en el estilo, necesario porque un `Text` con `maxWidth` sin ese ajuste se queda pegado a la izquierda del contenedor en vez de alinearse al borde derecho — ver error-log).
- **Bloque de firma:** sin cambios en esta ronda — mensaje de agradecimiento → imagen de la firma (240×120 cotización, 190×95 cuenta de cobro) → línea → "EL TALLER DEL SOLDADOR" → nombre del titular.
- **Recuadros de servicio (`PdfServiceBoxes`) y pie (`PdfFooter`):** sin cambios estructurales; el pie mantiene fondo `COLORS.dark` pero el texto/ícono vuelven a ser `COLORS.yellow` (antes blanco), como en el diseño original.
- **Forma de pago (`CuentaCobroPdf.tsx`):** cada medio de pago (Davivienda, Nequi, Bre-B) ahora lleva una insignia cuadrada oscura con ícono blanco (`IconBanco` para bancos, `IconWallet` para Nequi, nuevos en `pdfIcons.tsx`), etiqueta en negrita y el detalle debajo, inspirado en `template_model2.jpeg`. Antes era una sola línea de texto plano por medio de pago.
- **QR de pagos (`CuentaCobroPdf.tsx`):** implementado. `CuentaCobroPdf` acepta una prop `qrUrl?: string`; si llega, se muestra la imagen (80×80, con borde) y el rótulo "ESCANEA PARA PAGAR" debajo, en vez del recuadro punteado placeholder. Se obtiene igual que la firma: `fetchQrDataUrl()` (nueva función en `lib/brandAssets.ts`, mismo patrón que `fetchFirmaDataUrl`) pide `GET /api/brand-assets/qr` (requiere sesión) y lo convierte a data URL; si el QR no se subió o falla la petición, devuelve `undefined` sin romper la generación del PDF y se ve el placeholder de siempre. Conectado en los dos lugares que generan `CuentaCobroPdf`: `CuentaCobroForm.tsx` (al guardar) y `HistorialList.tsx` (al descargar desde el historial).

## Datos pendientes de confirmar

- Logo hexagonal aislado y foto de fondo del soldador (visibles en `template_model2.jpeg`): no se usaron por no estar disponibles; el panel izquierdo reutiliza `logo.png`.
- `public/logo.png` apareció modificado en `git status` (mismo tamaño de imagen, ~717KB en vez de ~1.07MB) sin que ningún cambio de código de esta sesión lo explique — no se encontró ninguna referencia de escritura a ese archivo en el repo. Se dejó sin revertir ni commitear, pendiente de que el usuario confirme si es un cambio propio (p. ej. una optimización manual del archivo) antes de decidir qué hacer.
- `public/qr.jpeg` (sin trackear en git) apareció como el archivo local usado para subir el QR a MongoDB (`pnpm run upload:brand-asset -- --nombre qr --archivo ...`). No lo referencia ningún código — el PDF siempre lo trae de MongoDB vía `/api/brand-assets/qr` — así que es un archivo de staging que conviene borrar de `public/` para no dejar una copia del QR en el repo (misma política que la firma: nunca pública en el repo).

## Errores previsibles

| Situación | Comportamiento esperado |
| --- | --- |
| La firma no se ha subido a MongoDB | El bloque de firma se muestra sin imagen (mensaje, línea y nombres igual) |
| El QR no se ha subido a MongoDB | Se muestra el recuadro placeholder "QR de pagos próximamente" en vez de la imagen |
| El logo no carga (problema de red/origen) | El resto del encabezado se renderiza igual; solo falta la imagen del logo |
