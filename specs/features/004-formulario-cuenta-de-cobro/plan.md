# 004 · Formulario Cuenta de cobro — Plan

_Cómo se implementa lo descrito en `spec.md`. Debe respetar la `constitution/`._

## Enfoque

La cuenta de cobro se implementará como un formulario controlado (cliente + tabla de ítems + selección de abono inicial), muy similar en estructura al formulario de cotización de la feature 003, reutilizando el mismo patrón de guardado en MongoDB + descarga de PDF con `@react-pdf/renderer`. El consecutivo se asigna de forma atómica en el servidor al guardar. La actualización posterior del saldo (abonos adicionales, marcar como pagada) queda para la feature 005, que ya tendrá una pantalla donde localizar la cuenta.

## Implementación

1. Crear `models/CuentaCobro.ts` (cliente, ítems, consecutivo, año, número, total, lista de abonos, saldo, fecha).
2. Crear `services/consecutivoService.ts` con un contador atómico por año (colección `counters`, `findOneAndUpdate` con `$inc`) para asignar el consecutivo `CC-{año}-{secuencial}`.
3. Crear `services/cuentaCobroService.ts` (calcula total/saldo, asigna consecutivo, guarda en la colección `cuentasCobro`).
4. Crear el route handler `POST /api/cuentas-cobro` para persistir.
5. Extraer a un módulo compartido (`components/pdf/pdfWave.ts`) la lógica de la ola (`traceWave`, `buildHeaderCapPath`, `buildWaveRibbonPath`) ya construida en la feature 003, para reutilizarla en el PDF de cuenta de cobro sin duplicar código.
6. Reemplazar el stub `app/cuenta-cobro/page.tsx` con el formulario real: datos del cliente + tabla de ítems + selección de abono (50%/60%/manual/ninguno) + saldo calculado en vivo.
7. Construir `components/pdf/CuentaCobroPdf.tsx` con el mismo encabezado/pie ondulado, tabla, total/abono/saldo y la sección "Forma de pago" (datos bancarios fijos) del template.
8. Conectar el botón "Descargar PDF" (guardar + generar + descargar en un clic, igual que en cotización).
9. Escribir pruebas de cálculo (total, abono, saldo), del consecutivo (secuencial y reinicio por año) y de guardado (Mongo Memory Server).

## Decisiones

- **Consecutivo `CC-{año}-{secuencial}`, reinicia cada año** — decidido con el usuario; contador atómico en MongoDB para evitar duplicados.
- **Abono inicial único en esta feature; abonos adicionales y "marcar como pagada" quedan para la feature 005** — no existe aún una pantalla para localizar una cuenta ya creada.
- **Modelo de abonos como lista, no como valor único** — para que la feature 005 pueda agregar abonos posteriores sin migrar datos.
- **Reutilizar el patrón de la feature 003** — formulario, servicio, route handler y PDF siguen la misma estructura que cotización, incluido el efecto de olas ya validado.

## Riesgos

- **Duplicidad de consecutivos bajo escritura concurrente** — mitigado con `findOneAndUpdate`/`$inc` atómico en vez de leer-y-sumar en el cliente.
- **Errores al recalcular saldo** — mitigar con pruebas de cálculo y validación de entradas.
- **Confusión sobre qué se puede hacer en esta feature vs. la 005** — mitigar dejándolo explícito en `spec.md` (fuera de alcance) y en `DOCS/`.
