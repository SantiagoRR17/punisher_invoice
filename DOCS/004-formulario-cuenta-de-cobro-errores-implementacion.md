# Formulario Cuenta de cobro — Errores durante la implementación

Bitácora de los problemas encontrados al implementar la feature `004-formulario-cuenta-de-cobro`, con su causa y la solución aplicada.

## 1. Servidores de desarrollo propios quedaron corriendo entre sesiones de QA

**Qué pasó:** Al correr `pnpm run test:e2e` para esta feature, Playwright volvió a reportar `Port 3000 is in use`, igual que en features anteriores. Esta vez, al inspeccionar los procesos (`ps aux`), el proceso que ocupaba el puerto no era del usuario sino un `pnpm run dev` que se había lanzado en segundo plano durante la QA manual de la feature 003 (cotización) y nunca se detuvo, porque se lanzó con `(pnpm run dev &)` sin capturar correctamente el PID del proceso `node` real (el `$!` capturado corresponde a la subshell, no al proceso hijo).

**Cómo se generó:** El patrón usado para iniciar el servidor de desarrollo en segundo plano durante la QA manual no garantizaba poder detenerlo después de forma confiable.

**Cómo se corrigió:** Se identificó y terminó el proceso `node` huérfano con `ps aux | grep node` + `kill <pid>` antes de volver a correr las pruebas E2E y la QA manual de esta feature. Para las próximas features conviene verificar con `ps aux` (o similar) que no quede un servidor de desarrollo propio corriendo antes de dar por terminada la QA manual.

## 2. La tabla de ítems obligaba a hacer scroll horizontal para llenar el formulario en móvil

**Qué pasó:** El usuario reportó, tras QA manual desde el celular, que "no cargan bien los formularios desde móvil". La tabla de ítems (`components/CuentaCobroForm.module.css`, clase `.table`) tenía `min-width: 640px` dentro de un `.tableWrapper` con `overflow-x: auto`. En pantallas angostas eso obliga a desplazarse lateralmente para ver y llenar cada campo (descripción, cantidad, valor unitario) de cada ítem, en vez de que el formulario se acomode al ancho disponible.

**Cómo se generó:** El wrapper con scroll horizontal es una solución razonable para *ver* tablas de datos anchas, pero aquí la tabla contiene controles de formulario (`textarea`, `input`) que el usuario necesita completar, no solo leer; forzar scroll horizontal mientras se escribe es mala experiencia en móvil.

**Cómo se corrigió:** Se agregó una regla `@media (max-width: 640px)` en `CuentaCobroForm.module.css` que convierte cada fila de la tabla de ítems en una tarjeta apilada (`display: block` en tabla/fila/celda, encabezado `<thead>` oculto visualmente y reemplazado por un rótulo `::before` con `attr(data-label)` en cada celda). En `components/CuentaCobroForm.tsx` se agregó el atributo `data-label` a cada `<td>` de la tabla de ítems. El cambio se acotó exclusivamente a esa sección de ítems; el resto del formulario ("Datos del cliente", "Abono inicial") no se tocó, a petición explícita del usuario tras revisar el primer diff.

## 3. El cambio de campo `barrio` → `celular` dejó el guardado de cuentas de cobro roto (no solo un error de tipos)

**Qué pasó:** Mismo cambio de negocio que en la feature 003 (reemplazar "Barrio" por "Celular", reducir obligatorios a nombre y celular), aplicado también a `models/CuentaCobro.ts` y `components/CuentaCobroForm.tsx`. `npx tsc --noEmit` mostraba errores porque `components/pdf/CuentaCobroPdf.tsx` y `tests/services/cuentaCobroService.test.ts` seguían usando `cliente.barrio`.

**Cómo se generó:** Igual que en 003: el campo se renombró en modelo y formulario, pero no en el componente de PDF ni en los tests. Además, `app/api/cuentas-cobro/route.ts` (`isValidCliente`, agregada en la auditoría de seguridad, commit `9430167`) seguía exigiendo `cedula`, `direccion` y `barrio` no vacíos, así que **todo `POST /api/cuentas-cobro` se rechazaba con 400** al no recibir `barrio` en el payload.

**Cómo se corrigió:**
- `components/pdf/CuentaCobroPdf.tsx`: se cambió `Barrio {cliente.barrio}` por `Cel. {cliente.celular}`.
- `app/api/cuentas-cobro/route.ts` (`isValidCliente`): `cedula` y `direccion` pasaron a ser opcionales (solo se valida tipo y longitud); `celular` pasó a ser el campo obligatorio en vez de `barrio`.
- `tests/services/cuentaCobroService.test.ts`, `tests/api/cuentasCobro.route.test.ts`, `tests/components/CuentaCobroForm.test.tsx`, `tests/components/HistorialList.test.tsx`: se actualizaron los fixtures y el helper `fillCliente` para usar `celular` en vez de `barrio`.
- Se verificó con `npx tsc --noEmit` (sin errores) y `pnpm run test` (55/55 pruebas en verde).

## 4. Descripción de ítem con especificaciones técnicas rechazada con 400 por exceder el máximo de caracteres

**Qué pasó:** Mismo caso que en la feature 003 (ver `DOCS/003-formulario-cotizacion-errores-implementacion.md`, punto 5): una descripción de ítem con especificaciones técnicas de 533 caracteres superaba el máximo permitido y la API respondía 400, mostrando el formulario un mensaje genérico sin detalle.

**Cómo se generó:** `app/api/cuentas-cobro/route.ts` valida `descripcion.length <= MAX_DESCRIPCION`, con `MAX_DESCRIPCION = 500` (misma constante que en `cotizaciones/route.ts`).

**Cómo se corrigió:** A petición del usuario, se subió `MAX_DESCRIPCION` de 500 a 5000 caracteres en ambas rutas (`cotizaciones` y `cuentas-cobro`). Se actualizó el test `tests/api/cuentasCobro.route.test.ts` de `"a".repeat(501)` a `"a".repeat(5001)`. Verificado con `pnpm exec vitest run` (11/11 en verde entre ambos archivos de test de rutas).
