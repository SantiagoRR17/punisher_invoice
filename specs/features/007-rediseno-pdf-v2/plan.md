# 007 · Rediseño de encabezado, tabla y pie de PDF (v2) — Plan

## Enfoque técnico

### 1. Onda vertical del encabezado (`pdfWave.ts`)

Las funciones actuales (`traceWave`, `buildHeaderCapPath`, `buildWaveRibbonPath`) trazan una onda **horizontal** (oscila en Y a lo largo de X) — sirven para un borde inferior, no para un divisor lado a lado. Se agregan funciones nuevas, sin tocar las existentes (dejan de usarse en `PdfBrand.tsx` pero se conservan por si se reutilizan):

- `tracePanelWave(height, baselineX, amplitude, periods)`: misma idea que `traceWave` pero transpuesta (oscila en X a lo largo de Y).
- `buildLeftPanelPath(width, height, baselineX, amplitude, periods)`: `M0,0 L{baselineX},0 {onda hacia abajo} L0,{height} Z` — región oscura, borde derecho ondulado.
- `buildRightPanelPath(width, height, baselineX, amplitude, periods)`: `M{width},0 L{baselineX},0 {misma onda} L{width},{height} Z` — región clara, borde izquierdo ondulado (misma curva que el panel izquierdo, así no queda espacio entre ambos).
- Constantes nuevas: `PANEL_VIEWBOX_WIDTH`, `PANEL_BASELINE_X` (~60% del ancho), `PANEL_WAVE_AMPLITUDE`, `PANEL_WAVE_PERIODS=1`, `HEADER_ZONE_HEIGHT` (se sube de 112 a ~132 para que quepan las 4 líneas de contacto con insignia + línea divisoria sin apretarse).
- Acabado "metálico" sin degradado (decisión ya tomada): color plano `#CDCDCF` de relleno + un trazo (`stroke`) delgado más claro sobre la misma curva, para insinuar un filo metálico sin necesitar gradiente.

### 2. `PdfBrand.tsx` (`PdfHeader`)

- Se reemplazan los dos `<Path>` de onda horizontal por los dos `<Path>` de panel (`buildLeftPanelPath` relleno `#00293B`, `buildRightPanelPath` relleno `#CDCDCF`, más el trazo de filo).
- Contenido superpuesto en dos bloques, ya no `justify-content: space-between` sobre todo el ancho, sino cada bloque acotado a su panel (anchos aproximados por porcentaje, con margen de seguridad respecto a `baselineX` para que el texto no cruce la onda):
  - **Bloque izquierdo:** `logo.png` (se mantiene, sin logo hexagonal aislado por ahora) + nombre + tagline en dos líneas de color distinto (`taglineLinea1` blanco, `taglineLinea2` en un azul claro/acento).
  - **Bloque derecho:** 4 filas de contacto (teléfono, correo, dirección, NIT), cada una con una insignia (`View` cuadrada oscura con esquinas redondeadas, ícono blanco centrado) + texto oscuro (el panel es claro) + línea divisoria delgada debajo de cada fila salvo la última.
- Se agrega `EMPRESA.nit` (valor de marcador, p. ej. `"Pendiente"`) y un ícono nuevo `IconNit` en `pdfIcons.tsx` (estilo carné/tarjeta de identificación).
- Ya no se muestra la fecha en el encabezado (se quita `IconFecha` de este componente; `formatFecha` se sigue exportando porque lo usan `CotizacionPdf`/`CuentaCobroPdf`).

### 3. Fecha junto al título

- `CuentaCobroPdf.tsx` ya tiene `metaRow` con `N° CUENTA` / `FECHA` — no cambia.
- `CotizacionPdf.tsx` agrega un `metaRow` análogo con solo `FECHA`, entre el título y el párrafo de introducción.

### 4. Tabla de ítems (`CotizacionPdf.tsx`, `CuentaCobroPdf.tsx`)

- Nuevas constantes de color (en `PdfBrand.tsx`, exportadas junto a `COLORS` para reutilizar entre ambos componentes): `TABLE_HEADER = "#023145"`, `TABLE_HIGHLIGHT = "#04445D"`, `TABLE_ROW_LIGHT = "#FEFEFE"`, `TABLE_ROW_ALT = "#EDEEF0"`.
- `tableHeaderRow` pasa de `COLORS.dark` a `TABLE_HEADER`.
- Cada fila de datos calcula su color según el índice: `index % 2 === 0 ? TABLE_ROW_LIGHT : TABLE_ROW_ALT` (ya no un estilo fijo `tableRow`, se aplica `backgroundColor` inline o vía función `rowBackground(index)`).
- **Cuenta de cobro:** `TOTAL` y `ABONO` (si existe) siguen el mismo patrón de alternancia, continuando el índice después de los ítems (`items.length`, `items.length + 1`). `SALDO PENDIENTE` se destaca con `TABLE_HIGHLIGHT` (ya no `COLORS.dark`/`COLORS.yellow`).
- **Cotización:** `TOTAL` se mantiene como fila destacada con `TABLE_HIGHLIGHT` (no participa de la alternancia), igual peso visual que tenía antes.

