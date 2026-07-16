# 007 · Rediseño de encabezado, tabla y pie de PDF (v2) — Tareas

_Checklist accionable derivada del `plan.md`. Tareas pequeñas y concretas; marca `[x]` al completarlas._

- [x] `pdfWave.ts`: agregar `tracePanelWave`, `buildLeftPanelPath`, `buildRightPanelPath`, `buildPanelDividerStrokePath` y constantes del panel, sin borrar las funciones/constantes de la onda horizontal existente.
- [x] `pdfIcons.tsx`: agregar `IconNit`, `IconFabricacion`, `IconInstalacion`, `IconMantenimiento`, `IconEstructuras`, `IconEscudo` (se quitó `IconFecha`, que quedó sin uso al salir la fecha del encabezado).
- [x] `PdfBrand.tsx`: agregar constantes `TABLE_HEADER`, `TABLE_HIGHLIGHT`, `TABLE_ROW_LIGHT`, `TABLE_ROW_ALT`, `EMPRESA.nit`, `EMPRESA.titular`, `EMPRESA.taglineFooter`, y el helper `tableRowBackground(index)`.
- [x] `PdfBrand.tsx` (`PdfHeader`): reescrito con los dos paneles + onda vertical, insignias de contacto, tagline en dos líneas, sin fecha ni ícono de fecha.
- [x] `PdfBrand.tsx`: nuevo componente `PdfServiceBoxes` (4 recuadros de servicio).
- [x] `PdfBrand.tsx` (`PdfFooter`): actualizado texto e ícono (escudo + nueva tagline).
- [x] `CotizacionPdf.tsx`: agregado `metaRow` de FECHA junto al título.
- [x] `CotizacionPdf.tsx` y `CuentaCobroPdf.tsx`: colores intercalados aplicados a la tabla (filas de datos + fila destacada).
- [x] `CotizacionPdf.tsx` y `CuentaCobroPdf.tsx`: bloque de firma actualizado (mensaje arriba, nombre del titular debajo).
- [x] `CotizacionPdf.tsx` y `CuentaCobroPdf.tsx`: agregado `<PdfServiceBoxes />` antes de `<PdfFooter />`.
- [x] `CuentaCobroPdf.tsx`: sección final reestructurada en 3 columnas (forma de pago | placeholder QR | firma).
- [x] QA visual con script temporal: encabezado, tabla, firma, recuadros de servicios y placeholder QR revisados en ambos documentos (ver nota sobre el logo, igual que en la feature 006). Script e imágenes de prueba borrados al terminar, nunca commiteados.
- [x] Detectado y corregido en QA: `@react-pdf/renderer` partía palabras largas con un guion ("ERICK JU-LIAN", "próxi-mamente") al reducir el ancho de las columnas. Se desactivó la hifenación automática con `Font.registerHyphenationCallback((word) => [word])` en `PdfBrand.tsx`.
- [x] Ejecutado `pnpm run test` (64/64) y `npx tsc --noEmit` (sin errores); no hizo falta ajustar tests existentes.
- [x] Validado contra los criterios de aceptación de `spec.md`.
- [x] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.

## Ajuste posterior (revisión del usuario tras ver el resultado)

- [x] Quitar el NIT del encabezado (`PdfBrand.tsx`): eliminado `EMPRESA.nit`, la fila de contacto y el ícono `IconNit` (sin otros usos, se borró de `pdfIcons.tsx`); la fila de "dirección" pasa a ser la última (sin línea divisoria debajo).
- [x] Agrandar el logo del encabezado: `logo` de 40×40 a 64×64.
- [x] Agrandar la firma: `signatureImage` de 160×40 a 240×120 en `CotizacionPdf.tsx` y a 190×95 en `CuentaCobroPdf.tsx` (más angosta ahí por la fila de 3 columnas); `signaturePlaceholder` ajustado a 200/190 de ancho para acompañar.
- [x] Bajar los recuadros de servicios hasta quedar pegados al pie: se movió `marginTop: "auto"` de `footer` a `serviceBoxes` en `PdfBrand.tsx`, así ambos se empujan juntos al final de la página.
- [x] QA visual repetido con el mismo script temporal (borrado al terminar); `pnpm run test` (64/64) y `npx tsc --noEmit` sin errores.

## Nota de QA

Igual que en la feature 006: el logo (`/logo.png`) no se pudo previsualizar en el script de QA porque corre fuera del navegador (ruta relativa no resuelve en Node) — se valida por código, es el mismo patrón ya usado y aceptado en la feature anterior. El resto del diseño (paneles, onda, tabla, firma, recuadros de servicio, placeholder QR) se verificó visualmente con datos de prueba y coincide con `template_model2.jpeg`.

## Ajuste posterior 2 (sesión siguiente, revisión iterativa del usuario)

