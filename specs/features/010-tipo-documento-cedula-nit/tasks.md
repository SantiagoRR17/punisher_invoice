# 010 · Tipo de documento (Cédula/NIT) — Tareas

_Checklist accionable derivada del `plan.md`. Marca `[x]` al completar._

- [x] `models/Cotizacion.ts`: agregar `TipoDocumento` y `tipoDocumento` en `ClienteCotizacion`.
- [x] `models/CuentaCobro.ts`: agregar `TipoDocumento` y `tipoDocumento` en `ClienteCuentaCobro`.
- [x] `components/CotizacionForm.tsx`: `tipoDocumento` en el estado (default `"CC"`), `<select>` Cédula/NIT y etiqueta dinámica del número.
- [x] `components/CuentaCobroForm.tsx`: mismo cambio de formulario.
- [x] `app/api/cotizaciones/route.ts`: validar `tipoDocumento` en `isValidCliente`.
- [x] `app/api/cuentas-cobro/route.ts`: validar `tipoDocumento` en `isValidCliente`.
- [x] `components/pdf/CotizacionPdf.tsx`: imprimir `{tipoDocumento ?? "CC"} {cedula}`.
- [x] `components/pdf/CuentaCobroPdf.tsx`: imprimir `{tipoDocumento ?? "CC"} {cedula}`.
- [x] Actualizar tests que construyan un `cliente` para incluir `tipoDocumento` (5 fixtures) y añadir casos NIT/inválido en `cotizaciones.route.test.ts`.
- [x] `npx tsc --noEmit` sin errores; `pnpm run test` (78/78 en caliente; 2 fallos por flakiness de `waitFor` en frío, ver `-errores`).
- [x] Validado contra los criterios de aceptación de `spec.md`.
- [x] Actualizar `specs/constitution/roadmap.md` (feature a "Hecho").
- [x] Documentar en `DOCS/010-tipo-documento-cedula-nit.md` y `-errores-implementacion.md`.
