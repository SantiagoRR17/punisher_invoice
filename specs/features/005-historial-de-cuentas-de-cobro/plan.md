# 005 · Historial de cuentas de cobro — Plan

_Cómo se implementa lo descrito en `spec.md`. Debe respetar la `constitution/`._

## Enfoque

El historial se implementará como una vista de consulta y seguimiento sobre las cuentas ya creadas por la feature 004, con una tabla filtrable, detalle expandible por fila, descarga de PDF regenerado desde los datos guardados, y la acción de registrar abonos que quedó pendiente de esa feature.

## Implementación

1. Agregar `GET /api/cuentas-cobro` (listado completo, ordenado por fecha de creación descendente) al route handler existente.
2. Agregar `services/cuentaCobroService.ts` → `listCuentasCobro()` y `registrarAbono(consecutivo, valor)` (valida que el abono no supere el saldo actual, recalculado desde los datos guardados en MongoDB, no desde lo que envíe el cliente).
3. Crear `app/api/cuentas-cobro/[consecutivo]/route.ts` con `PATCH` para registrar un abono sobre una cuenta existente.
4. Crear `app/historial/page.tsx` (con el mismo header/footer metalizado del resto de pantallas) y `components/HistorialList.tsx`: tabla con búsqueda por texto (consecutivo o nombre), filtro de estado (todas/pendientes/pagadas), fila expandible con el detalle (ítems y abonos), botón de descarga de PDF (reutilizando `CuentaCobroPdf.tsx`), y un formulario simple de abono + botón "Marcar como pagada" en las cuentas con saldo pendiente.
5. Agregar el tercer acceso "Historial" en `app/menu/page.tsx`, ya que el menú de la feature 002 solo tenía dos accesos y no había forma de llegar a esta pantalla.
6. Escribir pruebas de listado, registro de abono (incluida la validación de no superar el saldo) y de la vista (filtros, expandir detalle, marcar como pagada).

## Decisiones

- **Reutilizar el modelo y el PDF de la feature 004** — `models/CuentaCobro.ts`, `services/cuentaCobroService.ts` y `components/pdf/CuentaCobroPdf.tsx` ya existen; el historial solo agrega lectura (`GET`) y actualización de abonos (`PATCH`), no un modelo nuevo.
- **Saldo recalculado en el servidor** — `registrarAbono` valida contra el saldo guardado en MongoDB, no contra el valor que envíe el cliente, para evitar inconsistencias.
- **"Marcar como pagada" es un caso particular de registrar abono** — internamente registra un abono igual al saldo pendiente actual; no es una acción ni un endpoint distinto.
- **Tercer acceso en el menú** — necesario para que la pantalla sea alcanzable desde la navegación existente.

## Riesgos

- **Listados largos sin filtros** — mitigado con búsqueda por texto y filtro de estado.
- **Abonos que dejen saldo negativo** — mitigar validando en el servidor que el abono no supere el saldo actual.
- **PDF desincronizado con el registro visible** — mitigado regenerando el PDF a partir de los datos guardados (incluidos los abonos ya registrados) en el momento de la descarga, no de una copia en caché.
