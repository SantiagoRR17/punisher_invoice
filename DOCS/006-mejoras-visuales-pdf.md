# Mejoras visuales de PDF

Documentación funcional y técnica de las mejoras visuales del PDF. Ver también `specs/features/006-mejoras-visuales-pdf/`.

## Comportamiento

- **Iconos de contacto:** `components/pdf/pdfIcons.tsx` define 4 iconos SVG minimalistas (dirección, teléfono, correo, fecha), dibujados con `Svg`/`Path`/`Circle` de `@react-pdf/renderer`. `PdfBrand.tsx` (`PdfHeader`) los muestra junto a cada línea de contacto, en blanco sobre el encabezado oscuro.
- **Logo real:** el placeholder circular "TF" se reemplazó por `<Image src="/logo.png">`, servido como archivo estático desde `public/` (junto con `logo.jpeg` y `logo_blanco.jpeg`, disponibles para otros usos futuros).
- **Ola única sutil:** `components/pdf/pdfWave.ts` pasó de 3 ondas (`WAVE_PERIODS=3`, `WAVE_AMPLITUDE=7`) a 1 sola onda más suave (`WAVE_PERIODS=1`, `WAVE_AMPLITUDE=4`). El resto de la lógica de trazado no cambió.
- **Firma real:** en el bloque de firma de `CotizacionPdf.tsx` y `CuentaCobroPdf.tsx`, la imagen de la firma se dibuja **encima** de la línea existente (no debajo), y el texto "EL TALLER DEL SOLDADOR" se mantiene debajo de la línea — el layout tradicional de un bloque de firma en papel.

## Manejo de la firma como dato sensible

La firma escaneada permite falsificar documentos a nombre del negocio si queda pública, así que **nunca se commitea al repositorio**:

- `models/BrandAsset.ts` + `services/brandAssetService.ts`: colección `brandAssets` en MongoDB (`{ nombre, data: Buffer, contentType, updatedAt }`). El driver de MongoDB devuelve los binarios como BSON `Binary`, no como `Buffer` nativo — `getBrandAsset` normaliza el valor a `Buffer` antes de devolverlo, para que el resto del código no tenga que lidiar con ese detalle.
- `scripts/uploadBrandAsset.ts` (`pnpm run upload:brand-asset -- --nombre firma --archivo <ruta>`): sube el archivo local a MongoDB. Se ejecuta manualmente desde la máquina del usuario, igual que `scripts/seedUsers.ts`. **El agente no ejecuta este script contra la base de datos real** (ver `constitution/tech-stack.md` > Límites duros: no modificar la base de datos real sin autorización explícita).
- `app/api/brand-assets/[nombre]/route.ts` (`GET`, autenticado): sirve los bytes del asset con su `Content-Type` real.
- `lib/brandAssets.ts` (`fetchFirmaDataUrl`): en el navegador, hace `fetch` al endpoint y convierte la respuesta a `data:` URL para pasarla como prop `firmaUrl` a los componentes de PDF. Si la petición falla o responde 404 (firma no subida todavía), devuelve `undefined` sin lanzar error — el PDF se sigue generando, solo que sin la imagen de firma.
- `public/firma.png` (y variantes `.jpg`/`.jpeg`) están en `.gitignore` como red de seguridad adicional, además de nunca hacerles `git add`.

## Errores previsibles

| Situación | Comportamiento esperado |
| --- | --- |
| La firma todavía no se subió a MongoDB | El endpoint devuelve 404, `fetchFirmaDataUrl` devuelve `undefined`, el PDF se descarga igual sin la imagen de firma |
| Falla la red al pedir la firma | Igual que el caso anterior: `fetchFirmaDataUrl` captura el error y devuelve `undefined` |
| Petición al endpoint de `brand-assets` sin sesión iniciada | 401, igual que el resto de endpoints de la API |
