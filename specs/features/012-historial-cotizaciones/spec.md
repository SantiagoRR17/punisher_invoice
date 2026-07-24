# **012 · Historial de cotizaciones**

**Estado:** Hecho ✅

## Qué hace

El usuario puede ver el listado histórico de cotizaciones generadas (las guardadas desde la feature 003/011), buscar por consecutivo o nombre del cliente, abrir el detalle (ítems y abono) de un registro, **descargar de nuevo su PDF**, y **editar** una cotización existente (cliente, ítems y abono) conservando su consecutivo. El historial vive junto al de cuentas de cobro, en `/historial`, mediante **pestañas**.

## Por qué

Hasta ahora las cotizaciones se guardaban pero no había forma de consultarlas, corregirlas ni volver a descargarlas: eran documentos "de un solo uso". Esta feature cierra ese vacío y deja el historial de cotizaciones a la par del de cuentas de cobro (feature 005).

## Pestañas en `/historial`

La pantalla `/historial` (que hoy solo lista cuentas de cobro) pasa a tener dos pestañas: **"Cotizaciones"** y **"Cuentas de cobro"**. El contenido de cuentas de cobro no cambia; solo se agrega la pestaña de cotizaciones y el conmutador. El título de la página se generaliza a "Historial".

## Edición

- El botón "Editar" de una cotización lleva a `/cotizacion/{id}/editar`, que reutiliza el formulario de cotización precargado con los datos guardados.
- Al guardar, se actualiza el mismo registro (mismo consecutivo, misma fecha de creación) recalculando total y saldo, y se vuelve a descargar el PDF actualizado.
- Editar es seguro porque el abono de la cotización es solo informativo: no hay saldo vivo ni pagos que reconciliar (a diferencia de las cuentas de cobro, que por eso no permiten editar ítems).

## Criterios de aceptación

- [x] `/historial` muestra dos pestañas: Cotizaciones y Cuentas de cobro
- [x] la pestaña de cuentas de cobro conserva el comportamiento actual (feature 005)
- [x] la pestaña de cotizaciones lista consecutivo, cliente, fecha, total y abono
- [x] permite buscar cotizaciones por consecutivo o nombre del cliente
- [x] permite abrir una cotización para ver su detalle (ítems y abono)
- [x] permite descargar de nuevo el PDF de una cotización desde el historial
- [x] permite editar una cotización existente (cliente, ítems y abono) conservando su consecutivo
- [x] al editar, se recalcula el total y el saldo y se descarga el PDF actualizado
- [x] el API expone `GET /api/cotizaciones` (lista) y `GET`/`PUT /api/cotizaciones/{id}`
- [x] conserva la información visible en español
- [ ] funciona de forma responsive en escritorio y dispositivos móviles (1280×800 y 375×667) — pendiente validación visual manual del usuario

## Fuera de alcance

- No incluye eliminar cotizaciones.
- No incluye seguimiento de pagos ni abonos posteriores sobre la cotización (el abono sigue siendo informativo).
- No incluye generar la cuenta de cobro desde la cotización (feature 013).
- No incluye control de permisos por rol (backlog de la constitución).
