# 004 · Formulario Cuenta de cobro — Tareas

_Checklist accionable derivada del `plan.md`. Tareas pequeñas y concretas; marca `[x]` al completarlas._

- [x] Crear `models/CuentaCobro.ts`.
- [x] Crear `services/consecutivoService.ts` (contador atómico por año).
- [x] Crear `services/cuentaCobroService.ts` (cálculo de total/saldo + guardado).
- [x] Crear el route handler `POST /api/cuentas-cobro`.
- [x] Extraer la lógica de la ola de `CotizacionPdf.tsx` a `components/pdf/pdfWave.ts` compartido.
- [x] Definir el formulario de cuenta de cobro (cliente + ítems + selección de abono 50%/60%/manual/ninguno).
- [x] Implementar el cálculo automático de total y saldo pendiente en vivo.
- [x] Agregar validaciones para campos numéricos y obligatorios, con mensajes de error.
- [x] Construir `components/pdf/CuentaCobroPdf.tsx` (encabezado/pie ondulado, tabla, total/abono/saldo, forma de pago).
- [x] Conectar el botón "Descargar PDF" (guardar en Mongo + generar + descargar en un clic).
- [x] Validar responsive y comportamiento en diferentes tamaños.
- [x] Escribir pruebas de cálculo, del consecutivo (secuencial y reinicio anual) y de guardado (Mongo Memory Server).
- [x] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md` (pendiente de confirmación del usuario).

## Mantenimiento (checklist recurrente)

_Opcional. Pasos a repetir cada vez que se toque esta feature en el futuro (revisar datos, regenerar algo, etc.). Borra esta sección si no aplica._

- [ ] Revisar la secuencia del consecutivo si cambian los registros previos.
- [ ] Reemplazar los placeholders de logo/firma/ícono por los archivos reales cuando el usuario los proporcione (mismo pendiente que la feature 003).
