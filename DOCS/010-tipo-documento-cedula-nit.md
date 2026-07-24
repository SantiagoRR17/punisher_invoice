# Tipo de documento (Cédula/NIT)

Documentación funcional y técnica de la feature 010. Ver también `specs/features/010-tipo-documento-cedula-nit/`.

## Comportamiento

- **Nuevo selector "Tipo de documento" (Cédula / NIT)** en los formularios de cotización (`components/CotizacionForm.tsx`) y cuenta de cobro (`components/CuentaCobroForm.tsx`), dentro del grid de datos del cliente. El valor por defecto es `CC` (Cédula).
- **Etiqueta dinámica del número:** el campo que antes decía siempre "Cédula" ahora muestra "Cédula" o "NIT" según el tipo elegido. El número se sigue capturando y guardando en el mismo campo `cedula`.
- **PDF:** en `CotizacionPdf.tsx` y `CuentaCobroPdf.tsx` la línea de identificación pasó del literal fijo `CC {cedula}` a `{tipoDocumento ?? "CC"} {cedula}`, de modo que imprime `CC 12345678` o `NIT 900123456-7` según corresponda.
- **Tratamiento para empresas:** cuando `tipoDocumento === "NIT"`, la línea de tratamiento del PDF muestra `Señores:` en vez de `Señor/Señora:`, y el selector de tratamiento se oculta en ambos formularios (no aplica a una empresa). El estado conserva un tratamiento válido internamente para no romper la validación del API.
- **API:** `isValidCliente` en `app/api/cotizaciones/route.ts` y `app/api/cuentas-cobro/route.ts` ahora exige que `tipoDocumento` sea exactamente `"CC"` o `"NIT"`; cualquier otro valor devuelve 400.

## Modelo de datos

- `ClienteCotizacion` y `ClienteCuentaCobro` ganan `tipoDocumento: "CC" | "NIT"` (tipo `TipoDocumento`, declarado en cada modelo siguiendo el estilo del proyecto de duplicar tipos planos por documento).
- **No se renombró ni migró el campo `cedula`.** Sigue almacenando el número, sea cédula o NIT. Decisión tomada para no tocar los documentos ya guardados en Mongo (`cotizaciones`, `cuentasCobro`).

## Retrocompatibilidad

- Los registros previos no tienen `tipoDocumento`. Al renderizar su PDF, el default `?? "CC"` mantiene el prefijo original `CC`, así que se ven exactamente igual que antes. No se hizo backfill en la base de datos.

## Fuera de alcance

- No se agrega "razón social" ni se altera el tratamiento (Señor/Señora) para empresas — decisión del usuario (selector simple).
- No se valida el formato del NIT ni su dígito de verificación; el número es texto libre igual que la cédula.