- [x] `pdfIcons.tsx`: restaurado `IconFecha` (se había quitado en el ajuste anterior al sacar la fecha del encabezado); agregados `IconBanco` e `IconWallet` para "FORMA DE PAGO".
- [x] `PdfBrand.tsx`: `COLORS` sin `panelDark`/`panelLight` (azul/plateado); agregado `COLORS.metal` (panel claro). Quitadas las constantes `TABLE_HEADER`/`TABLE_HIGHLIGHT` (ya no hacen falta, ver siguiente punto).
- [x] `CotizacionPdf.tsx` y `CuentaCobroPdf.tsx`: encabezado de tabla con `COLORS.dark` directo; fila destacada (`TOTAL`/`SALDO PENDIENTE`) vuelve al patrón de dos tonos (fila `COLORS.dark` + celda de valor `COLORS.yellow`/`COLORS.dark`), en vez de la constante `TABLE_HIGHLIGHT` de un solo color.
- [x] `CotizacionPdf.tsx`: quitado el `metaRow` de FECHA del bloque de título; la fecha se pasa ahora a `<PdfHeader fecha={fecha} />`. Corregido el alineado del párrafo "De manera atenta..." con `alignSelf: "flex-end"` (ver error-log #3).
- [x] `PdfBrand.tsx` (`PdfHeader`): prop `fecha?: Date` opcional; si se recibe, agrega una fila de contacto más (ícono `IconFecha`) debajo de la dirección. `CuentaCobroPdf` sigue sin pasarla (mantiene su propio `FECHA` junto al título).
- [x] `pdfWave.ts`: agregado `buildBelowRibbonMaskPath` (máscara blanca para que la ola no deje sobrante de color debajo, ver error-log #4); reemplazadas `tracePanelWave`/`buildLeftPanelPath`/`buildRightPanelPath`/`buildPanelDividerStrokePath` (onda vertical) por versiones de **diagonal recta** (`PANEL_BASELINE_X`, `PANEL_DIAGONAL_SKEW`).
- [x] `PdfBrand.tsx` (`PdfHeader`): restaurada la ola amarilla de una sola onda en el borde inferior del encabezado (`HEADER_WAVE_*`), con la máscara del punto anterior. `HEADER_ZONE_HEIGHT` subido de 132 a 150 para dar espacio al logo agrandado sin invadir la ola.
- [x] `PdfBrand.tsx`: reestructurado el contenido del encabezado — panel izquierdo (claro, ~48%) ahora agrupa logo (108×108) + nombre + tagline en fila; panel derecho (oscuro, ~52%) queda solo con las filas de contacto. Ajustado `PANEL_DIAGONAL_SKEW` (50 → 34) y `paddingLeft` de `rightPanel` (24 → 44) para que la diagonal no cruce los íconos de teléfono/correo (ver error-log #5).
- [x] `CuentaCobroPdf.tsx`: `FORMA_PAGO` pasó de array de strings a array de `{ Icon, label, detalle }`; cada fila muestra una insignia con ícono (`IconBanco`/`IconWallet`), etiqueta en negrita y detalle debajo.
- [x] QA visual con script temporal (`scripts/tmpRenderTest*.tsx`, `scripts/tmpTsconfig.json`): ambos PDF generados con datos de prueba en cada punto de ajuste y revisados leyendo el PDF resultante. Scripts borrados al terminar, nunca commiteados.
- [x] `npx tsc --noEmit` sin errores y `pnpm run test` (64/64) verificados al cierre de la sesión.
- [x] Detectado durante la sesión y **no resuelto**: `public/logo.png` aparece modificado en `git status` sin que ningún cambio de esta sesión lo explique (ver error-log #6) — se dejó sin tocar, pendiente de confirmación del usuario.

## Ajuste posterior 3 (QR real conectado)

- [x] `lib/brandAssets.ts`: agregada `fetchQrDataUrl()` (mismo patrón que `fetchFirmaDataUrl`: pide `/api/brand-assets/qr`, devuelve `undefined` sin lanzar si no existe o falla).
- [x] `CuentaCobroPdf.tsx`: agregada prop `qrUrl?: string`; si llega, se reemplaza el recuadro placeholder por la imagen (80×80, con borde) y el rótulo "ESCANEA PARA PAGAR"; si no, se sigue viendo el placeholder de siempre.
- [x] `CuentaCobroForm.tsx` y `HistorialList.tsx`: agregado `fetchQrDataUrl()` al `Promise.all` existente (junto a `fetchFirmaDataUrl()`) y pasada la prop `qrUrl` a `<CuentaCobroPdf />` en los dos lugares que lo generan (al guardar y al descargar desde el historial).
- [x] QA visual con script temporal (`scripts/tmpRenderQr.tsx`, un data URL de una imagen mínima como QR de prueba): confirmado que la imagen y el rótulo ocupan el mismo espacio que el placeholder, sin romper el layout de 3 columnas. Script borrado al terminar, nunca commiteado.
- [x] `npx tsc --noEmit`, `eslint` y `pnpm run test` (64/64) sin errores — no hizo falta tocar los tests existentes porque el mock de `fetch` en `CuentaCobroForm.test.tsx`/`HistorialList.test.tsx` ya cubre cualquier llamada adicional (ver patrón de `fetchFirmaDataUrl` en esos tests).
- [x] Detectado durante la sesión: `public/qr.jpeg` (sin trackear) es el archivo local que se usó como `--archivo` al subir el QR con `uploadBrandAsset.ts` — no lo referencia ningún código, se recomendó borrarlo de `public/` para no dejar una copia del QR en el repo (ver error-log).

## Mantenimiento (checklist recurrente)

_Opcional. Pasos a repetir cada vez que se toque esta feature en el futuro._

- [ ] Cuando lleguen el logo hexagonal, la foto del soldador o el NIT real, reemplazar los marcadores correspondientes (ver `plan.md` > Riesgos). El QR real ya está conectado (Ajuste posterior 3).
