# **010 · Tipo de documento (Cédula/NIT)**

**Estado:** Hecho ✅

## Qué hace

Al registrar el cliente en una cotización o en una cuenta de cobro, el usuario puede elegir el **tipo de documento**: Cédula (CC) o NIT. Esto permite facturar tanto a personas naturales como a empresas. El número se sigue capturando en el mismo campo; en el PDF el documento se imprime con el prefijo correspondiente (`CC 12345678` o `NIT 900123456-7`).

## Por qué

Hasta ahora el cliente solo tenía "cédula" y el PDF imprimía el prefijo fijo `CC`. Las empresas se identifican con NIT, por lo que el documento quedaba mal etiquetado. Con un selector simple se cubre el caso de empresas sin rehacer el modelo de cliente.

## Alcance de la decisión (confirmado con el usuario)

- Selector simple **Tipo de documento** (Cédula/NIT) junto al número.
- Se mantienen los mismos campos del cliente (nombre, dirección, celular). **No** se agrega "razón social".
- **Tratamiento para empresas:** cuando el tipo es NIT, el tratamiento se muestra como **"Señores"** en el PDF y el selector Señor/Señora se oculta en el formulario (no aplica a una empresa). Para Cédula sigue igual (Señor/Señora).
- El campo de almacenamiento sigue llamándose `cedula` (guarda el número sea CC o NIT) para no migrar los registros existentes.

## Retrocompatibilidad

Los registros ya guardados (cotizaciones y cuentas de cobro) no tienen `tipoDocumento`. Al leerlos/renderizarlos se tratan como `"CC"` (prefijo por defecto), de modo que sus PDF se siguen viendo igual que antes.

## Criterios de aceptación

- [x] el formulario de cotización permite elegir el tipo de documento (Cédula/NIT) del cliente
- [x] el formulario de cuenta de cobro permite elegir el tipo de documento (Cédula/NIT) del cliente
- [x] el tipo de documento por defecto es Cédula (CC)
- [x] el PDF de cotización imprime el prefijo correcto (`CC` o `NIT`) según lo elegido
- [x] el PDF de cuenta de cobro imprime el prefijo correcto (`CC` o `NIT`) según lo elegido
- [x] cuando el tipo es NIT, el tratamiento se muestra como "Señores" y el selector Señor/Señora se oculta en el formulario
- [x] el API valida que `tipoDocumento` sea `"CC"` o `"NIT"` en ambos endpoints
- [x] un registro previo sin `tipoDocumento` se sigue renderizando como `CC` (retrocompatibilidad)
- [x] conserva la información visible en español
- [ ] funciona de forma responsive en escritorio y dispositivos móviles (1280×800 y 375×667) — pendiente validación visual manual del usuario

## Fuera de alcance

- No agrega campo "razón social" ni cambia el tratamiento para empresas.
- No renombra ni migra el campo `cedula` en la base de datos.
- No valida el formato del número (dígito de verificación del NIT, longitud de la cédula, etc.).
- No cambia el historial ni la conversión (features 012 y 013).
