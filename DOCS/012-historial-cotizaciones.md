# Historial de cotizaciones

Documentación funcional y técnica de la feature 012. Ver también `specs/features/012-historial-cotizaciones/`.

## Comportamiento

- **`/historial` con pestañas:** la pantalla pasa de listar solo cuentas de cobro a tener dos pestañas — **"Cotizaciones"** y **"Cuentas de cobro"** — mediante `components/HistorialTabs.tsx`. La pestaña de cuentas de cobro reutiliza el `HistorialList` existente sin cambios. El título de la página se generalizó a "Historial".
- **Listado de cotizaciones** (`components/HistorialCotizacionesList.tsx`): tabla con consecutivo, cliente, fecha, total y abono; búsqueda por consecutivo o nombre de cliente; detalle expandible con los ítems y una línea de abono/saldo.
- **Re-descarga de PDF:** cada cotización del historial se puede volver a descargar, reconstruyendo `CotizacionPdf` en el navegador (mismo patrón que el historial de cuentas de cobro, con firma y QR servidos desde MongoDB).
- **Edición:** el botón "Editar" lleva a `/cotizacion/{id}/editar`, que reutiliza `CotizacionForm` precargado. Al guardar se hace `PUT /api/cotizaciones/{id}`, se conserva el consecutivo y la fecha de creación, se recalculan total y saldo, y se descarga el PDF actualizado. Editar es seguro porque el abono de la cotización es solo informativo (no hay saldo vivo ni pagos que reconciliar, a diferencia de las cuentas de cobro).

## Cambios técnicos

- `services/cotizacionService.ts`:
  - `listCotizaciones()` — lista ordenada por `createdAt` desc, con `_id` como string.
  - `getCotizacion(id)` — busca por `ObjectId`; devuelve `null` si el id es inválido o no existe.
  - `updateCotizacion(id, { cliente, items, abono })` — `findOneAndUpdate` por `_id`, `$set` de los campos editables; recalcula total; conserva consecutivo/anio/numero/fecha/createdAt; lanza `CotizacionNoEncontradaError` si no existe. Devuelve `{ consecutivo, total, abono, saldo, fecha }`.
- `app/api/cotizaciones/route.ts`: nuevo `GET` (lista).
- `app/api/cotizaciones/[id]/route.ts` (nuevo): `GET` (una, 404 si no existe) y `PUT` (valida cliente/ítems/abono con los mismos validadores del POST, verifica `abono ≤ total`, devuelve la misma forma que el POST).
- `components/CotizacionForm.tsx`: prop opcional `initial` (modo edición). Precarga cliente, ítems y abono; el abono se recompone como "manual" con el monto guardado (solo se persiste el monto, no el porcentaje). En submit, `PUT` si hay `initial`, `POST` si no.
- `app/cotizacion/[id]/editar/page.tsx` (nuevo): server component que carga la cotización con `getCotizacion` (o `notFound()`) y monta el formulario.

## Errores previsibles

| Situación | Comportamiento esperado |
| --- | --- |
| Editar con un abono mayor al nuevo total | El formulario y el `PUT` lo rechazan (400) |
| Abrir `/cotizacion/{id}/editar` con un id inexistente o inválido | La página responde 404 (`notFound()`) |
| Cotización guardada antes de la feature 011 (sin consecutivo/abono) | No aparecería con consecutivo; en la práctica no existen registros así porque el guardado siempre asignó consecutivo desde la 011 (las cotizaciones previas a la 011 sí carecen de estos campos y se verían con valores vacíos — no se hizo backfill) |
