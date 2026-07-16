# **007 · Rediseño de encabezado, tabla y pie de PDF (v2)**

**Estado:** Hecho ✅

## Qué hace

Rediseña la presentación de los PDF de cotización y cuenta de cobro siguiendo `template_model2.jpeg`: nueva estructura de encabezado (panel oscuro + panel claro divididos por una onda metálica), tabla de ítems con colores intercalados por fila, bloque de firma con mensaje de agradecimiento y nombre del titular, recuadros de servicios en el pie, y un espacio reservado para el QR de pagos.

Reemplaza visualmente partes de la feature `006-mejoras-visuales-pdf` (la ola amarilla de una sola onda y el bloque de firma simple quedan obsoletos ante este nuevo diseño), aunque reutiliza su infraestructura (firma vía MongoDB, endpoint de `brand-assets`, iconos SVG).

## Por qué

El cliente proporcionó una plantilla de referencia más elaborada (`template_model2.jpeg`) y quiere que el documento final se vea más profesional y cercano a su identidad de marca real, incluyendo datos de pago (QR) y comunicación de cierre (agradecimiento + firma con nombre del titular).

## Alcance

### 1. Encabezado

- Estructura de dos paneles lado a lado, altura completa del encabezado:
  - **Panel izquierdo**, fondo `#00293B`: logo (badge hexagonal "TF"), nombre "EL TALLER DEL SOLDADOR", tagline en dos tonos ("SOLUCIONES METÁLICAS" / "CON CALIDAD, FUERZA Y COMPROMISO").
  - **Panel derecho**, fondo `#CDCDCF` (color plano, sin degradado): 4 líneas de contacto, cada una con un ícono en una insignia oscura y una línea divisoria delgada debajo: teléfono, correo, dirección, **NIT** (nuevo dato, reemplaza a "fecha" en el encabezado; se muestra con un valor de marcador hasta que el usuario confirme el NIT real).
  - **División entre paneles:** el template trae un corte diagonal recto con efecto metálico; se reemplaza por una **onda** de color plano `#CDCDCF` (sin degradado metálico, para una primera versión simple).
- La fecha, al salir del encabezado, se agrega junto al título del documento en **ambos** PDF (cotización y cuenta de cobro) — cuenta de cobro ya lo hace (`N° CUENTA` / `FECHA`); cotización agrega una línea "FECHA" análoga junto a su título.
- No se dispone todavía del logo hexagonal aislado ni de la foto del soldador que aparecen en `template_model2.jpeg`: el panel izquierdo reutiliza `logo.png` (el logo actual, con el texto ya incluido en la imagen) y queda sin foto de fondo. Se ajustará cuando el usuario entregue esos archivos.
- Aplica igual en cotización y en cuenta de cobro (comparten `PdfHeader`).

### 2. Tabla de ítems

- Fila de encabezado de la tabla: fondo `#023145` (el tono más oscuro).
- Filas de datos: colores intercalados fila por fila, `#FEFEFE` (blanco) y `#EDEEF0` (gris muy claro), alternando en ese orden empezando por la primera fila de datos.
- Fila(s) de cierre (TOTAL, ABONO en cuenta de cobro): continúan el patrón intercalado de la tabla (no destacadas), según el template.
- Fila de SALDO PENDIENTE (cuenta de cobro): destacada con `#04445D` (el tono intermedio).
- Fila de TOTAL en cotización (no tiene saldo pendiente): se mantiene destacada con `#04445D`, para conservar el mismo peso visual de "cifra final" que ya tenía.
- Aplica igual en cotización y en cuenta de cobro (comparten los estilos de tabla).

### 3. Bloque de firma

- Orden, de arriba hacia abajo: mensaje "Agradecemos su confianza. ¡Estamos para construir juntos!" (primera línea regular, segunda línea en negrita) → imagen de la firma → línea horizontal → "EL TALLER DEL SOLDADOR" (negrita) → "ERICK JULIAN DUEÑAS FORERO" (regular, nombre del titular).
- Aplica igual en cotización y en cuenta de cobro.

### 4. Recuadros de servicios (pie)

- 4 recuadros con ícono + texto, antes del pie oscuro: "FABRICACIÓN A MEDIDA", "INSTALACIÓN PROFESIONAL", "MANTENIMIENTO INDUSTRIAL", "ESTRUCTURAS METÁLICAS" (texto e íconos tomados del template).
- El pie oscuro existente (`PdfFooter`) cambia su texto a una tagline distinta: "CALIDAD EN CADA UNIÓN, COMPROMISO EN CADA PROYECTO" (con ícono de escudo), diferenciada de la tagline del encabezado.

### 5. Espacio para QR de pagos

- Se reserva un recuadro (placeholder) entre "FORMA DE PAGO" y el bloque de firma, del tamaño aproximado del QR en el template, con un rótulo tipo "QR próximamente" mientras no se cargue la imagen real.
- Cuando el usuario entregue el QR real, se sube igual que la firma (colección `brandAssets` en MongoDB, mismo endpoint `GET /api/brand-assets/[nombre]`): el QR no es un dato sensible como la firma, pero reutilizar el mismo mecanismo evita duplicar infraestructura para un solo archivo más.
- Esta sección solo aplica a **cuenta de cobro** (es donde vive "FORMA DE PAGO"); cotización no tiene esa sección hoy ni la tendrá en esta feature.

## Criterios de aceptación

- [x] El encabezado de cotización y cuenta de cobro muestra el panel oscuro (`#00293B`) a la izquierda y el panel claro (`#CDCDCF`) a la derecha, divididos por una onda (no un corte recto).
- [x] El panel derecho muestra teléfono, correo, dirección y NIT (ya no fecha), cada uno con su ícono.
- [x] La fecha aparece junto al título en ambos documentos.
- [x] La tabla de ítems alterna `#FEFEFE`/`#EDEEF0` en las filas de datos, con encabezado `#023145` y la fila destacada (SALDO PENDIENTE en cuenta de cobro, TOTAL en cotización) en `#04445D`.
- [x] El bloque de firma muestra, en orden: mensaje de agradecimiento, imagen de firma, línea, "EL TALLER DEL SOLDADOR" y "ERICK JULIAN DUEÑAS FORERO".
- [x] El pie muestra los 4 recuadros de servicios y la nueva tagline "CALIDAD EN CADA UNIÓN, COMPROMISO EN CADA PROYECTO".
- [x] La cuenta de cobro reserva un espacio de placeholder para el QR de pagos, visualmente distinguible como "pendiente".
- [x] Las pruebas existentes siguen pasando (64/64) y no se rompe la descarga de PDF en ninguno de los dos documentos.

## Fuera de alcance

- No se sube el logo hexagonal aislado ni la foto del soldador en esta iteración (se aproxima el diseño sin ellos, reutilizando `logo.png`).
- No se implementa degradado metálico en la onda del encabezado (color plano `#CDCDCF` por ahora).
- El NIT se muestra con un valor de marcador hasta que el usuario confirme el número real.
- No se implementa la carga del QR real todavía, solo el placeholder visual y la decisión de dónde se guardará cuando llegue.
- No cambian los datos del cliente (sigue siendo nombre + celular obligatorios, sin reintroducir "barrio" — el texto "Barrio barriot" que aparece en `template_model2.jpeg` es un dato de ejemplo del mockup, no un pedido de traer de vuelta ese campo).
- No se tocan cálculos, validaciones de formulario, ni el modelo de datos de cotización/cuenta de cobro.
