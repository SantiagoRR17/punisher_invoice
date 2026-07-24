# **011 · Consecutivo `COT-{año}-####` y abono informativo en cotización**

**Estado:** Hecho ✅

## Qué hace

Cada cotización recibe un **consecutivo propio** con formato `COT-{año}-{secuencial}` (ej. `COT-2026-0001`), independiente del de las cuentas de cobro. Además, el formulario de cotización gana el mismo selector de **abono** que la cuenta de cobro (ninguno / 50% / 60% / valor manual); el abono elegido se muestra en el PDF como referencia (ABONO y SALDO), reemplazando la nota fija "Abono del 50%".

## Por qué

- El consecutivo permite identificar, buscar y referenciar cada cotización (necesario para el historial de la feature 012 y para nombrar el PDF).
- El abono configurable evita que la cotización siempre diga "50%" cuando el trato real puede ser otro (60%, un valor puntual o sin abono).

## Alcance de la decisión (confirmado con el usuario)

- El abono en la cotización es **solo informativo**: se muestra en el PDF como adelanto sugerido y saldo, pero **no** hay seguimiento de pagos ni abonos posteriores en la cotización (eso vive en la cuenta de cobro). El seguimiento real empieza al convertirla (feature 013).
- El consecutivo usa el mismo mecanismo atómico de las cuentas de cobro, con un contador independiente (`cotizacion-{año}`), así que `COT` y `CC` no comparten numeración.

## Datos que se guardan

Además de lo actual (`cliente`, `items`, `fecha`, `total`, `createdAt`), la cotización guarda:
`consecutivo`, `anio`, `numero` y `abono` (valor monetario; 0 si no hay). El saldo se deriva (`total - abono`) al renderizar; no se persiste.

## Criterios de aceptación

- [x] cada cotización recibe un consecutivo único `COT-{año}-{secuencial}` con secuencial de 4 dígitos
- [x] el contador de cotizaciones es independiente del de cuentas de cobro (no comparten numeración)
- [x] el formulario de cotización permite elegir abono: ninguno, 50%, 60% o valor manual
- [x] el resumen del formulario muestra en vivo el abono y el saldo calculados
- [x] el API valida que el abono sea un número ≥ 0 y ≤ total
- [x] el PDF muestra el consecutivo de la cotización
- [x] el PDF muestra las filas ABONO y SALDO cuando el abono es mayor a cero, y solo TOTAL cuando es cero
- [x] la nota fija "Abono del 50%" ya no contradice el abono elegido
- [x] el archivo PDF se nombra con el consecutivo (`cotizacion-COT-2026-0001.pdf`)
- [x] conserva la información visible en español
- [ ] funciona de forma responsive en escritorio y dispositivos móviles (1280×800 y 375×667) — pendiente validación visual manual del usuario

## Fuera de alcance

- No agrega historial, edición ni re-descarga (feature 012).
- No agrega seguimiento de saldo ni abonos posteriores en la cotización.
- No convierte la cotización en cuenta de cobro (feature 013).
- No reinicia ni modifica el consecutivo de cuentas de cobro existente.
