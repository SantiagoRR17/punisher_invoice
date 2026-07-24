# Consecutivo `COT-{año}-####` y abono informativo en cotización

Documentación funcional y técnica de la feature 011. Ver también `specs/features/011-consecutivo-abono-cotizacion/`.

## Comportamiento

- **Consecutivo propio de cotización:** cada cotización recibe un número `COT-{año}-{secuencial}` (ej. `COT-2026-0001`), con secuencial de 4 dígitos que reinicia por año. Se muestra en el PDF (fila meta "N° COTIZACIÓN") y da nombre al archivo (`cotizacion-COT-2026-0001.pdf`).
- **Contador independiente:** el contador de cotizaciones (`cotizacion-{año}` en la colección `counters`) es separado del de cuentas de cobro (`cuenta-cobro-{año}`). `COT` y `CC` no comparten numeración.
- **Selector de abono en el formulario:** igual que en cuenta de cobro — ninguno / 50% / 60% / valor manual. El resumen muestra en vivo el abono y el saldo (`total - abono`).
- **Abono solo informativo:** se guarda como un único valor monetario (`abono`) y se muestra en el PDF, pero la cotización NO rastrea pagos ni admite abonos posteriores. El seguimiento real de saldo vive en la cuenta de cobro (features 004/005) y empezará al convertir la cotización (feature 013).
- **PDF:** bajo la tabla, si el abono es mayor a cero se muestran las filas **TOTAL** y **ABONO** (estilo resumen) y una fila **SALDO** destacada (fondo oscuro / valor amarillo, el mismo realce que ya usaba la fila total). Si el abono es cero, se deja solo la fila **TOTAL** destacada como antes.
- **Nota de abono dinámica:** la NOTA 2 fija "Abono del 50%…" se reemplaza por un texto genérico cuando hay abono (para no contradecir el valor elegido); si el abono es cero, se conserva la nota original del 50%.

## Cambios técnicos

- `services/consecutivoService.ts`: `getNextConsecutivo(anio, tipo = "cuenta-cobro")` (usa `_id: \`${tipo}-${anio}\``) y `formatConsecutivo(anio, numero, prefijo = "CC")`. Los defaults preservan el comportamiento previo de cuentas de cobro; sus llamadas no cambiaron.
- `models/Cotizacion.ts`: `Cotizacion` gana `consecutivo`, `anio`, `numero` y `abono`.
- `services/cotizacionService.ts`: `saveCotizacion` pasa a recibir `NuevaCotizacionInput { cliente, items, abono }` (espejo de `saveCuentaCobro`), calcula total, asigna el consecutivo COT y devuelve `CotizacionGuardada { consecutivo, total, abono, saldo, fecha }`.
- `app/api/cotizaciones/route.ts` (POST): valida `abono` (número ≥ 0 y ≤ total) y devuelve el objeto guardado (antes devolvía `{ id, total }`).
- `components/CotizacionForm.tsx` + `.module.css`: fieldset de abono (portado de `CuentaCobroForm`), envío de `abono` y uso de la respuesta.
- `components/pdf/CotizacionPdf.tsx`: props `consecutivo`/`abono`, estilos `metaRow`/`summaryRow` y las filas condicionales.

## Errores previsibles

| Situación | Comportamiento esperado |
| --- | --- |
| Abono mayor al total | El formulario y el API lo rechazan con mensaje claro (400) |
| Abono en cero | El PDF muestra solo TOTAL; la NOTA 2 conserva el texto del 50% |
| Dos documentos creados el mismo año | `COT` y `CC` numeran por separado, sin colisión |
