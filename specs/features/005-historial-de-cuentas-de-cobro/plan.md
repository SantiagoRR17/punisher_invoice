# 005 · Historial de cuentas de cobro — Plan

_Cómo se implementa lo descrito en `spec.md`. Debe respetar la `constitution/`._

## Enfoque

El historial se implementará como una vista de consulta y seguimiento sobre las cuentas ya creadas, con acciones para filtrar, revisar detalle, descargar PDF y actualizar el estado de pago cuando corresponda.

## Implementación

1. Crear la vista de historial en `app/` o el módulo equivalente.
2. Construir la tabla o listado con búsqueda y filtros básicos.
3. Agregar acciones para abrir el detalle, descargar PDF y editar el estado de una cuenta.
4. Conectar la vista con la capa de datos existente de cuentas de cobro.
5. Agregar pruebas de listado, filtro y edición de estado.

## Decisiones

- **Historial como punto de seguimiento** — evita duplicar funciones de creación y concentra la consulta.
- **Edición limitada al estado o al abono** — protege la trazabilidad del documento.
- **Descarga desde el listado** — reduce pasos para el usuario que solo necesita recuperar un PDF.

## Riesgos

- **Listados largos sin filtros** — mitigar con búsqueda y criterios de ordenación básicos.
- **Ediciones que alteren el registro histórico** — mitigar limitando qué campos se pueden cambiar.
- **PDF desincronizado con el registro visible** — mitigar regenerando el documento desde la fuente de datos actual.
