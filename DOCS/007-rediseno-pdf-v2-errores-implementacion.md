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
