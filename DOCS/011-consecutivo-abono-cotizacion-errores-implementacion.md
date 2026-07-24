# 011 · Errores de implementación

Registro de errores encontrados y resueltos durante la implementación de la feature 011.

## 1. Cambio de firma de `saveCotizacion` rompe su test y el contrato del API

- **Causa:** `saveCotizacion` pasó de recibir un `Cotizacion` casi completo (`{cliente, items, fecha, total}`) a recibir `NuevaCotizacionInput {cliente, items, abono}` y devolver `CotizacionGuardada` en vez de un `id`. El test `tests/services/cotizacionService.test.ts` construía el objeto viejo, y el POST del API devolvía `{ id, total }`.
- **Solución:** se reescribió el test del servicio para la nueva firma (verifica consecutivo `COT-…`, total, abono, saldo y consecutivos crecientes) y el POST ahora devuelve el objeto guardado. Se ajustó el mock de `tests/components/CotizacionForm.test.tsx` para devolver `{ consecutivo, total, abono, saldo, fecha }` y el texto de éxito esperado (ahora incluye el consecutivo).

## 2. Cuerpos de POST sin `abono` habrían fallado la validación

- **Causa:** al añadir `isValidAbono` (requerido), los tests de ruta que enviaban cuerpos válidos sin `abono` habrían recibido 400.
- **Solución:** se agregó `abono` a los cuerpos válidos de `tests/api/cotizaciones.route.test.ts` y se añadieron casos nuevos: abono válido con cálculo de saldo, y abono mayor al total (400).

## 3. `CotizacionGuardada` no expone `numero`

- **Causa:** un primer borrador del test de consecutivos crecientes comparaba `guardada.numero`, que no está en el tipo de retorno (`{ consecutivo, total, abono, saldo, fecha }`).
- **Solución:** el test compara el sufijo numérico del `consecutivo` (`COT-2026-000X`) en vez de un campo `numero` inexistente. `tsc --noEmit` quedó limpio.

## Nota sobre validación visual del PDF

Los tests de formulario mockean `@react-pdf/renderer`, así que no ejercitan el layout real del PDF. Las filas ABONO/SALDO y la meta del consecutivo reutilizan estilos ya validados en `CuentaCobroPdf`. La validación visual (incluyendo responsive 1280×800 / 375×667) queda pendiente de revisión manual del usuario en el navegador.
