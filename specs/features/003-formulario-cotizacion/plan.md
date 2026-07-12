# 003 · Formulario Cotización — Plan

_Cómo se implementa lo descrito en `spec.md`. Debe respetar la `constitution/`._

## Enfoque

La cotización se implementará como un formulario dinámico con filas editables, cálculos en cliente para retroalimentación inmediata y una salida imprimible o exportable a PDF. El comportamiento visual y de validación debe ser compartido con la cuenta de cobro.

## Implementación

1. Crear la pantalla de cotización en `app/` o el componente correspondiente.
2. Construir el formulario del cliente y la tabla de ítems con cálculos automáticos.
3. Agregar validaciones para campos obligatorios y valores numéricos.
4. Implementar la exportación a PDF o la vista optimizada para impresión.
5. Añadir pruebas de cálculo, validación y renderizado responsive.

## Decisiones

- **Cálculo inmediato en pantalla** — el usuario debe ver el impacto de sus datos sin esperar una acción posterior.
- **PDF como salida estándar** — la cotización debe poder compartirse fuera del sistema.
- **Campos controlados** — se reduce el riesgo de errores numéricos o filas incompletas.

## Riesgos

- **Errores en los totales por valores inválidos** — mitigar con validación numérica estricta.
- **Problemas de formato en PDF** — mitigar separando la vista de captura de la vista imprimible.
- **Exceso de complejidad en la tabla dinámica** — mitigar limitando la experiencia a operaciones simples de agregar, editar y eliminar filas.
