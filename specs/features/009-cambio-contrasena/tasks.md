# 009 · Cambio de contraseña de usuario — Tareas

_Checklist accionable derivada del `plan.md`. Tareas pequeñas y concretas; marca `[x]` al completarlas._

- [x] `services/userService.ts`: agregar `updatePasswordHash(username, passwordHash)`.
- [x] `services/passwordService.ts` (nuevo): `cambiarPassword`, `PasswordActualIncorrectaError`, `DemasiadosIntentosError`, limitador de intentos propio (Map separado del de `authService.ts`).
- [x] `app/api/perfil/password/route.ts` (nuevo): `PATCH` con validación de sesión, validación de body, manejo de errores.
- [x] `components/CambiarPasswordForm.tsx` + `CambiarPasswordForm.module.css` (nuevo): formulario de 3 campos, validación de cliente, llamada a la API.
- [x] `app/perfil/page.tsx` + `app/perfil/perfil.module.css` (nuevo): página con el layout estándar (header/back-link/footer).
- [x] `app/menu/page.tsx`: agregar enlace "Cambiar contraseña" a `/perfil`.
- [x] `app/menu/menu.module.css`: ajustar `.footer` (gap) y agregar `.profileLink`.
- [x] `tests/services/passwordService.test.ts` (nuevo, Mongo Memory Server): cambio exitoso, contraseña actual incorrecta, usuario inexistente, bloqueo tras 5 intentos.
- [x] `tests/api/perfilPassword.route.test.ts` (nuevo, mock de `auth`): 401 sin sesión, 400 por contraseña nueva corta, 400 por contraseña actual incorrecta, 200 en éxito.
- [x] `tests/components/CambiarPasswordForm.test.tsx` (nuevo): validaciones de cliente (contraseña corta, confirmación no coincide), envío exitoso y error del servidor con `fetch` mockeado.
- [x] `tests/e2e/perfil.spec.ts` (nuevo): redirige a `/login` sin sesión.
- [x] `tests/components/MenuPage.test.tsx`: agregada una prueba para el nuevo enlace "Cambiar contraseña".
- [x] Ejecutado `npx tsc --noEmit`, `npx eslint` sobre los archivos nuevos/modificados, y `pnpm run test` — 78/78 pasan.
- [x] Verificación manual: desde esta sesión, solo se comprobó por `curl` (solo lectura) que `/perfil` y `/menu` redirigen a `/login` sin sesión, sin tocar la base de datos real — ver justificación en `DOCS/009-cambio-contrasena-errores-implementacion.md`. El usuario del proyecto hizo después la prueba completa (inicio de sesión real, cambio de contraseña) contra MongoDB Atlas y la confirmó como exitosa.
- [x] Validado contra los criterios de aceptación de `spec.md`.
- [x] Movida esta feature a "Hecho" en `specs/constitution/roadmap.md`.
- [x] Documentado en `DOCS/009-cambio-contrasena.md` y `DOCS/009-cambio-contrasena-errores-implementacion.md`.
