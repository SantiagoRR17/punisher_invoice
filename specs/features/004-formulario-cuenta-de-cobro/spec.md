# **004 · Formulario Cuenta de cobro**

**Estado:** implementada, pendiente de validación del usuario

## Qué hace

El usuario puede crear una cuenta de cobro con consecutivo único, diligenciar los datos del cliente y los ítems cobrados, calcular el total, registrar un abono inicial (50%, 60% o un valor manual) y ver el saldo pendiente para descargar el documento en PDF.

## Por qué

Esta pantalla formaliza el cobro, controla el consecutivo y deja visible el saldo pendiente para poder dar seguimiento sin perder trazabilidad.

## Consecutivo

Formato `CC-{año}-{secuencial}` (ej. `CC-2026-0001`), con el secuencial reiniciando en `0001` al comenzar cada año. Se asigna mediante un contador atómico en MongoDB (colección `counters`, un documento por año) para evitar duplicados aunque se creen varias cuentas al mismo tiempo. Nunca se reinicia manualmente sin autorización (ver `tech-stack.md` > Límites duros).

## Abonos y saldo

- Al crear la cuenta se puede registrar **un abono inicial**: 50% del total, 60% del total, un valor manual, o ninguno.
- El saldo pendiente es `total - suma de abonos`.
- El modelo de datos guarda los abonos como una lista (no un único valor), para poder registrar abonos adicionales más adelante sin rediseñar la cuenta.
- **Marcar la cuenta como pagada / agregar abonos posteriores a la creación queda fuera de esta feature**: no hay pantalla de historial todavía para localizar una cuenta ya creada. Esa acción se implementa en la feature `005-historial-cuentas-de-cobro`, que reutilizará el mismo modelo de abonos.

## Criterios de aceptación

- [x] asigna un consecutivo único a cada cuenta de cobro con el formato `CC-{año}-{secuencial}`
- [x] permite registrar datos del cliente y una tabla de ítems cobrados
- [x] calcula automáticamente el total general de la cuenta
- [x] permite seleccionar un abono inicial de 50%, 60%, un valor manual, o ninguno
- [x] calcula el saldo pendiente con base en el total y el abono inicial
- [x] guarda la cuenta de cobro en MongoDB (colección `cuentasCobro`) al generarla
- [x] permite descargar la cuenta de cobro como archivo PDF con un botón, sin pasos adicionales
- [x] el PDF conserva el diseño de `../../template_model.jpeg` (encabezado y pie de página con el mismo efecto de olas ya usado en la cotización, tabla de ítems, total, abono y saldo, y forma de pago)
- [x] valida que los campos numéricos contengan valores válidos y mayores a cero
- [x] presenta mensajes claros cuando faltan datos obligatorios o hay valores inválidos
- [x] funciona de forma responsive en escritorio y dispositivos móviles (validado en 1280×800 y 375×667)

## Fuera de alcance

- No incluye historial ni listado de cuentas de cobro guardadas (feature 005).
- No incluye buscar/seleccionar una cuenta existente para actualizarla (feature 005).
- No incluye marcar una cuenta como pagada ni registrar abonos posteriores a la creación (feature 005).
- No incluye eliminación del consecutivo.
- No incluye acceso público sin autenticación.
- Los assets reales de marca (logo, firma, ícono) siguen sin existir en `public/`: se reutilizan los mismos placeholders de la feature 003.