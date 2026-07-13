# Formulario Cuenta de cobro — Errores durante la implementación

Bitácora de los problemas encontrados al implementar la feature `004-formulario-cuenta-de-cobro`, con su causa y la solución aplicada.

## 1. Servidores de desarrollo propios quedaron corriendo entre sesiones de QA

**Qué pasó:** Al correr `pnpm run test:e2e` para esta feature, Playwright volvió a reportar `Port 3000 is in use`, igual que en features anteriores. Esta vez, al inspeccionar los procesos (`ps aux`), el proceso que ocupaba el puerto no era del usuario sino un `pnpm run dev` que se había lanzado en segundo plano durante la QA manual de la feature 003 (cotización) y nunca se detuvo, porque se lanzó con `(pnpm run dev &)` sin capturar correctamente el PID del proceso `node` real (el `$!` capturado corresponde a la subshell, no al proceso hijo).

**Cómo se generó:** El patrón usado para iniciar el servidor de desarrollo en segundo plano durante la QA manual no garantizaba poder detenerlo después de forma confiable.

**Cómo se corrigió:** Se identificó y terminó el proceso `node` huérfano con `ps aux | grep node` + `kill <pid>` antes de volver a correr las pruebas E2E y la QA manual de esta feature. Para las próximas features conviene verificar con `ps aux` (o similar) que no quede un servidor de desarrollo propio corriendo antes de dar por terminada la QA manual.
