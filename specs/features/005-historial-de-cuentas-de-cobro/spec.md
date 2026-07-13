# **005 · Historial de cuentas de cobro**

**Estado:** implementada, pendiente de validación del usuario

## Qué hace

El usuario puede ver el listado histórico de cuentas de cobro generadas (las guardadas por la feature 004), buscar por consecutivo o nombre del cliente, filtrar por estado (todas, pendientes, pagadas), abrir el detalle de un registro (ítems y abonos) y descargar de nuevo su PDF. También puede registrar un abono adicional sobre una cuenta con saldo pendiente, o marcarla como pagada con un atajo de un clic.

## Por qué

Esta pantalla permite consultar el historial del negocio y dar seguimiento a cuentas pendientes sin perder la trazabilidad de cada registro. Completa el ciclo de abonos que quedó pendiente en la feature 004 (que solo permitía un abono inicial al crear la cuenta).

## Registrar abono / marcar como pagada

- Sobre una cuenta con saldo pendiente > 0, se puede ingresar un valor de abono libre; se suma a la lista de abonos ya existente (`models/CuentaCobro.ts` ya la modela como lista desde la feature 004) y se recalcula el saldo. El servidor valida que el abono no supere el saldo pendiente actual.
- Un atajo "Marcar como pagada" registra automáticamente un abono igual al saldo pendiente restante, dejando el saldo en cero, sin que el usuario tenga que calcularlo ni escribirlo.
- Una cuenta con saldo en cero no permite registrar más abonos.

## Acceso desde el menú

El menú principal (feature 002) tenía solo dos accesos ("Cotización" y "Cuenta de cobro"); se agrega un tercer acceso "Historial" para poder llegar a esta pantalla, ya que de otro modo no habría forma de navegar hasta `/historial` desde la interfaz.

## Criterios de aceptación

- [x] muestra un listado de cuentas de cobro con consecutivo, cliente, fecha, total y saldo
- [x] permite buscar por consecutivo o nombre del cliente
- [x] permite filtrar por estado: todas, pendientes, pagadas
- [x] permite abrir un registro para ver su detalle (ítems y abonos registrados)
- [x] permite descargar de nuevo el documento en formato PDF desde el historial
- [x] permite registrar un abono adicional sobre una cuenta con saldo pendiente, validando que no supere el saldo
- [x] permite marcar una cuenta como pagada con un solo clic (deja el saldo en cero)
- [x] no permite registrar abonos sobre una cuenta ya pagada (saldo en cero)
- [x] conserva la información visible en español
- [x] funciona de forma responsive en escritorio y dispositivos móviles (validado en 1280×800 y 375×667)

## Fuera de alcance

- No incluye creación de cuentas nuevas (eso es la feature 004).
- No incluye historial de cotizaciones (la feature de cotización no tiene historial planeado).
- No incluye acceso público sin autenticación.
- No incluye edición masiva de registros.
- No incluye control de permisos por rol entre dueño y contadora (backlog de la constitución).
- No incluye eliminar cuentas ni abonos ya registrados.