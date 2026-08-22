# Errores y correcciones — Cotizaciones legacy (edición y búsqueda)

Fecha: 2026-08-22

Corrección transversal sobre las features 010 (tipo de documento), 011 (consecutivo/abono) y
012 (historial de cotizaciones). Reportado por el usuario tras poner en producción cambios
recientes.

## Causa raíz común

Existen **cotizaciones antiguas (legacy)** guardadas en Mongo antes de las features 010 y 011.
Esos documentos tienen el objeto `cliente` incompleto (sin `tipoDocumento`, y en algunos casos
sin `nombre`/`tratamiento`) y pueden no tener `consecutivo` ni `abono`. El código nuevo asume que
esos campos siempre existen, lo que produjo tres síntomas distintos.

## Errores identificados

### 1. Búsqueda en el historial lanza "application error: a client-side exception has occurred"

- **Síntoma:** al escribir en el buscador del historial, la página se cae con una excepción de
  cliente.
- **Causa:** en `components/HistorialCotizacionesList.tsx` el filtro hacía
  `cotizacion.consecutivo.toLowerCase()` y `cotizacion.cliente.nombre.toLowerCase()`. Si una
  cotización legacy no tiene `consecutivo` o `cliente.nombre`, `.toLowerCase()` lanza
  `TypeError: Cannot read properties of undefined`, que no está capturado y tumba el árbol de
  React. Solo ocurre al escribir texto (con el buscador vacío hay short-circuit).
- **Solución:** normalizar `consecutivo` y `cliente` al leer desde Mongo (ver corrección central)
  y blindar el filtro con `(valor ?? "").toLowerCase()`. Se aplicó el mismo blindaje en
  `components/HistorialList.tsx` (cuentas de cobro) por ser el mismo patrón.

### 2. "No se pudo actualizar la cotización. Intenta de nuevo."

- **Síntoma:** al editar ciertas cotizaciones y guardar, aparece este mensaje.
- **Causa:** cotización creada antes de la feature 010, sin `cliente.tipoDocumento`. Al cargar el
  formulario, el `<select>` de tipo de documento recibe `value={undefined}`: muestra "Cédula"
  pero el estado queda `undefined`. El `PUT /api/cotizaciones/[id]` valida
  `tipoDocumento === "CC" | "NIT"` y responde **400**, que el formulario traduce a ese mensaje.
- **Solución:** normalizar `cliente.tipoDocumento` (por defecto `"CC"`) y `tratamiento` (por
  defecto `"Señora"`) en `getCotizacion`, de modo que el formulario de edición reciba siempre un
  cliente completo y el PUT pase la validación.

### 3. El botón de guardar no ejecuta nada y no muestra errores

- **Síntoma:** en otra cotización, al presionar el botón no pasa nada ni aparecen errores.
- **Causa:** cotización legacy con `cliente.nombre` ausente. En `components/CotizacionForm.tsx`,
  `validate()` ejecuta `cliente.nombre.trim()` **fuera** del `try/catch` de `handleSubmit`. Con
  `nombre` indefinido, `.trim()` lanza `TypeError` y el manejador del `onClick` muere en silencio
  (no se setea estado de error ni se envía nada).
- **Solución:** al normalizar `cliente.nombre` a `""` en `getCotizacion`, `validate()` ya no lanza;
  en su lugar muestra el mensaje correcto ("El nombre del cliente es obligatorio"), y el usuario
  puede completar el dato y guardar.

## Corrección central

En `services/cotizacionService.ts` se agregó `normalizeCliente()`, que rellena con valores por
defecto los campos de cliente ausentes conservando los existentes. Se aplica en `listCotizaciones`
y `getCotizacion`, junto con `consecutivo ?? ""` y el ya existente `abono ?? 0`. Esto ataca la
causa raíz en un solo punto y beneficia a todos los consumidores (historial, formulario de edición
y generación de PDF).

## Verificación

- `npx tsc --noEmit` sin errores.
- `tests/services/cotizacionService.test.ts`: 11 pruebas (2 nuevas de regresión que insertan un
  documento legacy incompleto y verifican la normalización en `listCotizaciones` y `getCotizacion`).
- `tests/api/cotizaciones.route.test.ts`, `tests/api/cotizacionesId.route.test.ts`,
  `tests/components/HistorialList.test.tsx`, `tests/components/CotizacionForm.test.tsx`: en verde.

## Archivos modificados

- `services/cotizacionService.ts` — helper `normalizeCliente` + normalización en lectura.
- `components/HistorialCotizacionesList.tsx` — filtro de búsqueda blindado.
- `components/HistorialList.tsx` — filtro de búsqueda blindado (mismo patrón).
- `tests/services/cotizacionService.test.ts` — pruebas de regresión.
