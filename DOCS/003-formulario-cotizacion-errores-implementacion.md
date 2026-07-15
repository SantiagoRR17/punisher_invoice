# Formulario Cotización — Errores durante la implementación

Bitácora de los problemas encontrados al implementar la feature `003-formulario-cotizacion`, con su causa y la solución aplicada.

## 1. El bundle de `/cotizacion` pesaba 609 kB por `@react-pdf/renderer`

**Qué pasó:** Al revisar el resultado de `pnpm run build`, la ruta `/cotizacion` mostraba un "First Load JS" de 609 kB, muy por encima del resto de rutas de la app (~120 kB).

**Cómo se generó:** `components/CotizacionForm.tsx` importaba `pdf` de `@react-pdf/renderer` y `CotizacionPdf` de forma estática en la parte superior del archivo. Next.js incluye entonces toda la librería (con sus fuentes y motor de layout interno) en el bundle inicial de la página, aunque solo se necesita cuando el usuario hace clic en "Descargar PDF".

**Cómo se corrigió:** Se reemplazaron los imports estáticos por `import("@react-pdf/renderer")` e `import("@/components/pdf/CotizacionPdf")` dinámicos dentro del manejador del botón (`handleSubmit`), para que ese código solo se cargue cuando realmente se necesita. El "First Load JS" de `/cotizacion` bajó a 121 kB, en línea con el resto de la app.

## 2. Puertos ocupados al correr las pruebas E2E y la QA manual

**Qué pasó:** Al ejecutar `pnpm run test:e2e` y luego el servidor de desarrollo para la QA manual, Playwright reportó dos veces `Port 3000 is in use` y terminó en un timeout esperando el servidor.

**Cómo se generó:** En ambos casos el puerto ya estaba ocupado por procesos externos del propio usuario (una ventana de VS Code con su extensión/servidor integrado, y en otra ocasión un entorno de desarrollo que el usuario tenía abierto), no por un problema del código o la configuración del proyecto.

**Cómo se corrigió:** No fue necesario cambiar nada en el proyecto. El usuario liberó el puerto 3000 y se volvieron a ejecutar los comandos sin problema. Es la misma situación ya documentada en la bitácora de la feature 002 (`DOCS/002-menu-principal-errores-implementacion.md`, punto 2); se repite aquí porque volvió a ocurrir en esta sesión.

## 3. La tabla de ítems obligaba a hacer scroll horizontal para llenar el formulario en móvil

**Qué pasó:** El usuario reportó, tras QA manual desde el celular, que "no cargan bien los formularios desde móvil". La tabla de ítems (`components/CotizacionForm.module.css`, clase `.table`) tenía `min-width: 640px` dentro de un `.tableWrapper` con `overflow-x: auto`. En pantallas angostas eso obliga a desplazarse lateralmente para ver y llenar cada campo (descripción, cantidad, valor unitario) de cada ítem, en vez de que el formulario se acomode al ancho disponible.

**Cómo se generó:** El wrapper con scroll horizontal es una solución razonable para *ver* tablas de datos anchas, pero aquí la tabla contiene controles de formulario (`textarea`, `input`) que el usuario necesita completar, no solo leer; forzar scroll horizontal mientras se escribe es mala experiencia en móvil.

**Cómo se corrigió:** Se agregó una regla `@media (max-width: 640px)` en `CotizacionForm.module.css` que convierte cada fila de la tabla de ítems en una tarjeta apilada (`display: block` en tabla/fila/celda, encabezado `<thead>` oculto visualmente y reemplazado por un rótulo `::before` con `attr(data-label)` en cada celda). En `components/CotizacionForm.tsx` se agregó el atributo `data-label` a cada `<td>` de la tabla de ítems. El cambio se acotó exclusivamente a esa sección de ítems; el resto del formulario ("Datos del cliente") no se tocó.

## 4. El cambio de campo `barrio` → `celular` dejó el guardado de cotizaciones roto (no solo un error de tipos)

**Qué pasó:** El cliente pidió reemplazar el campo "Barrio" por "Celular" y reducir los campos obligatorios a solo nombre y celular. El usuario ya había editado `models/Cotizacion.ts` y `components/CotizacionForm.tsx` para hacer ese cambio, pero al revisar el estado del proyecto (`npx tsc --noEmit`) aparecían errores de compilación porque `components/pdf/CotizacionPdf.tsx` y `tests/services/cotizacionService.test.ts` seguían usando `cliente.barrio`, propiedad que ya no existe en el tipo `ClienteCotizacion`.

**Cómo se generó:** El campo se renombró en el modelo y en el formulario, pero no se propagó a todos los consumidores del tipo: el componente de PDF (que muestra los datos del cliente en el documento) y las pruebas de servicio. Además, la validación server-side en `app/api/cotizaciones/route.ts` (agregada en la auditoría de seguridad, commit `9430167`) seguía exigiendo `cedula`, `direccion` y `barrio` como campos de texto no vacíos — como el formulario ya no envía `barrio`, **toda petición `POST /api/cotizaciones` se rechazaba con 400**, incluso con el código compilando bien en el navegador (la propiedad ya no existe en el payload, así que `typeof c.barrio === "string"` siempre es falso). Este segundo problema era más grave que el error de tipos: rompía el guardado real de cotizaciones, no solo el build.

**Cómo se corrigió:**
- `components/pdf/CotizacionPdf.tsx`: se cambió `Barrio {cliente.barrio}` por `Cel. {cliente.celular}`.
- `app/api/cotizaciones/route.ts` (`isValidCliente`): `cedula` y `direccion` pasaron a ser opcionales (solo se valida que sean texto dentro del límite de longitud, sin exigir que no estén vacíos); `celular` pasó a ser el campo obligatorio en su lugar de `barrio`.
- `tests/services/cotizacionService.test.ts`, `tests/api/cotizaciones.route.test.ts`, `tests/components/CotizacionForm.test.tsx`: se actualizaron los fixtures y el helper `fillCliente` para usar `celular` en vez de `barrio`.
- Se verificó con `npx tsc --noEmit` (sin errores) y `pnpm run test` (55/55 pruebas en verde).

**Lección para próximos cambios de modelo:** al renombrar o quitar un campo del cliente, buscar todas las referencias (`grep` del nombre del campo) antes de dar por completo el cambio — no solo en el formulario y el modelo, sino también en los componentes de PDF, las validaciones del API route y los tests/fixtures asociados.
