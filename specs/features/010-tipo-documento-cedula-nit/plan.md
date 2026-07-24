# 010 · Tipo de documento (Cédula/NIT) — Plan

## Enfoque técnico

### 1. Modelos (`models/Cotizacion.ts`, `models/CuentaCobro.ts`)

- Añadir `export type TipoDocumento = "CC" | "NIT";` en `models/Cotizacion.ts` y reexportarlo/duplicarlo en `models/CuentaCobro.ts` (los modelos son interfaces planas independientes, siguiendo el estilo actual del proyecto que duplica `TratamientoCliente`).
- Añadir `tipoDocumento: TipoDocumento;` a `ClienteCotizacion` y `ClienteCuentaCobro`.
- Se mantiene el campo `cedula: string` como almacén del número.

### 2. Formularios (`components/CotizacionForm.tsx`, `components/CuentaCobroForm.tsx`)

- Añadir `tipoDocumento: TipoDocumento` a `ClienteFormState` con default `"CC"`.
- Agregar un `<select>` "Tipo de documento" (Cédula/NIT) al inicio del grid de cliente.
- La etiqueta del campo de número pasa a ser dinámica: "Cédula" cuando es CC, "NIT" cuando es NIT.
- Incluir `tipoDocumento` en el objeto `cliente` que se envía en el POST (ya se envía `cliente` completo, así que basta con tenerlo en el estado).

### 3. API (`app/api/cotizaciones/route.ts`, `app/api/cuentas-cobro/route.ts`)

- En `isValidCliente`, añadir la comprobación `(c.tipoDocumento === "CC" || c.tipoDocumento === "NIT")`.

### 4. PDF (`components/pdf/CotizacionPdf.tsx`, `components/pdf/CuentaCobroPdf.tsx`)

- Reemplazar el literal `CC {cliente.cedula}` por `{cliente.tipoDocumento ?? "CC"} {cliente.cedula}` (default `"CC"` para registros antiguos).

## Decisiones

- **No renombrar `cedula`:** evita una migración de datos sobre registros existentes; el campo pasa a ser semánticamente "número de documento" pero conserva su nombre para no romper documentos guardados ni los tests.
- **Default `"CC"` en render:** garantiza retrocompatibilidad de los PDF de registros previos sin tocar la base de datos.
- **Sin validación de formato del NIT:** fuera de alcance; el número es texto libre como la cédula hoy.

## Riesgos

- **Registros antiguos sin `tipoDocumento`:** cubierto con el default `"CC"` en el render del PDF y con TypeScript tratando el campo como requerido solo en escritura nueva.
- **Tests existentes** que construyen un `cliente` sin `tipoDocumento`: se actualizan para incluir `tipoDocumento: "CC"` donde el tipo lo exija.

## Fuera de alcance del plan

- No se toca el consecutivo, el abono ni el historial (features 011–013).
