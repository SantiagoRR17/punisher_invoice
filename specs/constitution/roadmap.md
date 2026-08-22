# Roadmap

_Orden y estado de las features. Cada entrada apunta a su carpeta en `features/`._

## Hecho ✅

_Features completadas, en orden de implementación._

1. **001 · Login** — Autenticación restringida para permitir el acceso a usuarios autorizados.
2. **002 · Menú principal** — Pantalla principal para acceder a cotización y cuenta de cobro.
3. **003 · Formulario Cotización** — Formulario para generar cotizaciones y exportarlas a PDF.
4. **004 · Formulario Cuenta de cobro** — Formulario para generar cuentas de cobro, controlar consecutivo, abonos y saldo.
5. **005 · Historial de cuentas de cobro** — Consulta del histórico y descarga de documentos generados.
6. **006 · Mejoras visuales de PDF** — Iconos de contacto, logo real, ola única sutil y firma real (servida desde MongoDB, nunca pública en el repo) en los PDF de cotización y cuenta de cobro.
7. **007 · Rediseño de encabezado, tabla y pie de PDF (v2)** — Encabezado de dos paneles con corte diagonal y ola amarilla inferior, tabla con filas intercaladas, bloque de firma con mensaje y nombre del titular, recuadros de servicios y espacio para QR de pagos, siguiendo `template_model2.jpeg`.
8. **008 · Medios de pago y QR en cotización** — Extiende a la cotización el bloque "FORMA DE PAGO" + QR que ya existía en cuenta de cobro, diferencia el mensaje de cierre entre cotización ("Será un gusto...") y cuenta de cobro ("Fue un gusto..."), y corrige el logo desactualizado en el despliegue (archivo local nunca comiteado).
9. **009 · Cambio de contraseña de usuario** — Nueva pantalla `/perfil`, enlazada desde el menú, para que un usuario autenticado cambie su propia contraseña confirmando la actual, con el mismo esquema de límite de intentos que el login.
10. **010 · Tipo de documento (Cédula/NIT)** — Selector de tipo de documento en los formularios de cotización y cuenta de cobro para facturar a personas (CC) o empresas (NIT); el PDF imprime el prefijo correcto y los registros previos se tratan como CC.
11. **011 · Consecutivo `COT-{año}-####` y abono informativo en cotización** — cada cotización recibe un consecutivo propio (contador independiente del de cuentas de cobro) y el mismo selector de abono (ninguno/50/60/manual) que las cuentas de cobro, mostrado como referencia (ABONO/SALDO) en el PDF.
12. **012 · Historial de cotizaciones** — pestañas en `/historial` (Cotizaciones / Cuentas de cobro); la pestaña de cotizaciones permite listar, buscar, ver detalle, re-descargar el PDF y editar una cotización (reutilizando el formulario en `/cotizacion/{id}/editar`) conservando su consecutivo.
13. **013 · Generar cuenta de cobro a partir de una cotización** — botón "Generar cuenta de cobro" en el historial de cotizaciones que abre `/cuenta-cobro?cotizacion={id}` con cliente, ítems y abono precargados; la cuenta se crea con su propio consecutivo `CC-{año}-####` sin modificar la cotización de origen.

## Correcciones / mantenimiento 🔧

_Ajustes transversales que no son una feature nueva. Cada uno documenta sus errores en `DOCS/`._

- **Cotizaciones legacy (edición y búsqueda)** — normaliza en lectura las cotizaciones creadas antes de las features 010/011 (sin `tipoDocumento`, `consecutivo`, `nombre` o `abono`). Corrige: crash del buscador del historial (`toLowerCase` sobre campo indefinido), error "No se pudo actualizar la cotización" (PUT 400 por `tipoDocumento` faltante) y el botón de guardar que no reaccionaba (excepción en `validate()`). Ver `DOCS/014-fix-cotizaciones-legacy-errores-implementacion.md`.

## Siguiente 🔜

_Lo próximo a abordar. Idealmente una sola feature "en curso" a la vez._

_Sin una feature concreta en curso — ver "Backlog / ideas" para las próximas candidatas._

## Backlog / ideas 💡

_Sin comprometer ni ordenar del todo. Ideas que respetan la constitución._

- Control de permisos por rol entre dueño y contadora.
- Auditoría de cambios sobre cuentas de cobro.
- Trazabilidad cotización → cuenta de cobro: marcar una cotización como "facturada" y guardar el vínculo al consecutivo de la cuenta generada (feature 013 dejó la conversión sin vínculo persistente).

> Cada feature nueva se crea como `features/NNN-nombre-feature/` con `spec.md`, `plan.md` y `tasks.md` antes de tocar código.
