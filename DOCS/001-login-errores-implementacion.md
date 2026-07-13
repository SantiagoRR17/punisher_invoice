# Login — Errores durante la implementación

Bitácora de los errores encontrados al implementar la feature `001-login` (scaffold del proyecto, autenticación y pruebas), con su causa y la solución aplicada. Sirve como referencia si vuelven a aparecer errores parecidos en features futuras.

## 1. `create-next-app` rechazó el directorio del proyecto

**Qué pasó:** Al inicializar el proyecto con `pnpm dlx create-next-app@15 .` en la raíz del repo, la herramienta abortó porque ya existían archivos (`CLAUDE.md`, `README.md`, `specs/`, `template_model.jpeg`).

**Cómo se generó:** `create-next-app` exige un directorio vacío (o casi vacío) para evitar sobrescribir archivos existentes.

**Cómo se corrigió:** Se generó el scaffold en un directorio temporal (`create-next-app@15 app` dentro de una carpeta temporal) y luego se copiaron manualmente los archivos generados (`app/`, `public/`, `package.json`, `tsconfig.json`, etc.) a la raíz del proyecto, sin tocar la documentación ya existente ni el `README.md` que trae `create-next-app` por defecto (se descartó ese README para no pisar el del proyecto).

## 2. Prompt interactivo de Turbopack bloqueó el scaffold

**Qué pasó:** `create-next-app` quedó esperando una respuesta interactiva ("¿Usar Turbopack?") que el entorno no puede responder.

**Cómo se generó:** Al no pasar explícitamente la opción de Turbopack, la CLI cae en modo interactivo.

**Cómo se corrigió:** Se agregaron las flags `--turbopack --yes` para que la CLI no pregunte y use las opciones indicadas/por defecto.

## 3. `pnpm install` abortó por falta de TTY al reinstalar `node_modules`

**Qué pasó:** `pnpm install` se detuvo con `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` al intentar reemplazar el `node_modules` generado por el scaffold temporal.

**Cómo se generó:** pnpm pide confirmación interactiva antes de borrar un `node_modules` existente, y este entorno no tiene una terminal interactiva (TTY) para confirmar.

**Cómo se corrigió:** Se ejecutó el install con la variable de entorno `CI=true`, que pnpm interpreta como "no hay TTY, procede sin preguntar".

## 4. Lockfile desactualizado tras agregar dependencias

**Qué pasó:** `pnpm install` con `CI=true` falló después con `ERR_PNPM_OUTDATED_LOCKFILE`, porque exige `frozen-lockfile` en modo CI y el `pnpm-lock.yaml` no tenía todavía las ~15 dependencias nuevas (next-auth, mongodb, bcrypt, vitest, playwright, etc.) que se acababan de agregar a `package.json`.

**Cómo se generó:** Se agregaron dependencias al `package.json` a mano y luego se corrió install; el lockfile generado por el scaffold no las incluía.

**Cómo se corrigió:** Se ejecutó `pnpm install --no-frozen-lockfile` para permitir que pnpm actualizara el lockfile con las dependencias nuevas.

## 5. Scripts de build de dependencias nativas bloqueados (bcrypt, mongodb-memory-server, etc.)

**Qué pasó:** pnpm instaló los paquetes pero advirtió `Ignored build scripts: bcrypt, esbuild, mongodb-memory-server, sharp, unrs-resolver`. Sin esos scripts, `bcrypt` no compila su binario nativo y `mongodb-memory-server` no descarga el binario de MongoDB, así que ninguno de los dos funciona.

**Cómo se generó:** Desde la versión 10, pnpm no ejecuta scripts de instalación (`postinstall`, etc.) de dependencias por defecto, como medida de seguridad ante paquetes maliciosos. Hay que aprobarlos explícitamente. El comando interactivo `pnpm approve-builds` tampoco funcionó aquí por la misma falta de TTY del punto 3.

**Cómo se corrigió:** Se agregó a `package.json` la sección:
```json
"pnpm": {
  "onlyBuiltDependencies": ["bcrypt", "esbuild", "mongodb-memory-server", "sharp", "unrs-resolver"]
}
```
Esto aprueba esos paquetes de forma declarativa (versionable en el repo) sin necesitar el prompt interactivo. Un `pnpm install` posterior corrió los scripts correctamente (bcrypt compiló su binding nativo y mongodb-memory-server descargó el `mongod` de prueba).

## 6. ESLint no encontraba `eslint-plugin-react-hooks`

**Qué pasó:** `pnpm run lint` fallaba con `ESLint couldn't find the plugin "eslint-plugin-react-hooks"`, aunque el paquete sí estaba instalado (como dependencia transitiva de `eslint-config-next`).

**Cómo se generó:** `eslint.config.mjs` usa `FlatCompat` para poder usar el preset `next/core-web-vitals` (pensado para ESLint clásico) en el nuevo formato "flat config". `FlatCompat` resuelve los plugins referenciados por ese preset **relativo a la raíz del proyecto**, no relativo a la carpeta de `eslint-config-next` donde realmente vive la dependencia. Como pnpm no expone en la raíz los paquetes que no son dependencias directas (evita el "phantom dependency" típico de npm/yarn), la resolución fallaba.

**Cómo se corrigió:** Se agregó `eslint-plugin-react-hooks` como devDependency directa en la raíz del `package.json`, con la misma versión que ya traía `eslint-config-next` (`^5.0.0`), para que pnpm lo exponga en el `node_modules` de primer nivel.

## 7. Vitest intentaba correr las pruebas de Playwright

