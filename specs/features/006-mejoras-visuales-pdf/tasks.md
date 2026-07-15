# 006 · Mejoras visuales de PDF — Tareas

_Checklist accionable derivada del `plan.md`. Tareas pequeñas y concretas; marca `[x]` al completarlas._

- [x] Crear `components/pdf/pdfIcons.tsx` con los 4 iconos (dirección, teléfono, correo, fecha).
- [x] Actualizar `PdfBrand.tsx` (`PdfHeader`) para mostrar cada ícono junto a su línea de contacto.
- [x] Reemplazar el placeholder de logo por `<Image src="/logo.png">` en `PdfBrand.tsx`.
- [x] Commitear `logo.png`, `logo.jpeg`, `logo_blanco.jpeg` en `public/` (sin `firma.png`).
- [x] Reducir `pdfWave.ts` a una sola onda sutil (`WAVE_PERIODS=1`, `WAVE_AMPLITUDE` menor).
- [x] Crear `models/BrandAsset.ts` y `services/brandAssetService.ts` (colección `brandAssets`).
- [x] Crear `scripts/uploadBrandAsset.ts` + script `upload:brand-asset` en `package.json`.
- [x] Crear `app/api/brand-assets/[nombre]/route.ts` (`GET`, autenticado).
- [x] Conectar `CotizacionForm.tsx`, `CuentaCobroForm.tsx` y `HistorialList.tsx` para obtener la firma antes de generar el PDF (con manejo de 404/error sin romper la descarga).
- [x] Agregar la imagen de firma **encima** de la línea de `signaturePlaceholder` (no debajo) en `CotizacionPdf.tsx` y `CuentaCobroPdf.tsx`, con el texto debajo de la línea.
- [ ] Ejecutar `pnpm run upload:brand-asset -- --nombre firma --archivo public/firma.png` una sola vez y luego borrar `public/firma.png` del working tree. **Pendiente: lo debe correr el usuario** (el agente no ejecuta escrituras contra la base de datos real sin autorización explícita, ver `constitution/tech-stack.md` > Límites duros).
- [x] Escribir/actualizar pruebas: `services/brandAssetService`, endpoint `brand-assets`, `lib/brandAssets` (éxito/404/error de red). Las pruebas de `CotizacionForm`/`CuentaCobroForm`/`HistorialList` ya cubrían implícitamente la descarga exitosa del PDF sin firma disponible (entorno de test sin firma real).
- [x] Verificar con `git status` / `git log` que `firma.png` nunca quedó en el historial del repo (agregado a `.gitignore`, nunca se hizo `git add`).
- [x] Validar visualmente el PDF generado (logo, iconos, ola, firma) en cotización y cuenta de cobro — renderizado local con datos de prueba (ver nota abajo sobre el logo).
- [x] Validar contra los criterios de aceptación de `spec.md`.
- [x] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.

## Nota de QA

El logo (`/logo.png`) se validó por código: es una ruta relativa servida por Next.js desde `public/`, el patrón estándar para assets estáticos en la app (funciona en el navegador). No se pudo verificar visualmente con el logo real porque el render de QA se hizo con un script de Node fuera del navegador (sin froncomponent/servidor de Next), donde una ruta que empieza en "/" no se resuelve igual. Se recomienda una verificación visual rápida en `pnpm run dev` la primera vez que se descargue un PDF real.

## Mantenimiento (checklist recurrente)

_Opcional. Pasos a repetir cada vez que se toque esta feature en el futuro._

- [ ] Si se reemplaza la firma o el logo, repetir el script de carga (firma) o reemplazar el archivo en `public/` (logo).
