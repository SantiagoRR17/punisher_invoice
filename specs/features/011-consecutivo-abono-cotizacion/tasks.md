# 011 · Consecutivo `COT-{año}-####` y abono informativo — Tareas

_Checklist accionable derivada del `plan.md`. Marca `[x]` al completar._

- [x] `services/consecutivoService.ts`: generalizar `getNextConsecutivo(anio, tipo)` y `formatConsecutivo(anio, numero, prefijo)` con defaults compatibles.
- [x] `models/Cotizacion.ts`: agregar `consecutivo`, `anio`, `numero`, `abono`.
- [x] `services/cotizacionService.ts`: `saveCotizacion` recibe `{cliente, items, abono}`, asigna consecutivo COT y devuelve `{consecutivo, total, abono, saldo, fecha}`.
- [x] `app/api/cotizaciones/route.ts`: validar abono (≥0 y ≤ total) y devolver el objeto guardado.
- [x] `components/CotizacionForm.tsx` (+ `.module.css`): fieldset de abono (radios), resumen abono/saldo, envío de `abono`, uso de la respuesta y nombre `cotizacion-{consecutivo}.pdf`.
- [x] `components/pdf/CotizacionPdf.tsx`: props `consecutivo`/`abono`, fila meta del consecutivo, filas TOTAL/ABONO/SALDO condicionales, nota de abono dinámica.
- [x] Tests: `cotizacionService.test.ts` (nueva firma + consecutivos crecientes), contadores independientes en `consecutivoService.test.ts`, casos de abono/saldo y abono > total en `cotizaciones.route.test.ts`, mock actualizado en `CotizacionForm.test.tsx`.
- [x] `npx tsc --noEmit` sin errores; `pnpm run test` 85/85.
- [x] Validado contra los criterios de aceptación de `spec.md` (falta solo la validación visual manual del usuario).
- [x] Actualizar `specs/constitution/roadmap.md` (feature a "Hecho").
- [x] Documentar en `DOCS/011-consecutivo-abono-cotizacion.md` y `-errores-implementacion.md`.
