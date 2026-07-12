# **003 · Formulario Cotización**

**Estado:** en definición

## Qué hace

El usuario puede diligenciar los datos del cliente y una tabla de productos o servicios, calcular los totales automáticamente y generar la cotización para exportarla a PDF.

## Por qué

Esta pantalla permite formalizar rápidamente una oferta comercial clara y reutilizable sin depender de documentos manuales.

## Criterios de aceptación

- [ ] permite registrar datos del cliente y una tabla de ítems a cotizar
- [ ] calcula automáticamente el total de cada fila con base en cantidad y precio unitario
- [ ] calcula el total general de la cotización
- [ ] valida que los campos numéricos contengan valores válidos
- [ ] permite exportar o imprimir la cotización en formato PDF
- [ ] al exportar o imprimir en PDF, conserva el diseño del template, incluyendo el header y el footer
- [ ] funciona de forma responsive en escritorio y dispositivos móviles
- [ ] presenta mensajes claros cuando faltan datos obligatorios o hay valores inválidos
- [ ] respeta el diseño presentado en `../../template_model.jpeg`, incluyendo el header, el footer y la disposición de la tabla de productos

## Fuera de alcance

- No incluye consecutivo de cuenta de cobro.
- No incluye abonos ni control de saldo.
- No incluye historial de documentos.