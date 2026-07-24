# 013 · Generar cuenta de cobro a partir de una cotización — Plan

## Enfoque técnico

### 1. `components/CuentaCobroForm.tsx` — prop `initial`

- Nueva prop opcional `initial?: CuentaCobroInicial { cliente, items, abono }` (misma idea que `CotizacionForm.initial`).
- Estado inicializado desde `initial` cuando llega: cliente, ítems (con `rowsFromItems`), y el abono recompuesto como `tipoAbono: "manual"` + `abonoManual` con el monto (o "ninguno" si es 0).
- Sin `initial`, comportamiento actual (formulario vacío). No cambia el submit: la cuenta se crea con POST y su consecutivo propio.

### 2. `components/HistorialCotizacionesList.tsx` — botón "Generar cuenta de cobro"

- Junto a "Editar", un `Link` a `/cuenta-cobro?cotizacion={_id}` (solo si hay `_id`).

### 3. `app/cuenta-cobro/page.tsx` — precarga desde el parámetro

- Convertir a server component `async` que recibe `searchParams: Promise<{ cotizacion?: string }>`.
- Si llega `cotizacion`, `getCotizacion(id)`; si existe, arma `initial` (cliente, items, abono) y lo pasa a `CuentaCobroForm`. Si no (id inválido/inexistente), monta el formulario vacío.

## Decisiones

- **Reusar `getCotizacion` (server-side) en vez de un fetch al API:** la página ya es server component y `getCotizacion` valida el id y devuelve `null` de forma segura.
- **Abono recompuesto como "manual":** solo se persiste el monto en la cotización; reproducirlo como manual conserva el valor. El usuario puede reelegir 50/60 si prefiere.
- **No marcar la cotización:** se mantiene el alcance mínimo (sin vínculo persistente). La trazabilidad queda como backlog.
- **`ClienteCotizacion`/`ItemCotizacion` ≡ `ClienteCuentaCobro`/`ItemCuentaCobro`:** estructuras idénticas, compatibles estructuralmente para pasar los datos.

## Riesgos

- **`searchParams` como Promise (Next 15):** se hace `await searchParams`.
- **Datos precargados que no cumplen validación:** el formulario revalida en submit igual que siempre; no se confía en la precarga.

## Fuera de alcance del plan

- Trazabilidad cotización→cuenta y marca de "facturada".
