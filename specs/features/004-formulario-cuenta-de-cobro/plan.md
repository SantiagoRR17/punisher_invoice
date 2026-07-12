# 004 · Formulario Cuenta de cobro — Plan

_Cómo se implementa lo descrito en `spec.md`. Debe respetar la `constitution/`._

## Enfoque

La cuenta de cobro se implementará como un formulario transaccional con consecutivo controlado, cálculos automáticos de saldo y una salida imprimible. La lógica de negocio debe separar la creación inicial de la actualización posterior para reflejar pagos parciales o cierre de saldo.

## Implementación

1. Crear la pantalla y el modelo de captura para cuenta de cobro en `app/`, `components/` o la capa equivalente.
2. Incorporar la asignación de consecutivo único y la persistencia de estado en `services/` o `app/api/`.
3. Construir los cálculos de total, abono y saldo pendiente.
4. Agregar la opción de actualizar el saldo cuando se complete el pago.
5. Implementar la exportación a PDF o la vista optimizada para impresión.
6. Añadir pruebas de cálculo, validación y control del consecutivo.

## Decisiones

- **Consecutivo controlado centralmente** — evita duplicados y facilita la auditoría.
- **Abono fijo o manual** — cubre el flujo rápido del negocio y también casos excepcionales.
- **Actualización de saldo separada** — permite registrar pagos posteriores sin rehacer toda la cuenta.

## Riesgos

- **Duplicidad de consecutivos** — mitigar con una fuente única de asignación y validación previa.
- **Errores al recalcular saldo** — mitigar con pruebas de cálculo y validación de entradas.
- **Confusión entre creación y actualización** — mitigar con mensajes claros y acciones diferenciadas.
