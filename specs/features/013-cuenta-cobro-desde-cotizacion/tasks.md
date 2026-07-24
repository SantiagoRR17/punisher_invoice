# 013 · Generar cuenta de cobro a partir de una cotización — Tareas

_Checklist accionable derivada del `plan.md`. Marca `[x]` al completar._

- [x] `components/CuentaCobroForm.tsx`: prop `initial` (cliente/ítems/abono) y estados inicializados desde ella.
- [x] `components/HistorialCotizacionesList.tsx`: botón "Generar cuenta de cobro" → `/cuenta-cobro?cotizacion={id}`.
- [x] `app/cuenta-cobro/page.tsx`: server async, lee `searchParams`, `getCotizacion` y pasa `initial`.
- [x] Tests: `CuentaCobroForm` precarga desde `initial` (cliente/ítems/abono).
- [x] `npx tsc --noEmit`, `pnpm run test` (101/101) y `pnpm build` sin errores.
- [x] Validado contra los criterios de aceptación de `spec.md` (falta solo la validación visual manual del usuario).
- [x] Actualizar `specs/constitution/roadmap.md` (feature a "Hecho").
- [x] Documentar en `DOCS/013-cuenta-cobro-desde-cotizacion.md` y `-errores-implementacion.md`.
