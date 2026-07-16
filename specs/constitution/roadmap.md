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
7. **007 · Rediseño de encabezado, tabla y pie de PDF (v2)** — Encabezado de dos paneles con onda, tabla con filas intercaladas, bloque de firma con mensaje y nombre del titular, recuadros de servicios y espacio para QR de pagos, siguiendo `template_model2.jpeg`.

## Siguiente 🔜

_Lo próximo a abordar. Idealmente una sola feature "en curso" a la vez._

1. **008 · Cambio de contraseña de usuario** — Habilitar una opción para que un usuario autenticado cambie su propia contraseña.

## Backlog / ideas 💡

_Sin comprometer ni ordenar del todo. Ideas que respetan la constitución._

- Control de permisos por rol entre dueño y contadora.
- Auditoría de cambios sobre cuentas de cobro.

> Cada feature nueva se crea como `features/NNN-nombre-feature/` con `spec.md`, `plan.md` y `tasks.md` antes de tocar código.
