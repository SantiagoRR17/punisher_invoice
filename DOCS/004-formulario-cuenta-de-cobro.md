# Formulario Cuenta de cobro

Documentación funcional y técnica del formulario de cuenta de cobro. Ver también `specs/features/004-formulario-cuenta-de-cobro/`.

## Comportamiento

- Ruta protegida: `/cuenta-cobro` (requiere sesión válida, igual que el resto de la app).
- `components/CuentaCobroForm.tsx`: formulario con datos del cliente (tratamiento, nombre, cédula, dirección, barrio), una tabla de ítems (descripción, cantidad, valor unitario) con filas que se pueden agregar y eliminar, y una selección de **abono inicial**: ninguno, 50% del total, 60% del total, o un valor manual.
- El total, el abono y el saldo pendiente se calculan y muestran en vivo mientras se escribe.
- Al hacer clic en "Descargar PDF":
  1. Se valida el formulario (cliente completo, al menos un ítem válido, abono manual > 0 si se eligió esa opción, abono no mayor al total).
  2. Se envía `POST /api/cuentas-cobro`, que valida de nuevo en el servidor, calcula el total, asigna el consecutivo y guarda el documento en la colección `cuentasCobro` de MongoDB.
  3. Se generan y descargan el PDF con `@react-pdf/renderer` (carga diferida) usando `components/pdf/CuentaCobroPdf.tsx`.

## Consecutivo

Formato `CC-{año}-{secuencial}` (ej. `CC-2026-0001`). `services/consecutivoService.ts` asigna el número usando un contador atómico en MongoDB (colección `counters`, un documento por año, `findOneAndUpdate` con `$inc`), lo que evita duplicados aunque se creen varias cuentas al mismo tiempo. El secuencial reinicia en `0001` al empezar un año nuevo (documento distinto por año en `counters`).

## Abonos y saldo

- En esta feature solo se registra **un abono inicial** al crear la cuenta (50%, 60%, manual o ninguno). El saldo es `total - abono`.
- El modelo (`models/CuentaCobro.ts`) guarda los abonos como una **lista** (`abonos: AbonoCuentaCobro[]`), no como un valor único, para que la feature `005-historial-cuentas-de-cobro` pueda agregar abonos posteriores o marcar la cuenta como pagada sin rediseñar los datos. Esa acción de actualización queda explícitamente fuera de esta feature (no hay pantalla para localizar una cuenta ya creada).

## PDF compartido con la cotización

`components/pdf/pdfWave.ts` y `components/pdf/PdfBrand.tsx` se extrajeron de la feature 003 para reutilizar el encabezado/pie con el efecto de olas, los datos fijos de la empresa y el formato de fecha entre `CotizacionPdf.tsx` y `CuentaCobroPdf.tsx`, sin duplicar esa lógica. `CuentaCobroPdf.tsx` agrega: título "CUENTA DE COBRO", número de cuenta y fecha, tabla sin columna de ítem (según el template), filas de TOTAL / ABONO (si aplica) / SALDO PENDIENTE (resaltada en amarillo), y la sección "FORMA DE PAGO" (datos bancarios fijos) en vez de las notas de la cotización.

## Errores previsibles

| Situación | Comportamiento esperado |
| --- | --- |
| Faltan datos del cliente o de algún ítem | Lista de errores clara junto al formulario; no se guarda ni se descarga nada |
| Abono manual ≤ 0 o no numérico (con "Valor manual" seleccionado) | Error específico; no se guarda ni se descarga nada |
| Abono mayor al total | Error específico ("El abono no puede ser mayor al total de la cuenta.") |
| Falla el guardado en MongoDB | Mensaje de error genérico; no se genera el PDF |
| Acceso a `/cuenta-cobro` sin sesión iniciada | Redirección a `/login?callbackUrl=...` |

## Pruebas

- `tests/services/consecutivoService.test.ts` — secuencial creciente dentro de un año, reinicio en un año distinto, formato `CC-{año}-{secuencial}`.
- `tests/services/cuentaCobroService.test.ts` — cálculo de total/saldo con y sin abono, consecutivos distintos entre cuentas sucesivas (Mongo Memory Server).
- `tests/components/CuentaCobroForm.test.tsx` — render, cálculo en vivo de abono/saldo, mostrar/ocultar el campo de valor manual, validación de errores, flujo completo de guardado + descarga.
- `tests/e2e/cuenta-cobro.spec.ts` — smoke test de protección de ruta (`/cuenta-cobro` sin sesión redirige a `/login`).
- QA manual en navegador contra MongoDB Atlas real: formulario completo con abono del 50%, cálculo en vivo del saldo, descarga del PDF (consecutivo `CC-2026-0001` verificado) y revisión visual del documento, en viewports de escritorio (1280×800) y móvil (375×667), sin errores de consola.
