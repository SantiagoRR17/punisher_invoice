# Rediseño de PDF v2 — Errores durante la implementación

Bitácora de los problemas encontrados al implementar la feature `007-rediseno-pdf-v2`, con su causa y la solución aplicada.

## 1. `@react-pdf/renderer` partía palabras largas con un guion a mitad de línea

**Qué pasó:** Al hacer QA visual del nuevo layout de 3 columnas en `CuentaCobroPdf.tsx` (forma de pago | QR | firma), el texto "ERICK JULIAN DUEÑAS FORERO" dentro de la línea de Davivienda se renderizó como "ERICK JU-LIAN DUEÑAS FORERO", y "QR de pagos próximamente" (dentro del recuadro placeholder, más angosto) como "QR de pagos próxi-mamente".

**Cómo se generó:** Al reducir el ancho disponible de `formaPago` (de todo el ancho del cuerpo a `maxWidth: 220`, para dejar espacio a las columnas de QR y firma) y del nuevo `qrPlaceholder` (80pt), el motor de layout de `@react-pdf/renderer` activó su hifenación automática por defecto para ajustar palabras largas al ancho disponible, partiéndolas con un guion en un punto que no corresponde a la separación silábica correcta en español.

**Cómo se corrigió:** Se registró `Font.registerHyphenationCallback((word) => [word])` en `PdfBrand.tsx` (se ejecuta una sola vez al importar el módulo, y ambos componentes de PDF lo importan). Esto le dice a la librería que no parta ninguna palabra — el texto solo se ajusta por espacios. Verificado visualmente que ambos textos vuelven a mostrarse completos, sin guion.

## 2. `strokeOpacity` no es un prop soportado por los primitivos SVG de la librería

**Qué pasó:** El primer intento de trazo del filo metálico del divisor de paneles usaba `<Path ... stroke="#ffffff" strokeWidth={1.5} strokeOpacity={0.5} />`. Antes de dejarlo así, se verificó contra el bundle instalado de `@react-pdf/renderer` si `strokeOpacity`/`stroke-opacity` aparecía soportado, y no se encontró ninguna referencia.

**Cómo se generó:** Se asumió que los primitivos SVG soportarían el set completo de props estándar de SVG (incluida opacidad de trazo), sin verificar contra la librería instalada.

**Cómo se corrigió:** Se quitó `strokeOpacity` y en su lugar se usa un color de trazo ya claro (`#f4f4f5`) a opacidad completa, que da un resultado visualmente similar (un filo sutil sobre la onda) sin depender de un prop no soportado.

## 3. Texto multilínea con `textAlign: "right"` y `maxWidth` no quedaba alineado al margen derecho

**Qué pasó:** Al mover la fecha fuera del bloque de título en `CotizacionPdf.tsx`, el párrafo "De manera atenta..." (con `maxWidth: 220` y `textAlign: "right"`, sin más) debía quedar pegado al mismo margen derecho que el título. En el render visual, las líneas envueltas quedaban corridas hacia la izquierda del título en vez de terminar en su mismo borde derecho.

**Cómo se generó:** El contenedor padre (`<View>` sin estilo) es un flex de dirección columna con `alignItems` por defecto (`stretch`). El título, sin ancho fijo, se estira y termina determinando el ancho del contenedor. El párrafo, al tener `maxWidth: 220` menor que ese ancho, no puede estirarse hasta cubrirlo — y cuando un hijo no llega a cubrir el ancho de "stretch", Yoga (el motor de layout de `@react-pdf/renderer`) lo deja pegado al borde de inicio (izquierda) del eje cruzado, no al borde final. El `textAlign: "right"` solo alinea el texto *dentro* de esa caja ya achicada y mal ubicada, así que el efecto visual era "el párrafo parece centrado/corrido", aunque el texto en sí sí estaba alineado a la derecha de su propia caja.

**Cómo se corrigió:** Se agregó `alignSelf: "flex-end"` al estilo `intro` en `CotizacionPdf.tsx`. Esto posiciona la caja (ya angosta por el `maxWidth`) en el borde derecho del contenedor, que es donde también termina el título — con eso, el borde derecho del párrafo coincide con el borde derecho del título en todas las líneas. Verificado generando el PDF con datos de prueba y revisándolo visualmente.

## 4. La ola amarilla del encabezado dejaba un sobrante de color de panel debajo

**Qué pasó:** Al restaurar la ola amarilla original (`buildWaveRibbonPath`) en el borde inferior del nuevo encabezado de dos paneles, quedaba una franja de color de panel (oscuro o plateado según el lado) visible *debajo* de la ola, antes de llegar al blanco del cuerpo — el encabezado "seguía de largo" en vez de cortar limpio a la altura de la ola.

**Cómo se generó:** Los paneles (`buildLeftPanelPath`/`buildRightPanelPath`) se dibujan como un rectángulo que llena **toda** la altura del encabezado (`HEADER_ZONE_HEIGHT`), sin importar dónde se coloque la ola. En el diseño original (feature 006), el "cap" oscuro terminaba justo en la curva de la ola (compartían la misma curva por construcción) y no había nada dibujado más abajo — pero acá los paneles son rectángulos independientes de la posición de la ola, así que cualquier ola colocada antes del final de esa altura dejaba panel visible entre su borde inferior y el final de la zona del encabezado.

