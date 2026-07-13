# Historial de cuentas de cobro

Documentación funcional y técnica del historial de cuentas de cobro. Ver también `specs/features/005-historial-de-cuentas-de-cobro/`.

## Comportamiento

- Ruta protegida: `/historial` (requiere sesión válida, igual que el resto de la app). Se llega desde el tercer acceso "Historial" agregado en `app/menu/page.tsx`.
- `components/HistorialList.tsx`: al montarse, hace `GET /api/cuentas-cobro` y muestra una tabla con consecutivo, cliente, fecha, total, saldo y estado (Pendiente/Pagada, según si el saldo es mayor o igual a cero).
- Búsqueda por texto (consecutivo o nombre del cliente) y filtro de estado (todas/pendientes/pagadas), ambos aplicados en el cliente sobre la lista ya cargada.
- Cada fila se puede expandir ("Ver detalle") para mostrar la tabla de ítems y la lista de abonos ya registrados.
- "Descargar PDF" regenera el documento con `components/pdf/CuentaCobroPdf.tsx` (carga diferida) a partir de los datos guardados, incluidos los abonos ya registrados.
- Sobre una cuenta con saldo pendiente > 0 aparece un formulario de abono (valor libre, validado en cliente y servidor contra el saldo actual) y un botón "Marcar como pagada" que registra automáticamente un abono igual al saldo restante.
- Una cuenta con saldo en cero no muestra el formulario de abono.

## Registrar abono (`PATCH /api/cuentas-cobro/[consecutivo]`)

- `services/cuentaCobroService.ts` agrega `listCuentasCobro()` (todas las cuentas, ordenadas por `createdAt` descendente) y `registrarAbono(consecutivo, valor)`.
- `registrarAbono` relee la cuenta desde MongoDB y valida el abono contra el **saldo guardado en el servidor**, no contra el que envíe el cliente, para evitar que una respuesta obsoleta en el navegador permita sobrepasar el saldo real.
- Si el consecutivo no existe: `CuentaCobroNoEncontradaError` (404). Si el abono es ≤ 0 o mayor al saldo: `SaldoInsuficienteError` (400).
- El abono se agrega a la lista `abonos` (modelada como tal desde la feature 004) y el campo `saldo` se recalcula y persiste.

## Errores previsibles

| Situación | Comportamiento esperado |
| --- | --- |
| Abono manual ≤ 0 o no numérico | Error específico en la fila, sin llamar a la API |
| Abono mayor al saldo pendiente | Error específico ("El abono no puede ser mayor al saldo pendiente."), validado en cliente y de nuevo en el servidor |
| Cuenta ya pagada (saldo 0) | No se muestra el formulario de abono ni "Marcar como pagada" |
| Falla la carga del listado | Mensaje de error genérico en la pantalla |
| Acceso a `/historial` sin sesión iniciada | Redirección a `/login?callbackUrl=...` |

## Pruebas

- `tests/services/cuentaCobroService.test.ts` (ampliado) — `listCuentasCobro` ordena por fecha de creación; `registrarAbono` suma abonos y descuenta el saldo, rechaza abonos mayores al saldo y consecutivos inexistentes (Mongo Memory Server).
- `tests/components/HistorialList.test.tsx` — carga y muestra el listado, filtro de búsqueda, filtro de estado, detalle expandible, registrar abono actualiza el saldo mostrado, rechazo de abono mayor al saldo.
- `tests/components/MenuPage.test.tsx` (ampliado) — confirma el tercer acceso "Historial".
- `tests/e2e/historial.spec.ts` — smoke test de protección de ruta (`/historial` sin sesión redirige a `/login`).
- QA manual en navegador contra MongoDB Atlas real: creación de una cuenta nueva, verificación en el historial (junto a cuentas reales ya existentes del usuario), búsqueda, filtro por estado, detalle expandido, registro de un abono parcial y "Marcar como pagada", en viewports de escritorio (1280×800) y móvil (375×667), sin errores de consola.
