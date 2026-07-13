# 005 · Historial de cuentas de cobro — Tareas

_Checklist accionable derivada del `plan.md`. Tareas pequeñas y concretas; marca `[x]` al completarlas._

- [x] Agregar `GET /api/cuentas-cobro` (listado) al route handler existente.
- [x] Agregar `listCuentasCobro()` y `registrarAbono()` a `services/cuentaCobroService.ts`.
- [x] Crear `app/api/cuentas-cobro/[consecutivo]/route.ts` con `PATCH` para registrar abonos.
- [x] Definir la vista de historial (`app/historial/page.tsx`) y su tabla principal (`components/HistorialList.tsx`).
- [x] Implementar búsqueda por consecutivo/nombre y filtro de estado (todas/pendientes/pagadas).
- [x] Agregar detalle expandible por fila (ítems y abonos).
- [x] Agregar el botón de descargar PDF por fila, reutilizando `CuentaCobroPdf.tsx`.
- [x] Agregar el formulario de abono y el atajo "Marcar como pagada" en cuentas con saldo pendiente.
- [x] Agregar el tercer acceso "Historial" en `app/menu/page.tsx`.
- [x] Validar responsive y consistencia visual con el resto del sistema.
- [x] Escribir pruebas de listado, registro de abono (incluida la validación del saldo) y de la vista.
- [x] Validar contra los criterios de aceptación de `spec.md`.
- [x] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.

## Mantenimiento (checklist recurrente)

_Opcional. Pasos a repetir cada vez que se toque esta feature en el futuro (revisar datos, regenerar algo, etc.). Borra esta sección si no aplica._

- [ ] Revisar filtros y campos visibles si aumenta el volumen de cuentas.
