# 010 · Errores de implementación

Registro de errores encontrados y resueltos durante la implementación de la feature 010.

## 1. Tests con fixture de cliente sin `tipoDocumento` (TypeScript + 400 en runtime)

- **Causa:** al agregar `tipoDocumento` como campo requerido de `ClienteCotizacion`/`ClienteCuentaCobro`, cinco fixtures de test que construían un `cliente` (en `tests/api/`, `tests/services/` y `tests/components/HistorialList.test.tsx`) dejaron de compilar; además, en los tests de ruta, el POST habría devuelto 400 porque `isValidCliente` ahora exige el campo.
- **Solución:** se añadió `tipoDocumento: "CC"` a los cinco fixtures. Se agregaron dos casos nuevos en `tests/api/cotizaciones.route.test.ts`: uno que acepta un cliente con `NIT` (201) y otro que rechaza un `tipoDocumento` inválido (400).

## 2. Flakiness de `waitFor` en la corrida completa del suite (no es un error de la feature)

- **Causa:** en la corrida completa de `pnpm run test` en frío, los dos tests happy-path (`CotizacionForm` y `CuentaCobroForm` "…cuando los datos son válidos") fallaron por timeout del `waitFor` por defecto (1000 ms) bajo un arranque de entorno lento (~166 s de environment). Es el mismo comportamiento ya documentado en `DOCS/008-medios-pago-cotizacion-errores-implementacion.md`.
- **Solución:** no requiere cambio de código. Reejecutados de forma aislada, los dos archivos pasan 10/10 de forma estable. El cambio de la feature no afecta esa lógica: la etiqueta "Cédula" que usan los tests sigue resolviendo porque el tipo de documento por defecto es `CC`.
- **Verificación:** `npx tsc --noEmit` sin errores; `tests/api/*route*` y los dos formularios pasan en caliente.
