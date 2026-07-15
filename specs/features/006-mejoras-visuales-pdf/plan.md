# 006 · Mejoras visuales de PDF — Plan

## Enfoque técnico

### 1. Iconos SVG de contacto

- Nuevo archivo `components/pdf/pdfIcons.tsx` con 4 componentes (`IconDireccion`, `IconTelefono`, `IconCorreo`, `IconFecha`), cada uno un `<Svg>` pequeño (`@react-pdf/renderer`) con un trazado simple en `COLORS.yellow`, tamaño ~9x9.
- `PdfBrand.tsx` (`PdfHeader`): cada `contactLine` pasa de `<Text>` suelto a una fila (`View` con `flexDirection: "row"`, `alignItems: "center"`, `gap` pequeño) con el ícono a la izquierda y el texto a la derecha.

### 2. Logo real

- `PdfHeader` reemplaza `logoPlaceholder` (círculo "TF") por `<Image src="/logo.png" style={...} />` de `@react-pdf/renderer`.
- `/logo.png` se sirve desde `public/` (mismo origen que la app, sin necesidad de URL absoluta).
- `logo.jpeg` y `logo_blanco.jpeg` también se commitean en `public/` aunque no se usen todavía en el PDF, para tenerlos disponibles si se piden en otra pantalla.

### 3. Ola única sutil

- `pdfWave.ts`: `WAVE_PERIODS` de `3` a `1`, `WAVE_AMPLITUDE` de `7` a `4` (subjetivo — se ajusta con QA visual del PDF generado). El resto de la lógica (`traceWave`, `buildHeaderCapPath`, `buildWaveRibbonPath`) no cambia.

### 4. Firma vía MongoDB (dato sensible, nunca en el repo)

**Modelo y servicio**

- `models/BrandAsset.ts`: `interface BrandAsset { _id?: string; nombre: string; data: Buffer; contentType: string; updatedAt: Date }`.
- `services/brandAssetService.ts`: `getBrandAsset(nombre: string)`, `upsertBrandAsset(nombre, data, contentType)`, ambos sobre la colección `brandAssets` (índice único por `nombre`).

**Carga inicial**

- `scripts/uploadBrandAsset.ts` (mismo patrón que `scripts/seedUsers.ts`, usando `tsx` + `dotenv`): `pnpm run upload:brand-asset -- --nombre firma --archivo ruta/al/firma.png`. Lee el archivo local indicado, lo sube a MongoDB, nunca lo commitea.
- Nuevo script en `package.json`: `"upload:brand-asset": "tsx scripts/uploadBrandAsset.ts"`.
- El usuario ejecuta este script una vez desde su máquina con `firma.png` local (fuera del repo, o justo antes de borrarlo de `public/`).

**Servir la firma al PDF (que se genera en el navegador)**

- Nuevo route handler `app/api/brand-assets/[nombre]/route.ts`: `GET`, protegido con `auth()` igual que el resto de endpoints, devuelve la imagen con `Content-Type` real (no JSON) para uso directo, y también se usa vía `fetch` + `blob()` → `URL.createObjectURL` o dataURL en el cliente.
- En `CotizacionForm.tsx` y `CuentaCobroForm.tsx`, antes de generar el PDF: `fetch("/api/brand-assets/firma")`; si responde 200, se convierte a dataURL (`FileReader` o `arrayBuffer` → base64) y se pasa como prop `firmaUrl` a `CotizacionPdf`/`CuentaCobroPdf`; si responde 404 (no se ha subido todavía) o falla, se pasa `undefined` y el PDF se genera igual, sin firma.
- `CotizacionPdf.tsx` / `CuentaCobroPdf.tsx`: `signatureBlock` agrega `<Image src={firmaUrl} style={styles.signatureImage} />` encima de `signaturePlaceholder` solo si `firmaUrl` está definido; el texto "EL TALLER DEL SOLDADOR" se mantiene debajo de la línea en ambos casos.

## Decisiones ya confirmadas con el usuario

- Firma en MongoDB (no variable de entorno: pesa ~1.05MB, muy por encima del límite de 64KB de Vercel para env vars).
- Logo real (`logo.png`, con fondo transparente) sí se commitea en `public/`, no es sensible.
- `logo.png` específicamente para el encabezado del PDF (fondo oscuro).
- La firma se agrega como imagen sobre la línea existente, el texto de la empresa se mantiene debajo.

## Riesgos

- **Tamaño de la firma en cada descarga:** ~1.05MB en base64 (~1.4MB) viaja al navegador cada vez que se genera un PDF. Aceptable para el volumen de uso de este negocio (bajo), pero si se vuelve notorio se puede comprimir la imagen antes de subirla.
- **`@react-pdf/renderer` con dataURL grande:** no hay antecedente en este proyecto de usar `<Image>` con datos embebidos; se valida con QA manual que el PDF se genera sin errores ni demoras notorias.
- **Firma no subida todavía:** el endpoint puede devolver 404 legítimamente (antes de correr el script). El flujo de descarga de PDF no debe romperse en ese caso — se cubre con un test.
- **Contraste del logo:** si `logo.png` no tiene transparencia real, puede verse como un recuadro sobre el encabezado oscuro. Se valida visualmente al implementar; si no funciona, se reconsidera con el usuario cuál de los 3 logos usar.

## Fuera de alcance del plan

- No se migra el logo a MongoDB.
- No se agrega UI para reemplazar la firma; solo el script de carga por línea de comandos.
