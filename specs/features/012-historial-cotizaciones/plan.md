# 012 · Historial de cotizaciones — Plan

## Enfoque técnico

### 1. `services/cotizacionService.ts`

- `listCotizaciones()`: espejo de `listCuentasCobro` — `find({}).sort({ createdAt: -1 })`, mapea `_id` a string.
- `getCotizacion(id)`: valida el id con `ObjectId.isValid`; si no es válido o no existe, devuelve `null`; mapea `_id`.
- `updateCotizacion(id, input: NuevaCotizacionInput)`: recalcula `total` y `abono`; `findOneAndUpdate` por `_id` con `$set` de `cliente/items/total/abono` (conserva consecutivo, anio, numero, fecha, createdAt); lanza `CotizacionNoEncontradaError` si no existe. Devuelve la cotización actualizada.
- Clase `CotizacionNoEncontradaError` (espejo de `CuentaCobroNoEncontradaError`).

### 2. API

- `app/api/cotizaciones/route.ts`: añadir `GET` (con `auth()`), espejo del GET de cuentas de cobro.
- **Nuevo** `app/api/cotizaciones/[id]/route.ts`:
  - `GET`: devuelve la cotización o 404.
  - `PUT`: valida `cliente`/`items`/`abono` (mismos validadores que el POST, duplicados como ya se duplican entre las rutas de cotización y cuenta de cobro), verifica `abono ≤ total`, llama `updateCotizacion` y devuelve `{ consecutivo, total, abono, saldo, fecha }` (misma forma que el POST, para que el formulario reutilice su lógica de PDF). 404 si no existe.

### 3. Pestañas en `/historial`

- **Nuevo** `components/HistorialTabs.tsx` (client): estado `pestaña` ("cotizaciones" | "cuentas"); renderiza `<HistorialCotizacionesList/>` o `<HistorialList/>` (el actual, sin cambios). CSS propio `HistorialTabs.module.css`.
- `app/historial/page.tsx`: monta `HistorialTabs` en vez de `HistorialList`; título "Historial".

### 4. `components/HistorialCotizacionesList.tsx` (nuevo, basado en `HistorialList.tsx`)

- `fetch("/api/cotizaciones")`, búsqueda por consecutivo/cliente.
- Tabla: consecutivo, cliente, fecha, total, abono; detalle expandible con ítems.
- Botón "Descargar PDF": reconstruye `CotizacionPdf` en el navegador (patrón `handleDescargarPdf` con `fetchFirmaDataUrl`/`fetchQrDataUrl`).
- Botón "Editar": `Link` a `/cotizacion/{id}/editar`.
- CSS: reutiliza `HistorialList.module.css` (mismas clases) para no duplicar estilos.

### 5. Edición reutilizando el formulario

- `components/CotizacionForm.tsx`: nueva prop opcional `initial?: { cotizacionId, consecutivo, cliente, items, abono }`.
  - Estado inicializado desde `initial` cuando llega. El abono se recompone como tipo "manual" con el valor guardado (o "ninguno" si es 0), ya que solo se persiste el monto.
  - En `handleSubmit`, si hay `cotizacionId` → `PUT /api/cotizaciones/{id}`; si no → `POST` como hoy. El mensaje de éxito distingue "actualizada" de "guardada".
- **Nueva** ruta `app/cotizacion/[id]/editar/page.tsx` (server): obtiene la cotización con `getCotizacion(id)` (si no existe, `notFound()`), y monta `<CotizacionForm initial=... />` con el mismo layout/header que `/cotizacion`.

## Decisiones

- **Duplicar validadores en la ruta `[id]`:** consistente con el resto del código (cotización y cuenta de cobro ya tienen copias propias de `isValidCliente`/`isValidItems`).
- **PUT devuelve la misma forma que POST:** permite que `CotizacionForm` genere el PDF con un único flujo para crear y editar.
- **Recomponer el abono como "manual" al editar:** solo se guarda el monto, no el porcentaje; reproducir el mismo monto es suficiente porque el abono es informativo.
- **Reutilizar `HistorialList.module.css`:** el listado de cotizaciones comparte la misma estética de tabla/badges/detalle.

## Riesgos

- **Consultas por `_id` (ObjectId):** el resto del código consulta por `consecutivo`; aquí se introduce `ObjectId`. Se cubre validando el id y devolviendo 404/`null` ante ids inválidos.
- **Estado inicial del formulario:** los ids de fila (`nextRowId`) deben regenerarse al precargar ítems para no colisionar; se maneja creando filas nuevas a partir de `initial.items`.

## Fuera de alcance del plan

- Conversión a cuenta de cobro (feature 013) y eliminación de cotizaciones.
