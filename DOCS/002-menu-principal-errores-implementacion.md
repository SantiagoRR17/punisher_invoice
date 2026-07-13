# Menú principal — Errores durante la implementación

Bitácora de los errores encontrados al implementar la feature `002-menu-principal`, con su causa y la solución aplicada.

## 1. `tsc --noEmit` fallaba por un rol de prueba obsoleto

**Qué pasó:** Al validar la feature, `pnpm exec tsc --noEmit` falló con `Type '"dueno"' is not assignable to type 'UserRole'` en `tests/services/authService.test.ts`.

**Cómo se generó:** Durante la sesión anterior (feature 001) el tipo `UserRole` se renombró de `"dueno"` a `"jefe"` en `models/User.ts` y `scripts/seedUsers.ts`, pero el test de `authService` seguía usando el valor literal `"dueno"` en dos lugares.

**Cómo se corrigió:** Se actualizó `tests/services/authService.test.ts` para usar `"jefe"` en el usuario de prueba y en la aserción del rol devuelto.

## 2. Prueba E2E fallaba por un puerto ocupado

**Qué pasó:** Al correr `pnpm run test:e2e`, Playwright reportó `Port 3000 is in use` y terminó en `Error: Timed out waiting 60000ms from config.webServer.`

**Cómo se generó:** El usuario tenía un servidor de desarrollo propio corriendo en el puerto 3000 en ese momento; Next.js detectó el puerto ocupado y arrancó en el 3001, pero `playwright.config.ts` esperaba una respuesta en el 3000 (`url: "http://localhost:3000"`), así que nunca la recibió.

**Cómo se corrigió:** No fue necesario cambiar código. Se esperó a que el usuario liberara el puerto 3000 y se volvió a ejecutar `pnpm run test:e2e`.

## 3. Prueba E2E del redirect a `/login` no coincidía con la URL real

**Qué pasó:** El nuevo test `tests/e2e/menu.spec.ts` esperaba `toHaveURL(/\/login$/)` tras visitar `/menu` sin sesión, pero falló porque la URL real fue `http://localhost:3000/login?callbackUrl=...`.

**Cómo se generó:** El `authorized` callback de `auth.config.ts` (heredado de Auth.js) agrega automáticamente un parámetro `callbackUrl` al redirigir a `/login`, para poder volver a la ruta original tras iniciar sesión. El regex del test no contemplaba ese query string.

**Cómo se corrigió:** Se ajustó el regex a `/\/login(\?|$)/` para aceptar tanto `/login` solo como `/login?...`.

## 4. Script de verificación manual no encontraba el paquete `playwright`

**Qué pasó:** Un script temporal de QA manual (`_tmp_qa_menu.mjs`, fuera del repo) falló con `Cannot find package 'playwright'` al importar `{ chromium } from "playwright"`.

**Cómo se generó:** El proyecto solo tiene `@playwright/test` como dependencia directa (usada por los tests E2E); `playwright` es una dependencia transitiva de esa, y pnpm no la expone en el `node_modules` de primer nivel (mismo comportamiento de aislamiento de dependencias descrito en el punto 6 de la bitácora de la feature 001).

**Cómo se corrigió:** Se cambió el import del script a `import { chromium } from "@playwright/test"`, que sí reexporta el lanzador de Chromium. No se modificó ninguna dependencia del proyecto porque el script era solo una herramienta temporal de verificación manual y no quedó en el repositorio.

## 5. `body.textContent()` devolvía contenido difícil de leer al verificar los placeholders

**Qué pasó:** Al capturar `page.textContent("body")` en `/cotizacion` y `/cuenta-cobro` durante la QA manual, la salida incluía el payload interno de React Server Components (`self.__next_f.push(...)`) además del texto visible, dificultando confirmar visualmente el contenido esperado.

**Cómo se generó:** `textContent` concatena el texto de todos los nodos descendientes, incluido el contenido de las etiquetas `<script>` inyectadas por Next.js para hidratar la página.

**Cómo se corrigió:** No afectó el resultado de la verificación: se buscó el texto esperado ("Pantalla pendiente de implementar en la feature 003/004...") dentro de esa salida con una búsqueda de texto simple, y adicionalmente se revisaron las capturas de pantalla para confirmar el render visual. Fue solo una limitación del script temporal, no un problema de la aplicación.
