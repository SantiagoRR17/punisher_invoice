# 003 · Formulario Cotización — Tareas

_Checklist accionable derivada del `plan.md`. Tareas pequeñas y concretas; marca `[x]` al completarlas._

- [x] Crear `models/Cotizacion.ts` y `services/cotizacionService.ts`.
- [x] Crear el route handler `POST /api/cotizaciones` para persistir en MongoDB.
- [x] Definir el formulario de datos del cliente y la tabla de ítems (agregar/eliminar filas).
- [x] Implementar el cálculo automático de subtotales y total general.
- [x] Agregar validaciones para campos numéricos y obligatorios, con mensajes de error.
- [x] Instalar y configurar `@react-pdf/renderer` (con carga diferida para no penalizar el peso inicial de la página).
- [x] Construir el componente de PDF replicando el header/footer/tabla del template (con placeholders de marca).
- [x] Conectar el botón "Descargar PDF" (guardar en Mongo + generar + descargar en un clic).
- [x] Validar responsive y comportamiento en diferentes tamaños.
- [x] Escribir pruebas de cálculo, validación y guardado (Mongo Memory Server).
- [x] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md` (pendiente de confirmación del usuario).

## Mantenimiento (checklist recurrente)

_Opcional. Pasos a repetir cada vez que se toque esta feature en el futuro (revisar datos, regenerar algo, etc.). Borra esta sección si no aplica._

- [ ] Revisar campos o fórmulas si cambia el formato de cotización.
- [ ] Reemplazar los placeholders de logo/firma/ícono por los archivos reales cuando el usuario los proporcione.
