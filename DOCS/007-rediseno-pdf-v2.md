# Rediseño de encabezado, tabla y pie de PDF (v2)

Documentación funcional y técnica del rediseño de PDF. Ver también `specs/features/007-rediseno-pdf-v2/`.

## Comportamiento

- **Encabezado (`PdfBrand.tsx` > `PdfHeader`):** dos paneles lado a lado, altura `HEADER_ZONE_HEIGHT` (132pt). Panel izquierdo (`#00293b`): logo, nombre de la empresa, tagline en dos líneas de distinto color. Panel derecho (`#cdcdcf`): 4 filas de contacto (teléfono, correo, dirección, NIT) con insignia oscura + ícono blanco + línea divisoria delgada bajo cada fila salvo la última. Los dos paneles están recortados por una onda vertical (`pdfWave.ts` > `buildLeftPanelPath`/`buildRightPanelPath`, comparten la misma curva para no dejar huecos), con un trazo claro adicional sobre la curva para simular un filo metálico sin usar degradado.
- **Fecha:** ya no aparece en el encabezado (el NIT ocupó su lugar). Cada documento la muestra junto a su título (`metaRow`), igual que ya hacía `CuentaCobroPdf` con `N° CUENTA`.
- **Tabla de ítems:** encabezado `TABLE_HEADER` (`#023145`), filas de datos alternando `TABLE_ROW_LIGHT`/`TABLE_ROW_ALT` (`#fefefe`/`#edeef0`) vía el helper `tableRowBackground(index)` exportado desde `PdfBrand.tsx`. En cuenta de cobro, `TOTAL`/`ABONO` continúan la alternancia (índices `items.length`, `items.length + 1`); `SALDO PENDIENTE` se destaca con `TABLE_HIGHLIGHT` (`#04445d`). En cotización, `TOTAL` usa el mismo `TABLE_HIGHLIGHT` en vez de participar de la alternancia (conserva el peso visual de "cifra final").
- **Bloque de firma:** mensaje de agradecimiento (2 líneas) → imagen de la firma (si `firmaUrl` está disponible, igual que en la feature 006) → línea → "EL TALLER DEL SOLDADOR" → nombre del titular (`EMPRESA.titular`). Igual en ambos documentos.
- **Recuadros de servicio (`PdfServiceBoxes`):** fila de 4 íconos + etiqueta, entre el cuerpo del documento y el pie oscuro.
- **Pie (`PdfFooter`):** ícono de escudo + `EMPRESA.taglineFooter` ("CALIDAD EN CADA UNIÓN, COMPROMISO EN CADA PROYECTO"), distinta de la tagline del encabezado (`EMPRESA.taglineLinea1`/`taglineLinea2`).
- **Placeholder de QR (`CuentaCobroPdf.tsx`):** la sección final pasó de apilada (forma de pago arriba, firma abajo) a una fila de 3 columnas: forma de pago | recuadro con borde punteado y texto "QR de pagos próximamente" | bloque de firma. Solo en cuenta de cobro, porque solo ahí existe "FORMA DE PAGO". No hay lógica de datos todavía, es puramente visual.

## Datos pendientes de confirmar

- `EMPRESA.nit`: queda en `"Pendiente"` hasta que el usuario confirme el NIT real (editar la constante en `PdfBrand.tsx`).
- Logo hexagonal aislado y foto de fondo del soldador (visibles en `template_model2.jpeg`): no se usaron por no estar disponibles; el panel izquierdo reutiliza `logo.png`.
- QR real de pagos: cuando llegue, se sube a MongoDB con `scripts/uploadBrandAsset.ts --nombre qr --archivo <ruta>` (mismo mecanismo que la firma) y se conecta al placeholder — **no implementado en esta feature**.

## Errores previsibles

| Situación | Comportamiento esperado |
| --- | --- |
| La firma no se ha subido a MongoDB | El bloque de firma se muestra sin imagen (mensaje, línea y nombres igual) |
| El logo no carga (problema de red/origen) | El resto del encabezado se renderiza igual; solo falta la imagen del logo |
