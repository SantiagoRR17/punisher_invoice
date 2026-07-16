# **007 · Rediseño de encabezado, tabla y pie de PDF (v2)**

**Estado:** Hecho ✅

## Qué hace

Rediseña la presentación de los PDF de cotización y cuenta de cobro siguiendo `template_model2.jpeg`: nueva estructura de encabezado (panel oscuro + panel claro divididos por una onda metálica), tabla de ítems con colores intercalados por fila, bloque de firma con mensaje de agradecimiento y nombre del titular, recuadros de servicios en el pie, y un espacio reservado para el QR de pagos.

Reemplaza visualmente partes de la feature `006-mejoras-visuales-pdf` (la ola amarilla de una sola onda y el bloque de firma simple quedan obsoletos ante este nuevo diseño), aunque reutiliza su infraestructura (firma vía MongoDB, endpoint de `brand-assets`, iconos SVG).

**Ajuste posterior** (mismo día, tras revisión del usuario): se quitó el NIT del encabezado (no aplicaba), se agrandó el logo y la firma, y los recuadros de servicios se movieron para quedar pegados al pie oscuro en vez de justo debajo del contenido. Ver detalle en cada sección.

**Ajuste posterior 2** (sesión siguiente, tras revisión del usuario): se descartó la paleta azul/plateado del primer rediseño y se volvió a la paleta original amarillo/oscuro; el divisor de paneles pasó de onda vertical a diagonal recta; el panel izquierdo (ahora más ancho) agrupa logo + nombre + tagline, y el panel derecho queda solo con los datos de contacto; la fecha volvió al encabezado (bajo la dirección) pero **solo en cotización**; se restauró la ola amarilla de una sola onda en el borde inferior del encabezado; la fila destacada de la tabla (TOTAL/SALDO PENDIENTE) volvió al patrón de dos tonos (etiqueta oscura + valor amarillo); y "FORMA DE PAGO" en cuenta de cobro ganó íconos por medio de pago. Ver detalle en cada sección y en `tasks.md`.

## Por qué

El cliente proporcionó una plantilla de referencia más elaborada (`template_model2.jpeg`) y quiere que el documento final se vea más profesional y cercano a su identidad de marca real, incluyendo datos de pago (QR) y comunicación de cierre (agradecimiento + firma con nombre del titular).

## Alcance

### 1. Encabezado

> Estado tras el "Ajuste posterior 2" (ver arriba); reemplaza la primera versión de esta sección.

- Estructura de dos paneles lado a lado, altura completa del encabezado, divididos por un **corte diagonal recto** (no una onda) con un trazo claro fino encima a modo de filo metálico:
  - **Panel izquierdo** (~48% del ancho), fondo claro/metálico (`COLORS.metal`, `#e8e9ea`, similar al blanco del cuerpo): logo (agrandado a 108×108) junto con el nombre "EL TALLER DEL SOLDADOR" y la tagline en dos tonos ("SOLUCIONES METÁLICAS" / "CON CALIDAD, FUERZA Y COMPROMISO"), en texto oscuro (legible sobre fondo claro).
  - **Panel derecho** (~52%), fondo oscuro (`COLORS.dark`, `#1b2a31`): solo datos de contacto, cada uno con su ícono en blanco — teléfono, correo, dirección y, **solo en el PDF de cotización**, la fecha justo debajo de la dirección. (El NIT se agregó y luego se quitó a pedido del usuario — no aplica a este negocio.)
  - **Ola amarilla:** se restauró la ola de una sola onda (recuperada de la feature 006) en el borde inferior del encabezado, atravesando ambos paneles a todo el ancho, con una máscara blanca debajo para que el encabezado corte limpio a esa altura sin dejar sobrante de color de panel.
  - Paleta sin azul ni plateado oscuro: se descartaron `#00293b`/`#023145`/`#04445d`/`#cdcdcf` del primer intento de rediseño; se usa la paleta original (`COLORS.dark`, `COLORS.yellow`, `COLORS.accent`).