**Qué pasó:** Al correr `pnpm run test`, Vitest recogió también `tests/e2e/login.spec.ts` (pensado para Playwright) y falló con `Error: Playwright Test did not expect test.describe() to be called here`.

**Cómo se generó:** Por defecto Vitest busca cualquier archivo que matchee patrones de test dentro del proyecto, incluida la carpeta `tests/e2e/`, pero `test.describe` de `@playwright/test` no es compatible con el runner de Vitest.

**Cómo se corrigió:** Se añadió `exclude: ["node_modules/**", "tests/e2e/**"]` en `vitest.config.ts` para que Vitest ignore las pruebas end-to-end (esas se ejecutan aparte con `pnpm run test:e2e`).

## 8. Las pruebas de `authService` fallaban con "Falta la variable de entorno MONGODB_DB"

**Qué pasó:** El test de `verifyCredentials` fallaba en `beforeAll` con ese error, a pesar de que el test asigna `process.env.MONGODB_DB` justo antes de llamar a `getDb()`.

**Cómo se generó:** `lib/mongodb.ts` leía `process.env.MONGODB_URI` y `process.env.MONGODB_DB` en constantes a nivel de módulo (`const MONGODB_URI = process.env.MONGODB_URI`), es decir, en el momento en que el archivo se importa. Como el import ocurre antes de que el test tenga oportunidad de correr `beforeAll` y fijar las variables de entorno, esas constantes quedaban capturadas como `undefined` para siempre.

**Cómo se corrigió:** Se movió la lectura de `process.env` al interior de las funciones (`getClientPromise` y `getDb`), para que se lean en el momento en que realmente se usan y no al importar el módulo.

## 9. El build de producción fallaba al empaquetar `bcrypt`

**Qué pasó:** `pnpm run build` fallaba con errores de Turbopack sobre `@mapbox/node-pre-gyp` (dependencia interna de `bcrypt`): un archivo `.html` sin tipo de módulo asociado y tres `require` que no podía resolver (`aws-sdk`, `mock-aws-s3`, `nock`).

**Cómo se generó:** `bcrypt` es un módulo nativo y usa `@mapbox/node-pre-gyp` para localizar su binario precompilado; ese paquete tiene código opcional para subir/descargar binarios desde S3 que nunca se ejecuta en este proyecto, pero Turbopack igual intenta analizarlo y empaquetarlo estáticamente. Un primer intento de solución (`serverExternalPackages: ["bcrypt"]` en `next.config.ts`) no fue suficiente porque `middleware.ts` corre en el runtime Edge de Next.js, y el `middleware.ts` original importaba `auth.ts` completo (incluyendo el proveedor de credenciales que usa `bcrypt` a través de `services/authService.ts`). El runtime Edge no soporta módulos nativos de Node y tampoco respeta `serverExternalPackages`, así que Turbopack seguía intentando empaquetar `bcrypt` para el middleware.

**Cómo se corrigió:** Se separó la configuración de Auth.js en dos archivos, siguiendo el patrón recomendado por Auth.js v5 para Next.js:
- `auth.config.ts`: configuración mínima, compatible con Edge, sin proveedores (`providers: []`), usada solo para decidir qué rutas requieren sesión.
- `auth.ts`: configuración completa con el `Credentials` provider y la dependencia de `bcrypt`, usada únicamente por el route handler (`app/api/auth/[...nextauth]/route.ts`), que sí corre en el runtime Node.js.
- `middleware.ts` pasó a construir su propia instancia de `NextAuth(authConfig)` usando solo el config liviano, sin importar `auth.ts` ni, por lo tanto, `bcrypt`.

Con este cambio, `serverExternalPackages: ["bcrypt"]` sí surte efecto (porque `bcrypt` ya no se referencia desde ningún código que corra en Edge) y el build de producción terminó sin errores.

## 10. Confusión momentánea al probar manualmente el mensaje de error de login

**Qué pasó:** Un script de verificación manual (Playwright, fuera del repo) reportó primero que no aparecía ningún mensaje de error tras un intento de login fallido.

**Cómo se generó:** El script de verificación buscaba el primer elemento con `role="alert"` en la página, pero Next.js agrega su propio elemento invisible con `role="alert"` (`#__next-route-announcer__`, usado para accesibilidad al navegar entre rutas). Con dos elementos `role="alert"` en la página, la consulta en "modo estricto" de Playwright fallaba o encontraba el elemento equivocado según el momento exacto de la consulta.

**Cómo se corrigió:** No fue necesario cambiar nada en la aplicación: se ajustó el script de verificación para apuntar específicamente al mensaje de error del formulario, confirmando que **sí** se muestra correctamente el texto "Usuario o contraseña inválidos." tras un login fallido. Este script era solo una herramienta de verificación manual y no quedó en el repositorio.

## 11. `.gitignore` excluía `template_model.jpeg` sin que se hubiera pedido

**Qué pasó:** Al revisar `.gitignore` antes de hacer commit, apareció una entrada `template_model.jpeg` que no se había agregado intencionalmente y que habría impedido versionar la imagen de referencia de diseño citada en `tech-stack.md`.

**Cómo se generó:** No se identificó con certeza el origen (no hay hooks de Claude Code configurados en el proyecto); pudo ser una edición concurrente al archivo durante el trabajo de esa sesión.

**Cómo se corrigió:** Se eliminó esa línea de `.gitignore` para que la imagen de referencia quede versionada, y se aprovechó para agregar en su lugar las carpetas que sí generan artefactos temporales (`test-results/`, `playwright-report/`) producidas por Playwright.
