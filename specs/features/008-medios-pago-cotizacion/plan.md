# 008 · Medios de pago y QR en cotización — Plan

## Enfoque técnico

### 1. `CotizacionPdf.tsx`: replicar el bloque de forma de pago + QR

Se sigue el mismo patrón que ya existe en `CuentaCobroPdf.tsx` (no se extrae a un componente compartido en `PdfBrand.tsx`: los dos archivos ya duplican estructura de tabla y estilos de forma independiente — mantener la duplicación es consistente con el resto del código y evita acoplar dos documentos que pueden divergir visualmente en el futuro):

- Se copia la constante `FORMA_PAGO` (mismos 3 medios de pago) y los estilos `bottomRow`, `formaPago*`, `qrBlock`, `qrPlaceholder*`, `qrImage`, `qrCaption` de `CuentaCobroPdf.tsx` a `CotizacionPdf.tsx`.
- Se importa `IconBanco`, `IconWallet` de `./pdfIcons` (ya existen, creados en la feature 007).
- El `signatureBlock` actual (fuera de cualquier fila, `alignItems: flex-end`) se mueve dentro de un nuevo `bottomRow` (`flexDirection: row`, `justifyContent: space-between`) junto a `formaPago` y `qrBlock`, en ese orden — igual que en cuenta de cobro.
- `signatureImage` pasa de 240×120 a 190×95 y `signaturePlaceholder` de 200 a 190 de ancho, para que la columna de firma quede del mismo tamaño que en cuenta de cobro y no desborde la fila de 3 columnas.

### 2. Prop `qrUrl`

- `CotizacionPdfProps` gana `qrUrl?: string`, igual que `CuentaCobroPdfProps`.
- El componente renderiza `<Image src={qrUrl} />` + "ESCANEA PARA PAGAR" si `qrUrl` está definido, o el placeholder punteado si no — misma lógica condicional que `CuentaCobroPdf.tsx`.

### 3. `CotizacionForm.tsx`: obtener el QR al generar el PDF

- Se importa `fetchQrDataUrl` además de `fetchFirmaDataUrl` desde `@/lib/brandAssets` (ya existe, no requiere cambios en `lib/brandAssets.ts`).
- Se agrega `fetchQrDataUrl()` al `Promise.all` existente (mismo patrón que `CuentaCobroForm.tsx`) y se pasa `qrUrl={qrUrl}` a `<CotizacionPdf />`.

### 4. Textos de cierre

- `CotizacionPdf.tsx`: literal `"¡Estamos para construir juntos!"` → `"¡Será un gusto realizar tu proyecto juntos!"`.
- `CuentaCobroPdf.tsx`: mismo literal → `"¡Fue un gusto realizar tu proyecto juntos!"`. Es el único cambio en este archivo (no se toca su bloque de forma de pago/QR, que ya está implementado).

### 5. `public/logo.png`

- Sin cambio de código. Se incluye el archivo ya modificado localmente en el commit de esta feature (confirmado con el usuario que es el reemplazo correcto).

## Decisiones

- **No extraer componente compartido para forma de pago/QR:** se evalúo crear `PdfFormaPagoYQr` en `PdfBrand.tsx` para evitar duplicar ~60 líneas entre los dos archivos, pero se descarta por ahora — el proyecto ya tolera esta duplicación entre cotización y cuenta de cobro (columnas de tabla, estilos de fila, etc.) y extraer solo esta sección rompería la simetría con el resto del archivo sin necesidad funcional inmediata. Si en el futuro se pide un tercer documento con el mismo bloque, se reconsidera.
- **Tamaño de firma en cotización:** se iguala a cuenta de cobro (190×95) en vez de mantener 240×120, porque ahora comparte fila con dos columnas más y al mismo ancho de página (A4, `padding: 20`) no cabe la versión grande sin desbordar.

## Riesgos

- **Desborde de página:** al agregar una fila más de contenido (forma de pago + QR + firma) después de la tabla y las notas, la página podría no tener espacio antes de los recuadros de servicios / pie. Se valida generando un PDF de prueba con datos representativos (varios ítems) antes de cerrar la feature.
- **Legibilidad del QR placeholder vs QR real:** mismo componente ya validado en cuenta de cobro (feature 007), riesgo bajo.

## Fuera de alcance del plan

- No se toca `models/Cotizacion.ts` ni `services/cotizacionService.ts`.
- No se generaliza el bloque de forma de pago/QR a un componente compartido (ver Decisiones).
- No se sube ni gestiona el archivo `public/qr.jpeg` (decisión del usuario: se deja como está).