### 5. Bloque de firma

- Nuevo orden en `CotizacionPdf.tsx` y `CuentaCobroPdf.tsx`:
  1. Texto de agradecimiento, 2 líneas (`"Agradecemos su confianza."` regular, `"¡Estamos para construir juntos!"` negrita).
  2. `<Image>` de la firma (si `firmaUrl` está definido) — igual que en la feature 006.
  3. Línea horizontal (`signaturePlaceholder`, ya existente).
  4. `"EL TALLER DEL SOLDADOR"` (negrita, ya existente).
  5. `"ERICK JULIAN DUEÑAS FORERO"` (nueva línea, regular, más pequeña).
- Constante nueva en `PdfBrand.tsx`: `EMPRESA.titular = "ERICK JULIAN DUEÑAS FORERO"`.

### 6. Pie: recuadros de servicios + tagline nueva

- `PdfBrand.tsx` gana un componente `PdfServiceBoxes`: fila de 4 `View` (ícono + 2 líneas de texto), con los 4 íconos nuevos en `pdfIcons.tsx` (`IconFabricacion`, `IconInstalacion`, `IconMantenimiento`, `IconEstructuras` — formas geométricas simples, no se dispone de los íconos reales del template).
- `PdfFooter` se actualiza: agrega un ícono de escudo (`IconEscudo`, nuevo) y cambia el texto a `EMPRESA.taglineFooter = "CALIDAD EN CADA UNIÓN, COMPROMISO EN CADA PROYECTO"` (nueva constante, distinta de `EMPRESA.tagline` que sigue usándose en el encabezado).
- `CotizacionPdf.tsx` y `CuentaCobroPdf.tsx` agregan `<PdfServiceBoxes />` antes de `<PdfFooter />`.

### 7. Placeholder de QR (solo cuenta de cobro)

- `CuentaCobroPdf.tsx`: se reestructura la sección final en una fila de 3 columnas (`flexDirection: "row"`, `justifyContent: "space-between"`): `formaPago` (izquierda) | `qrPlaceholder` (centro) | `signatureBlock` (derecha).
- `qrPlaceholder`: `View` con borde punteado/sólido, tamaño fijo (~80x80), texto centrado "QR de pagos próximamente". Sin lógica de datos — es puramente visual por ahora.
- No se toca `models/CuentaCobro.ts` ni `services/cuentaCobroService.ts` (fuera de alcance, confirmado en `spec.md`).
- Cuando llegue el QR real: se sube a `brandAssets` (nombre `"qr"`) con el script `uploadBrandAsset.ts` ya existente (sin cambios), y se consulta con `fetchFirmaDataUrl`-style helper (se generaliza `lib/brandAssets.ts` a `fetchBrandAssetDataUrl(nombre)` en una iteración futura, **no en esta feature** — por ahora solo el placeholder visual).

## Riesgos

- **Legibilidad de texto sobre la onda:** si el texto del bloque izquierdo o las insignias del bloque derecho quedan muy cerca de `baselineX`, la curva puede recortarlos visualmente. Se deja margen de seguridad y se valida con el script de QA visual (igual que en la feature 006).
- **Altura del encabezado:** subir `HEADER_ZONE_HEIGHT` cambia la proporción general de la página; se valida que el resto del documento (tabla, notas, firma) no quede recortado o con demasiado espacio en blanco.
- **Íconos de servicios/escudo aproximados:** al no tener los íconos reales del template, se dibujan versiones simples (geométricas) — el usuario puede pedir ajustes visuales después de ver el resultado.
- **NIT y logo/foto pendientes:** el NIT queda con marcador de texto; el logo hexagonal y la foto del soldador no se incluyen. Ambos son reemplazos de bajo riesgo (una constante de texto y una imagen) cuando el usuario los entregue.

## Fuera de alcance del plan

- No se generaliza `fetchFirmaDataUrl` a un helper multi-asset en esta feature (se hace cuando llegue el QR real).
- No se toca el modelo de datos ni las validaciones de formulario.
- No se sube el QR real ni se conecta a `brandAssets` todavía (solo el placeholder visual).
