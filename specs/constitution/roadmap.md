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

## Siguiente 🔜

_Lo próximo a abordar. Idealmente una sola feature "en curso" a la vez._

- **013 · Generar cuenta de cobro a partir de una cotización** — botón que precarga cliente, ítems y abono en el formulario de cuenta de cobro.

## Backlog / ideas 💡

_Sin comprometer ni ordenar del todo. Ideas que respetan la constitución._

- Control de permisos por rol entre dueño y contadora.
- Auditoría de cambios sobre cuentas de cobro.

> Cada feature nueva se crea como `features/NNN-nombre-feature/` con `spec.md`, `plan.md` y `tasks.md` antes de tocar código.
