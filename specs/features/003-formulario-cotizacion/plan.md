# 003 · Formulario Cotización — Plan

_Cómo se implementa lo descrito en `spec.md`. Debe respetar la `constitution/`._

## Enfoque

La cotización se implementará como un formulario controlado (cliente + tabla dinámica de ítems) con cálculos en cliente para retroalimentación inmediata. Al descargar, la cotización se persiste en MongoDB y se genera un PDF real con un botón, sin diálogo de impresión.

## Implementación

1. Crear `models/Cotizacion.ts` (cliente, ítems, fecha, total) y `services/cotizacionService.ts` (guardar en la colección `cotizaciones`).
2. Crear el route handler `POST /api/cotizaciones` para persistir la cotización.
3. Reemplazar el stub `app/cotizacion/page.tsx` con el formulario real: datos del cliente + tabla de ítems editable (agregar/eliminar filas) y cálculos en vivo.
4. Agregar validaciones de campos obligatorios y numéricos, con mensajes de error.
5. Construir el componente de PDF (`components/pdf/CotizacionPdf.tsx`) con `@react-pdf/renderer`, reproduciendo el header/footer/tabla del template con placeholders de logo/firma/ícono.
6. Conectar el botón "Descargar PDF": valida el formulario, guarda la cotización (paso 2) y genera/descarga el PDF (paso 5) en un solo clic.
7. Validar el comportamiento responsive de la pantalla de captura.
8. Escribir pruebas de cálculo, validación y guardado (Mongo Memory Server).

## Decisiones

- **`@react-pdf/renderer` para la exportación** — genera un PDF real descargable con un botón, sin depender de Puppeteer/Chromium (más simple y liviano de desplegar en Vercel, sin binarios pesados ni problemas de tamaño en funciones serverless). A cambio, el diseño del PDF se reconstruye con los componentes propios de la librería (`View`/`Text`/`Image`) en vez de reutilizar el CSS de la pantalla: se aproxima el diseño del template lo más posible, pero no es una captura pixel-perfect del HTML. Nueva dependencia a agregar: `@react-pdf/renderer`.
- **Persistencia en MongoDB** — cada cotización generada se guarda en la colección `cotizaciones`, aunque esta feature no expone un historial/listado (queda para una decisión futura).
- **Placeholders de marca** — logo, firma e ícono de soldador se representan con placeholders simples (texto o formas genéricas) hasta que el usuario entregue los archivos reales; se documenta en `DOCS/` para reemplazo posterior.
- **Datos de empresa y notas fijos** — dirección, teléfono, correo y las notas del pie se hardcodean como constantes, iguales en todas las cotizaciones.
- **Cálculo inmediato en pantalla** — el usuario ve el total actualizado sin esperar una acción posterior.
- **Campos controlados** — se reduce el riesgo de errores numéricos o filas incompletas.

## Riesgos

- **Fidelidad visual del PDF frente al template** — mitigar dedicando un componente específico (`CotizacionPdf.tsx`) y revisándolo visualmente antes de cerrar la feature.
- **Cambiar de librería de PDF más adelante** si `@react-pdf/renderer` no alcanza la fidelidad esperada — mitigar aislando la lógica de generación en `components/pdf/`, fácil de reemplazar sin tocar el formulario.
- **Placeholders de marca quedando en producción** — mitigar dejándolo explícito en `spec.md` y en `DOCS/` como pendiente.
- **Errores en los totales por valores inválidos** — mitigar con validación numérica estricta.
- **Exceso de complejidad en la tabla dinámica** — mitigar limitando la experiencia a operaciones simples de agregar, editar y eliminar filas.
