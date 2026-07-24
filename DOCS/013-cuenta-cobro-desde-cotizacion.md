# Generar cuenta de cobro a partir de una cotización

Documentación funcional y técnica de la feature 013. Ver también `specs/features/013-cuenta-cobro-desde-cotizacion/`.

## Comportamiento

- **Botón "Generar cuenta de cobro"** en cada fila del historial de cotizaciones (`HistorialCotizacionesList`), junto a "Editar". Navega a `/cuenta-cobro?cotizacion={id}`.
- **Precarga:** `app/cuenta-cobro/page.tsx` es ahora un server component `async` que lee `searchParams.cotizacion`; si llega, carga la cotización con `getCotizacion` y pasa `initial` (cliente, ítems y abono) a `CuentaCobroForm`.
- **Formulario precargado:** `CuentaCobroForm` acepta una prop opcional `initial`. Con ella, inicializa cliente e ítems y recompone el abono como valor manual con el monto de la cotización (solo se conoce el monto, no el porcentaje). El usuario puede ajustar cualquier campo antes de generar.
- **Cuenta independiente:** al generar, la cuenta sigue el flujo normal (POST a `/api/cuentas-cobro`) y recibe su propio consecutivo `CC-{año}-####`. **No** se modifica ni se marca la cotización de origen.
- **Sin parámetro / parámetro inválido:** entrar a `/cuenta-cobro` sin `cotizacion`, o con un id inexistente/inválido, monta el formulario vacío como antes (`getCotizacion` devuelve `null` de forma segura).

## Cambios técnicos

- `components/CuentaCobroForm.tsx`: prop `initial?: CuentaCobroInicial { cliente, items, abono }` (misma idea que `CotizacionForm.initial`); helper `rowsFromItems` para las filas precargadas.
- `components/HistorialCotizacionesList.tsx`: nuevo `Link` "Generar cuenta de cobro".
- `app/cuenta-cobro/page.tsx`: server component async con `searchParams`; usa `getCotizacion`. La ruta pasa a dinámica (ƒ) por leer los parámetros de búsqueda.

## Notas de alcance

- No se guarda un vínculo cotización→cuenta ni se marca la cotización como "facturada" (queda como idea de backlog de trazabilidad en el roadmap). La conversión es una precarga, no un enlace persistente.

## Errores previsibles

| Situación | Comportamiento esperado |
| --- | --- |
| `?cotizacion=` con id inválido o inexistente | Formulario vacío, sin error |
| Cotización con abono 0 | El formulario inicia con abono "ninguno" |
| Datos precargados que no cumplen validación | El formulario revalida en submit como siempre; la precarga no se confía |
