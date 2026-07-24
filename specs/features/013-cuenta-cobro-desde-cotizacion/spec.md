# **013 · Generar cuenta de cobro a partir de una cotización**

**Estado:** Hecho ✅

## Qué hace

Desde el historial de cotizaciones, el usuario puede pulsar "Generar cuenta de cobro" sobre una cotización y llegar al formulario de cuenta de cobro con los datos del cliente, los ítems y el abono **ya precargados**. Solo revisa/ajusta y genera la cuenta, que recibe su propio consecutivo `CC-{año}-####`.

## Por qué

Hoy cotización y cuenta de cobro son flujos independientes: si una cotización se aprueba, hay que reescribir todo a mano en la cuenta de cobro. Este puente elimina esa doble digitación y reduce errores.

## Flujo

- En `HistorialCotizacionesList`, botón "Generar cuenta de cobro" navega a `/cuenta-cobro?cotizacion={id}`.
- `app/cuenta-cobro/page.tsx` (server) detecta el parámetro, carga la cotización con `getCotizacion` y pasa los datos como `initial` al formulario.
- `CuentaCobroForm` precarga cliente, ítems y abono. El abono se recompone como valor manual (solo se conoce el monto). El usuario puede cambiar cualquier cosa antes de generar.
- La cuenta se crea con el flujo normal (POST, consecutivo propio). **No** se modifica ni se marca la cotización de origen.

## Criterios de aceptación

- [x] el historial de cotizaciones tiene un botón "Generar cuenta de cobro" por cotización
- [x] el botón lleva al formulario de cuenta de cobro con cliente, ítems y abono precargados
- [x] la cuenta generada recibe su propio consecutivo `CC-{año}-####` (independiente del de la cotización)
- [x] entrar a `/cuenta-cobro` sin el parámetro funciona igual que antes (formulario vacío)
- [x] un parámetro `cotizacion` inválido o inexistente no rompe la página (formulario vacío)
- [x] conserva la información visible en español
- [ ] funciona de forma responsive en escritorio y dispositivos móviles (1280×800 y 375×667) — pendiente validación visual manual del usuario

## Fuera de alcance

- No marca la cotización como "facturada" ni guarda un vínculo cotización→cuenta (posible backlog de trazabilidad).
- No copia el consecutivo de la cotización a la cuenta.
- No genera la cuenta automáticamente: el usuario confirma y ajusta antes de guardar.