**Cómo se corrigió:** Se agregó `buildBelowRibbonMaskPath` en `pdfWave.ts`: una figura blanca que cubre exactamente desde el borde inferior ondulado de la cinta hasta el final de la zona del encabezado, reutilizando la misma curva de onda (mismo `baseline`, `amplitude` y `periods` que el borde inferior de la ola) para que no quede ni un hueco ni una superposición. Se dibuja como último `<Path>` del `<Svg>` del encabezado, encima de los paneles y de la ola. Verificado visualmente: el color del panel ya no asoma debajo de la ola en ningún punto de su recorrido ondulado.

## 5. La diagonal del divisor de paneles pisaba los íconos de teléfono/correo

**Qué pasó:** Al ensanchar el panel izquierdo (de una onda vertical al 35% a una diagonal recta al ~48%, para darle espacio al logo agrandado y al nombre de la empresa) y usar una inclinación (`skew`) pronunciada, el punto más ancho de la diagonal (arriba del todo) quedaba más a la derecha que el borde izquierdo real del `rightPanel` de contenido (un rectángulo plano, no diagonal). Las primeras filas de contacto (teléfono, correo) — que son las que quedan más arriba — aparecían visualmente cruzadas por la diagonal en vez de estar completamente sobre el panel oscuro.

**Cómo se generó:** El fondo de color (la diagonal, dibujada en SVG) y la caja de contenido (`rightPanel`, un `View` de ancho fijo en porcentaje) son dos sistemas de coordenadas independientes: la diagonal varía su posición X según la altura (Y), pero la caja de contenido es un rectángulo plano que arranca siempre en el mismo X. Con un `skew` grande y un `paddingLeft` insuficiente en `rightPanel`, el punto más intruso de la diagonal (arriba) caía dentro del área donde ya se estaba dibujando el primer ícono.

**Cómo se corrigió:** Se redujo el `skew` (`PANEL_DIAGONAL_SKEW`, de 50 a 34 en el viewBox de 600pt) para que la diagonal se desvíe menos del punto base, y se aumentó el `paddingLeft` de `rightPanel` (de 24 a 44) para que el contenido arranque más a la derecha del punto más intruso de la diagonal, con margen de sobra. Verificado visualmente: las cuatro filas de contacto (teléfono, correo, dirección, fecha) quedan completamente dentro del panel oscuro, sin cruce con la diagonal.

## 6. `public/logo.png` apareció modificado sin ningún cambio de código que lo explique

**Qué pasó:** Durante la sesión, `git status` empezó a mostrar `public/logo.png` como modificado (mismo tipo de archivo, tamaño reducido de ~1.07MB a ~717KB). Ninguna herramienta usada en esta sesión escribió en ese archivo: la única referencia a `/logo.png` en el código es de solo lectura (`<Image src="/logo.png" />` en `PdfBrand.tsx`), y un intento de copiarlo a `C:\logo.png` para pruebas de renderizado falló por permisos (no llegó a tocar el original).

**Estado:** No se identificó la causa ni se revirtió el archivo — queda como pendiente para que el usuario confirme si es un cambio propio (por ejemplo, una optimización de imagen hecha fuera de esta conversación) antes de decidir si se descarta o se conserva.

## 7. `public/qr.jpeg` quedó como archivo sin trackear tras subir el QR a MongoDB

**Qué pasó:** Al conectar el QR real (ver "Ajuste posterior 3" en `tasks.md`), `git status` mostró un archivo nuevo sin trackear: `public/qr.jpeg` (JPEG 336×336, ~72KB).

**Cómo se generó:** No es un error de código — es el archivo local que el usuario usó como valor de `--archivo` al ejecutar `pnpm run upload:brand-asset -- --nombre qr --archivo public/qr.jpeg` (o una ruta equivalente dentro de `public/`). El script solo *lee* ese archivo y lo sube a MongoDB; no debería quedar ahí después.

**Qué falta:** Ningún código de la aplicación referencia `public/qr.jpeg` (el PDF siempre trae el QR desde `/api/brand-assets/qr`, con sesión). Se le indicó al usuario que lo borre de `public/` para no dejar una copia del QR expuesta como asset estático público del repo — la misma política que ya aplica a la firma (nunca pública en el repo, solo en MongoDB detrás de autenticación).

## 8. El QR no aparecía en el primer intento de descarga (no era un bug de código)

**Qué pasó:** Tras conectar `qrUrl` (punto 6), el primer PDF descargado desde el historial seguía mostrando el placeholder "QR de pagos próximamente" en vez de la imagen real, incluso después de reiniciar el servidor de desarrollo.

**Diagnóstico:** Se verificó todo el camino sin encontrar ningún defecto: (1) el documento existe en MongoDB con `nombre: "qr"`, `contentType: "image/jpeg"` y el tamaño exacto del archivo subido (consultado directamente con un script temporal vía `getDb()`, borrado al terminar); (2) `GET /api/brand-assets/qr` responde `401` sin sesión, igual que `/api/brand-assets/firma` (comportamiento esperado); (3) el componente, probado en aislado con un data URL de prueba, renderiza la imagen y el rótulo correctamente cuando `qrUrl` llega con valor.

**Causa real:** Al repetir la descarga del PDF, el QR apareció correctamente. No se identificó una causa de código — el síntoma del primer intento es consistente con una carga en caché del navegador o un estado transitorio, no con un defecto en la implementación.

**Cómo se corrigió:** No hizo falta ningún cambio de código; se resolvió solo al repetir la descarga.