- La fecha, al salir del bloque de título en cotización, se agrega en el encabezado (bajo la dirección) **solo para ese documento**; cuenta de cobro conserva su propia fila `FECHA` junto a `N° CUENTA`, al lado del título (no la tiene en el encabezado, para no duplicarla).
- No se dispone todavía del logo hexagonal aislado ni de la foto del soldador que aparecen en `template_model2.jpeg`: el panel izquierdo reutiliza `logo.png` (el logo actual, con el texto ya incluido en la imagen) y queda sin foto de fondo. Se ajustará cuando el usuario entregue esos archivos.
- Aplica igual en cotización y en cuenta de cobro (comparten `PdfHeader`); la prop `fecha` de `PdfHeader` es opcional y solo la pasa `CotizacionPdf`.

### 2. Tabla de ítems

> Estado tras el "Ajuste posterior 2": la fila destacada volvió al patrón de dos tonos original (etiqueta oscura + valor amarillo), en vez de un solo color uniforme.

- Fila de encabezado de la tabla: fondo `COLORS.dark` (el tono más oscuro, sin la constante azul `#023145` del primer intento).
- Filas de datos: colores intercalados fila por fila, `#FEFEFE` (blanco) y `#EDEEF0` (gris muy claro), alternando en ese orden empezando por la primera fila de datos.
- Fila(s) de cierre (TOTAL, ABONO en cuenta de cobro): continúan el patrón intercalado de la tabla (no destacadas), según el template.
- Fila de SALDO PENDIENTE (cuenta de cobro): destacada en dos tonos — fondo `COLORS.dark` y texto blanco para la etiqueta, celda de valor con fondo `COLORS.yellow` y texto `COLORS.dark`.
- Fila de TOTAL en cotización (no tiene saldo pendiente): mismo patrón de dos tonos que SALDO PENDIENTE, para conservar el peso visual de "cifra final".
- Aplica igual en cotización y en cuenta de cobro (comparten los estilos de tabla).

### 3. Bloque de firma

- Orden, de arriba hacia abajo: mensaje "Agradecemos su confianza. ¡Estamos para construir juntos!" (primera línea regular, segunda línea en negrita) → imagen de la firma → línea horizontal → "EL TALLER DEL SOLDADOR" (negrita) → "ERICK JULIAN DUEÑAS FORERO" (regular, nombre del titular).
- Imagen de firma agrandada: 240×120 en cotización, 190×95 en cuenta de cobro (más angosta ahí por compartir fila con "FORMA DE PAGO" y el placeholder de QR). Antes 160×40 en ambos.
- Aplica igual en cotización y en cuenta de cobro.

### 4. Recuadros de servicios (pie)

- 4 recuadros con ícono + texto, antes del pie oscuro: "FABRICACIÓN A MEDIDA", "INSTALACIÓN PROFESIONAL", "MANTENIMIENTO INDUSTRIAL", "ESTRUCTURAS METÁLICAS" (texto e íconos tomados del template).
- Los recuadros quedan pegados al pie oscuro, empujados hasta el final de la página (antes aparecían justo debajo del contenido, con un salto visible antes del pie).
- El pie oscuro existente (`PdfFooter`) cambia su texto a una tagline distinta: "CALIDAD EN CADA UNIÓN, COMPROMISO EN CADA PROYECTO" (con ícono de escudo), diferenciada de la tagline del encabezado.

### 5. QR de pagos

- Se reserva un recuadro (placeholder) entre "FORMA DE PAGO" y el bloque de firma, del tamaño aproximado del QR en el template, con un rótulo tipo "QR próximamente" mientras no se cargue la imagen real.
- El QR real se sube igual que la firma (colección `brandAssets` en MongoDB, mismo endpoint `GET /api/brand-assets/[nombre]`, nombre `qr`): el QR no es un dato sensible como la firma, pero reutilizar el mismo mecanismo evita duplicar infraestructura para un solo archivo más.
- **Implementado en el "Ajuste posterior 2":** `CuentaCobroPdf` recibe una prop `qrUrl?: string`; si el usuario ya subió el QR (`fetchQrDataUrl()`, mismo patrón que `fetchFirmaDataUrl()`), se muestra la imagen con el rótulo "ESCANEA PARA PAGAR" en vez del placeholder. Si no se ha subido o falla la petición, se sigue viendo el placeholder — no rompe la generación del PDF.
- Esta sección solo aplica a **cuenta de cobro** (es donde vive "FORMA DE PAGO"); cotización no tiene esa sección hoy ni la tendrá en esta feature.

