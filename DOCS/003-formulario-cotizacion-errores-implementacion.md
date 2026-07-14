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
