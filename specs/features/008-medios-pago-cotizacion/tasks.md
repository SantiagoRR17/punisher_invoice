# 008 · Medios de pago y QR en cotización — Tareas

_Checklist accionable derivada del `plan.md`. Tareas pequeñas y concretas; marca `[x]` al completarlas._

- [x] `CotizacionPdf.tsx`: importar `IconBanco`, `IconWallet` de `./pdfIcons` y agregar la constante `FORMA_PAGO` (copiada de `CuentaCobroPdf.tsx`).
- [x] `CotizacionPdf.tsx`: agregar estilos `bottomRow`, `formaPago*`, `qrBlock`, `qrPlaceholder*`, `qrImage`, `qrCaption` (copiados de `CuentaCobroPdf.tsx`).
- [x] `CotizacionPdf.tsx`: mover `signatureBlock` dentro de un `bottomRow` de 3 columnas (forma de pago | QR | firma); reducir `signatureImage` a 190×95 y `signaturePlaceholder` a 190 de ancho.
- [x] `CotizacionPdf.tsx`: agregar prop `qrUrl?: string` a `CotizacionPdfProps` y renderizar imagen/placeholder según corresponda.
- [x] `CotizacionPdf.tsx`: cambiar texto de cierre a `"¡Será un gusto realizar tu proyecto juntos!"`.
- [x] `CuentaCobroPdf.tsx`: cambiar texto de cierre a `"¡Fue un gusto realizar tu proyecto juntos!"` (único cambio en este archivo).
- [x] `CotizacionForm.tsx`: importar `fetchQrDataUrl`, agregarlo al `Promise.all` y pasar `qrUrl` a `<CotizacionPdf />`.
- [x] `git add public/logo.png` para incluir el logo actualizado en el commit de esta feature.
- [x] QA visual: script temporal `scripts/tmpRenderCotizacionQr.tsx` (+ `scripts/tmpTsconfig.json` con `jsx: "react-jsx"`, necesario para ejecutar JSX vía `tsx` fuera de Next.js — mismo problema que en la feature 007) generó la cotización con datos representativos (4 ítems), una vez con placeholder de QR y otra con un QR real de prueba; ambas se revisaron leyendo el PDF resultante, sin desborde ni solape con los recuadros de servicios. Scripts y PDFs de prueba borrados al terminar, nunca commiteados.
- [x] Ejecutado `npx tsc --noEmit` (sin errores) y `pnpm run test` (64/64) — no hizo falta ajustar los tests existentes. Nota: la primera corrida completa tuvo 2 fallos por timeout de `waitFor` (entorno lento en frío); al repetir, 64/64 pasaron de forma estable — ver `DOCS/008-medios-pago-cotizacion-errores-implementacion.md`.
- [x] Validado contra los criterios de aceptación de `spec.md`.
- [x] Actualizado `specs/constitution/roadmap.md`: feature movida a "Hecho" y "Cambio de contraseña de usuario" renumerada de 008 a 009.
- [x] Documentado en `DOCS/008-medios-pago-cotizacion.md` y `DOCS/008-medios-pago-cotizacion-errores-implementacion.md`.
