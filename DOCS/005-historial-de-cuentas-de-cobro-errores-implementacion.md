# Historial de cuentas de cobro — Errores durante la implementación

Bitácora de los problemas encontrados al implementar la feature `005-historial-de-cuentas-de-cobro`, con su causa y la solución aplicada.

## 1. Fragmento sin `key` al agrupar fila + detalle expandible

**Qué pasó:** Al escribir `components/HistorialList.tsx`, cada fila de la tabla se agrupa con su fila de detalle (expandible) usando un fragmento, porque `.map` debe devolver un solo nodo por elemento pero aquí son dos `<tr>` (la fila y, opcionalmente, la de detalle). La primera versión usaba la sintaxis corta `<>...</>`, que no acepta la prop `key`.

**Cómo se generó:** La sintaxis corta de fragmentos (`<>`) no admite atributos como `key`; solo `<Fragment key={...}>` (importado de `react`) lo permite. Usar `<>` dentro de un `.map` sin más habría producido la advertencia de React "Each child in a list should have a unique key prop" al renderizar.

**Cómo se corrigió:** Se cambió a `<Fragment key={cuenta.consecutivo}>...</Fragment>` (importando `Fragment` de `react`) antes de ejecutar cualquier prueba, así que no llegó a manifestarse como advertencia en consola durante la QA.

## 2. Puerto 3000 ocupado por el entorno del usuario

**Qué pasó:** Al correr `pnpm run test:e2e`, Playwright volvió a reportar el puerto 3000 ocupado, igual que en las features 002, 003 y 004.

**Cómo se generó:** Esta vez se verificó con `ps aux` que no había ningún proceso `node`/`next` propio corriendo, por lo que el puerto lo tenía ocupado el propio entorno de desarrollo del usuario (ver bitácoras anteriores para el mismo patrón).

**Cómo se corrigió:** El usuario liberó el puerto y se volvieron a ejecutar las pruebas sin problema. No fue necesario ningún cambio en el proyecto.

## 3. La tabla del historial y la tabla de ítems del detalle no eran usables en móvil

**Qué pasó:** El usuario reportó, tras QA manual desde el celular, que el historial "no cargaba bien" en móvil. `components/HistorialList.module.css` tenía la tabla principal (`.table`, `min-width: 720px`) y la tabla de ítems del detalle expandido (`.itemsTable`) sin adaptación para pantallas angostas; además el formulario de registrar abono (`.abonoForm`) y los filtros (`.filters`) no se reacomodaban bien por debajo de ~360px de ancho.

**Cómo se generó:** Igual que en los formularios de cotización y cuenta de cobro (ver bitácoras de las features 003 y 004), el `overflow-x: auto` sirve para tablas anchas de solo lectura, pero no resuelve que el contenido quede legible sin scroll horizontal en una pantalla de celular.

**Cómo se corrigió:** Se agregó una regla `@media (max-width: 640px)` en `HistorialList.module.css` que: (1) convierte la tabla principal y la tabla de ítems del detalle en tarjetas apiladas por fila, con rótulos `::before` vía `attr(data-label)`; (2) apila los filtros (`.filters`) y el formulario de abono (`.abonoForm`) en columna; (3) hace los botones de acción de ancho completo. En `components/HistorialList.tsx` se agregó el atributo `data-label` a cada `<td>` de ambas tablas.
