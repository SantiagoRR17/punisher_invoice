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

## Nota de QA

Igual que en la feature 006: el logo (`/logo.png`) no se pudo previsualizar en el script de QA porque corre fuera del navegador (ruta relativa no resuelve en Node) — se valida por código, es el mismo patrón ya usado y aceptado en la feature anterior. El resto del diseño (paneles, onda, tabla, firma, recuadros de servicio, placeholder QR) se verificó visualmente con datos de prueba y coincide con `template_model2.jpeg`.

## Mantenimiento (checklist recurrente)

_Opcional. Pasos a repetir cada vez que se toque esta feature en el futuro._

- [ ] Cuando lleguen el logo hexagonal, la foto del soldador, el NIT real o el QR real, reemplazar los marcadores correspondientes (ver `plan.md` > Riesgos).
