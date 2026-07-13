# **003 · Formulario Cotización**

**Estado:** implementada, pendiente de validación del usuario

## Qué hace

El usuario diligencia los datos del cliente y una tabla de ítems (descripción, cantidad, valor unitario), obtiene el total calculado automáticamente, la cotización se guarda en la base de datos y puede descargarse como PDF con el diseño de "El Taller del Soldador".

## Por qué

Esta pantalla permite formalizar rápidamente una oferta comercial clara y reutilizable sin depender de documentos manuales.

## Datos del formulario

- **Cliente:** tratamiento (Señor/Señora), nombre completo, cédula, dirección, barrio.
- **Ítems:** descripción (texto libre, admite varias líneas), cantidad, valor unitario. El valor de cada fila y el total general se calculan automáticamente.
- **Fecha:** se autocompleta con la fecha actual al generar la cotización.
- Los datos de la empresa (dirección, teléfono, correo) y las notas al pie (abono, plazo de entrega, condiciones) quedan **fijos** como texto igual en todas las cotizaciones, tal como en `template_model.jpeg`; no son editables desde el formulario en esta feature.

## Criterios de aceptación

- [x] permite registrar los datos del cliente (tratamiento, nombre, cédula, dirección, barrio) y una tabla de ítems (descripción, cantidad, valor unitario)
- [x] permite agregar y eliminar filas de la tabla de ítems
- [x] calcula automáticamente el valor de cada fila (cantidad × valor unitario) y el total general
- [x] valida que los campos numéricos (cantidad, valor unitario) sean válidos y mayores a cero
- [x] presenta mensajes claros cuando faltan datos obligatorios o hay valores inválidos
- [x] guarda la cotización en MongoDB (colección `cotizaciones`) al generarla
- [x] permite descargar la cotización como archivo PDF con un botón, sin pasos adicionales (sin diálogo de impresión)
- [x] el PDF conserva el diseño de `../../template_model.jpeg` (aproximado con los componentes de `@react-pdf/renderer`, con placeholders de logo/firma en vez de los archivos reales): encabezado oscuro con logo y datos de contacto, título "COTIZACIÓN Y ORDEN DE TRABAJO", tabla de ítems, notas y pie de página
- [x] funciona de forma responsive en escritorio y dispositivos móviles (validado en 1280×800 y 375×667)

## Fuera de alcance

- No incluye consecutivo de cuenta de cobro (eso es la feature 004).
- No incluye abonos ni control de saldo.
- No incluye historial ni listado de cotizaciones guardadas (posible feature futura).
- No incluye edición de una cotización ya guardada.
- Los assets reales de marca (logo, firma escaneada, ícono de soldador) no existen todavía en `public/`: se usan placeholders temporales hasta que el usuario entregue los archivos reales (ver `plan.md`).
- Los datos de la empresa y las notas del pie quedan fijos (no editables por cotización).