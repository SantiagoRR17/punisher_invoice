# 011 · Consecutivo `COT-{año}-####` y abono informativo — Plan

## Enfoque técnico

### 1. `services/consecutivoService.ts` — generalizar (sin romper cuentas de cobro)

- `getNextConsecutivo(anio, tipo: TipoConsecutivo = "cuenta-cobro")` con `TipoConsecutivo = "cuenta-cobro" | "cotizacion"`; el `_id` del contador pasa de `` `cuenta-cobro-${anio}` `` a `` `${tipo}-${anio}` ``.
- `formatConsecutivo(anio, numero, prefijo = "CC")`.
- Los defaults preservan exactamente el comportamiento actual de las cuentas de cobro (sus llamadas no cambian).

### 2. `models/Cotizacion.ts`

- Añadir `consecutivo: string`, `anio: number`, `numero: number`, `abono: number` a `Cotizacion` (espejo parcial de `CuentaCobro`, pero con `abono` como número único informativo en vez de la lista `abonos`).

### 3. `services/cotizacionService.ts`

- `saveCotizacion` pasa a recibir `NuevaCotizacionInput { cliente, items, abono }` (espejo de `NuevaCuentaCobroInput`), calcula `total`, asigna consecutivo con `getNextConsecutivo(anio, "cotizacion")` + `formatConsecutivo(anio, numero, "COT")`, guarda el documento completo y devuelve `CotizacionGuardada { consecutivo, total, abono, saldo, fecha }`.

### 4. `app/api/cotizaciones/route.ts` (POST)

- Añadir `isValidAbono` (número finito ≥ 0), copiado de `isValidAbonoInicial` de cuentas de cobro.
- Recalcular `total`, validar `abono ≤ total`, llamar a `saveCotizacion({ cliente, items, abono })` y devolver el objeto guardado (201).

### 5. `components/CotizacionForm.tsx`

- Portar de `CuentaCobroForm.tsx`: `type TipoAbono`, estados `tipoAbono`/`abonoManual`, `computeAbono`, resumen abono/saldo y el fieldset "Abono" (radios).
- Enviar `abono` (monetario) en el POST; leer la respuesta (`consecutivo`, `total`, `abono`, `saldo`, `fecha`), pasar `consecutivo` y `abono` al PDF y nombrar el archivo `cotizacion-{consecutivo}.pdf`.

### 6. `components/pdf/CotizacionPdf.tsx`

- Props: `Pick<Cotizacion, "cliente"|"items"|"fecha"|"total"|"consecutivo"|"abono">`.
- Mostrar el consecutivo en el bloque de título (fila meta "N° COTIZACIÓN", estilos `metaRow`/`metaLabel`/`metaValue` copiados de `CuentaCobroPdf.tsx`).
- Bajo la tabla: si `abono > 0`, filas TOTAL y ABONO (estilo `summaryRow` copiado de cuenta) + fila SALDO destacada (reusar el `totalRow` dark/amarillo actual). Si `abono === 0`, dejar solo la fila TOTAL destacada como hoy.
- Nota de abono dinámica: si `abono > 0`, NOTA 2 pasa a un texto genérico que no fija el 50%; si no, se mantiene la actual.

## Decisiones

- **`abono` como número único, no lista:** la cotización no rastrea pagos, así que un solo valor informativo basta (a diferencia de `abonos[]` en cuenta de cobro).
- **Reusar el `totalRow` dark/amarillo para SALDO:** mantiene la coherencia visual con la cuenta de cobro (donde el saldo es la fila destacada) sin inventar estilos nuevos.
- **Defaults en `consecutivoService`:** evitan tocar `saveCuentaCobro` y sus tests.

## Riesgos

- **Firma de `saveCotizacion` cambia:** su test unitario (`tests/services/cotizacionService.test.ts`) y la ruta se actualizan. Es el único consumidor además del API.
- **Contadores mezclados:** se cubre con un test que verifica que `cotizacion-{año}` y `cuenta-cobro-{año}` numeran por separado.

## Fuera de alcance del plan

- Historial/edición/re-descarga (012) y conversión (013).
