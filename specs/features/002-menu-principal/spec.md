# **002 · Menú principal**

**Estado:** implementada y validada

## Qué hace

El usuario ve una pantalla principal con dos accesos claros: cotización y cuenta de cobro. Cada opción lo lleva al formulario correspondiente. También puede cerrar sesión desde esta pantalla.

## Por qué

Esta pantalla concentra la navegación principal del sistema y reduce la fricción para que el usuario entre rápido al flujo que necesita.

## Criterios de aceptación

- [x] presenta dos accesos visibles y diferenciados para cotización y cuenta de cobro
- [x] mantiene una estética llamativa tipo glassmorphism o equivalente coherente con la interfaz del proyecto
- [x] no incluye botones de redes sociales
- [x] redirecciona correctamente al formulario seleccionado (destinos `/cotizacion` y `/cuenta-cobro`, placeholders de las features 003 y 004)
- [x] incluye una opción de "Cerrar sesión" que termina la sesión y regresa al login
- [x] funciona de forma responsive en escritorio y dispositivos móviles (validado en 1280×800 y 375×667)
- [x] conserva textos y etiquetas en español

## Fuera de alcance

- No incluye formularios ni lógica de cálculo.
- No incluye autenticación de acceso (ya la cubre la feature 001); solo agrega el cierre de sesión sobre la sesión existente.
- No incluye enlaces externos ni redes sociales.