### 6. Forma de pago con íconos (Ajuste posterior 2)

- Cada medio de pago en "FORMA DE PAGO" (cuenta de cobro) lleva una insignia cuadrada oscura con ícono blanco: banco (Davivienda, Bre-B) o billetera (Nequi), inspirados en `template_model2.jpeg`.
- Debajo de la insignia, la etiqueta del medio de pago en negrita y el detalle (cuenta/número) en una línea aparte, en vez de una sola línea de texto plano como antes.
- Solo aplica a cuenta de cobro (mismo alcance que la sección 5).

## Criterios de aceptación

- [x] El encabezado de cotización y cuenta de cobro muestra el panel claro/metálico a la izquierda (con logo + nombre + tagline) y el panel oscuro a la derecha (solo contacto), divididos por un **corte diagonal recto** (no una onda), sin que la diagonal se cruce con ningún ícono de contacto.
- [x] El panel derecho muestra teléfono, correo, dirección y, solo en cotización, la fecha debajo de la dirección (ya no NIT); cada uno con su ícono.
- [x] El logo del panel izquierdo (108×108) y la imagen de firma son visiblemente más grandes que en la primera versión.
- [x] Una sola ola amarilla recorre el borde inferior del encabezado, a todo el ancho, sin dejar sobrante de color de panel debajo.
- [x] La paleta del PDF no usa azul ni plateado oscuro (`#00293b`/`#023145`/`#04445d`/`#cdcdcf`); usa `COLORS.dark`/`COLORS.yellow`/`COLORS.accent`/`COLORS.metal`.
- [x] Los recuadros de servicios quedan pegados al pie oscuro (al final de la página), no justo debajo del contenido.
- [x] En cotización, el texto "De manera atenta..." queda alineado al mismo margen derecho que el título, inmediatamente debajo (sin la fila de fecha entre medio).
- [x] La tabla de ítems alterna `#FEFEFE`/`#EDEEF0` en las filas de datos, con encabezado `COLORS.dark` y la fila destacada (SALDO PENDIENTE en cuenta de cobro, TOTAL en cotización) en dos tonos: etiqueta oscura + valor amarillo.
- [x] El bloque de firma muestra, en orden: mensaje de agradecimiento, imagen de firma, línea, "EL TALLER DEL SOLDADOR" y "ERICK JULIAN DUEÑAS FORERO".
- [x] El pie muestra los 4 recuadros de servicios y la tagline "CALIDAD EN CADA UNIÓN, COMPROMISO EN CADA PROYECTO" en texto/ícono amarillo sobre fondo oscuro.
- [x] La cuenta de cobro muestra el QR real (imagen + "ESCANEA PARA PAGAR") cuando está subido en MongoDB, y el placeholder "pendiente" cuando no; cada medio de pago en "FORMA DE PAGO" muestra su ícono (banco o billetera).
- [x] `npx tsc --noEmit` sin errores, `pnpm run test` (64/64) sigue pasando; verificado visualmente generando ambos PDF con datos de prueba (ver nota de QA en `tasks.md`).

## Fuera de alcance

- No se sube el logo hexagonal aislado ni la foto del soldador en esta iteración (se aproxima el diseño sin ellos, reutilizando `logo.png`).
- No se implementa degradado metálico en el corte del encabezado (color plano por ahora).
- El encabezado no muestra NIT (se probó y se quitó a pedido del usuario).
- No cambian los datos del cliente (sigue siendo nombre + celular obligatorios, sin reintroducir "barrio" — el texto "Barrio barriot" que aparece en `template_model2.jpeg` es un dato de ejemplo del mockup, no un pedido de traer de vuelta ese campo).
- No se tocan cálculos, validaciones de formulario, ni el modelo de datos de cotización/cuenta de cobro.
