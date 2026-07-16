# 009 · Cambio de contraseña de usuario — Errores durante la implementación

## 1. No se hizo la verificación manual completa del flujo (login real + cambio de contraseña) por apuntar a MongoDB Atlas de producción

**Qué pasó:** Al llegar al paso de validación manual (Paso 7 del flujo de trabajo del proyecto), se planeaba levantar `pnpm run dev`, iniciar sesión con un usuario real y cambiar su contraseña para confirmar el flujo de punta a punta en el navegador, como indica la guía general de "probar la funcionalidad en un navegador" para cambios de interfaz.

**Por qué no se hizo así:** Antes de iniciar el servidor, se verificó que `.env.local` (`MONGODB_URI`) apunta a un clúster `mongodb+srv://...` — MongoDB Atlas real, la misma base de datos de producción, no una de pruebas. `specs/constitution/tech-stack.md` prohíbe explícitamente tocar la base de datos real sin autorización explícita del usuario. Cambiar la contraseña de un usuario real (`jefe` o `contadora`) desde esta sesión, sin que el usuario del proyecto lo supervise ni conozca la nueva contraseña resultante, habría alterado credenciales de producción de forma unilateral — el mismo tipo de riesgo que ya se documentó para el login en `specs/features/001-login/spec.md` ("validada por el usuario contra MongoDB Atlas real": esa verificación la hizo el propio usuario, no el agente).

**Qué se hizo en su lugar:**
1. Se levantó `pnpm run dev` igualmente, pero solo para una verificación de **solo lectura**: se confirmó con `curl` que `GET /perfil` y `GET /menu` responden `307` y redirigen a `/login?callbackUrl=...` cuando no hay sesión — esto no lee ni escribe nada en la base de datos, solo ejercita el middleware de autenticación.
2. El flujo completo de cambio de contraseña (contraseña actual correcta/incorrecta, contraseña nueva válida/corta, bloqueo tras 5 intentos, actualización real del hash en la base de datos) quedó cubierto por `tests/services/passwordService.test.ts` y `tests/api/perfilPassword.route.test.ts`, ambos contra **Mongo Memory Server** (una instancia de MongoDB en memoria, aislada, que se descarta al terminar la prueba) — mismo patrón ya usado en `tests/services/authService.test.ts` y `tests/api/cuentasCobro.route.test.ts`.
3. Se detuvo el servidor de desarrollo al terminar la verificación de redirección, sin haber llamado nunca a `PATCH /api/perfil/password` contra la base de datos real.

**Resuelto:** el usuario del proyecto validó el flujo completo contra MongoDB Atlas por su cuenta después de esta sesión (inició sesión con su usuario real, fue a `/perfil`, cambió la contraseña y confirmó que el nuevo valor funciona) y lo reportó como exitoso — mismo patrón que con el login en la feature 001.
