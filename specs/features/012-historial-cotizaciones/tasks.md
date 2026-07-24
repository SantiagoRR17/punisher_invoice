# 012 · Historial de cotizaciones — Tareas

_Checklist accionable derivada del `plan.md`. Marca `[x]` al completar._

- [x] `services/cotizacionService.ts`: `listCotizaciones`, `getCotizacion`, `updateCotizacion`, `CotizacionNoEncontradaError`.
- [x] `app/api/cotizaciones/route.ts`: añadir `GET` (lista).
- [x] `app/api/cotizaciones/[id]/route.ts` (nuevo): `GET` (una) y `PUT` (editar) con validación y 404.
- [x] `components/HistorialCotizacionesList.tsx` (nuevo): listado, búsqueda, detalle, Descargar PDF, Editar.
- [x] `components/HistorialTabs.tsx` (+ `.module.css`) nuevo: conmutador de pestañas.
- [x] `app/historial/page.tsx`: montar `HistorialTabs`; título "Historial".
- [x] `components/CotizacionForm.tsx`: prop `initial` (modo edición) y `PUT` en submit; mensajes según modo.
- [x] `app/cotizacion/[id]/editar/page.tsx` (nuevo): carga la cotización y monta el formulario en modo edición.
- [x] Tests: `listCotizaciones`/`getCotizacion`/`updateCotizacion` en el service; `GET` lista y `GET`/`PUT` por id en la ruta (`cotizacionesId.route.test.ts`).
- [x] `npx tsc --noEmit`, `pnpm run test` (100/100) y `pnpm build` sin errores.
- [x] Validado contra los criterios de aceptación de `spec.md` (falta solo la validación visual manual del usuario).
- [x] Actualizar `specs/constitution/roadmap.md` (feature a "Hecho").
- [x] Documentar en `DOCS/012-historial-cotizaciones.md` y `-errores-implementacion.md`.
