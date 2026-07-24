# 013 · Errores de implementación

Registro de errores encontrados y resueltos durante la implementación de la feature 013.

## 1. `searchParams` como Promise en Next 15

- **Causa:** al convertir `app/cuenta-cobro/page.tsx` en server component que lee el parámetro `cotizacion`, en Next 15 `searchParams` es un `Promise` y debe esperarse.
- **Solución:** la página se tipa con `searchParams: Promise<{ cotizacion?: string }>` y hace `await searchParams`. `pnpm build` reconoce `/cuenta-cobro` como ruta dinámica (ƒ), lo cual es esperado al depender de los parámetros de búsqueda.

## 2. Compatibilidad de tipos cliente/ítem entre cotización y cuenta de cobro

- **Causa:** `getCotizacion` devuelve `ClienteCotizacion`/`ItemCotizacion`, mientras que `CuentaCobroInicial` los espera como `ClienteCuentaCobro`/`ItemCuentaCobro`.
- **Solución:** ambas interfaces son estructuralmente idénticas (mismos campos, incluido `tipoDocumento` desde la feature 010), así que TypeScript acepta la asignación sin conversión explícita. `tsc --noEmit` quedó limpio.

## Nota sobre validación visual

Se validó por `tsc`, tests (101/101, incluido un caso de precarga de `CuentaCobroForm` desde `initial`) y `pnpm build`. La revisión visual del flujo completo (botón → formulario precargado → cuenta generada) y su responsive queda pendiente de la validación manual del usuario en el navegador.
