# **004 · Formulario Cuenta de cobro**

**Estado:** en definición

## Qué hace

El usuario puede crear una cuenta de cobro con consecutivo único, diligenciar los datos del cliente y los ítems cobrados, calcular totales, registrar un porcentaje de abono o un valor manual y ver el saldo pendiente para exportar el documento a PDF.

## Por qué

Esta pantalla formaliza el cobro, controla el consecutivo y deja visible el saldo pendiente para poder dar seguimiento sin perder trazabilidad.

## Criterios de aceptación

- [ ] asigna un consecutivo único a cada cuenta de cobro
- [ ] permite registrar datos del cliente y una tabla de ítems cobrados
- [ ] calcula automáticamente el total general de la cuenta
- [ ] permite seleccionar un porcentaje de abono de 50% o 60%
- [ ] permite registrar un valor de abono manual
- [ ] calcula el saldo pendiente con base en el total y el abono
- [ ] permite actualizar la cuenta para reflejar el saldo en cero cuando el pago se completa
- [ ] permite exportar o imprimir la cuenta de cobro en formato PDF
- [ ] al exportar o imprimir en PDF, conserva el diseño del template, incluyendo el header y el footer
- [ ] valida que los campos numéricos contengan valores válidos
- [ ] funciona de forma responsive en escritorio y dispositivos móviles
- [ ] respeta el diseño presentado en `../../template_model.jpeg`, adaptando el header, el footer y la disposición de la tabla de productos o servicios

## Fuera de alcance

- No incluye historial de consultas.
- No incluye eliminación del consecutivo.
- No incluye acceso público sin autenticación.