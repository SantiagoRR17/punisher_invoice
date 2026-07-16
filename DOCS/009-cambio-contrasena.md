# Cambio de contraseña de usuario

Documentación funcional y técnica de la feature 009. Ver también `specs/features/009-cambio-contrasena/`.

## Comportamiento

- **Entrada:** el menú principal (`/menu`) muestra un enlace "Cambiar contraseña" junto al botón "Cerrar sesión", que lleva a `/perfil`.
- **`/perfil`:** página protegida automáticamente por `middleware.ts` (mismo mecanismo que el resto de páginas de la app) — sin sesión, redirige a `/login?callbackUrl=...`. No requiere código de protección propio.
- **Formulario (`CambiarPasswordForm.tsx`):** 3 campos — contraseña actual, contraseña nueva, confirmar contraseña nueva.
  - Validación de cliente antes de llamar a la API: contraseña actual no vacía, contraseña nueva de al menos 8 caracteres, confirmación igual a la contraseña nueva.
  - Al enviar, llama a `PATCH /api/perfil/password` con `{ passwordActual, passwordNueva }` (la confirmación nunca viaja al servidor, es solo una validación de cliente).
  - En éxito: limpia los 3 campos y muestra "Contraseña actualizada correctamente."; **la sesión sigue activa**, no hay `signOut` ni redirección.
  - En error: muestra el mensaje que devuelve la API (a diferencia del login, aquí los mensajes son específicos — "La contraseña actual no es correcta.", "Demasiados intentos fallidos..." — porque no hay riesgo de enumeración de usuarios: el usuario objetivo ya es el de la sesión).
- **`PATCH /api/perfil/password` (`app/api/perfil/password/route.ts`):**
  - Requiere sesión (`session.user.name`, el mismo campo que identifica al usuario en el resto de rutas API de la app); sin sesión, 401.
  - Valida `passwordActual` (string no vacío) y `passwordNueva` (8–200 caracteres) antes de llamar al servicio; si no cumplen, 400.
  - Delega en `cambiarPassword` (`services/passwordService.ts`); mapea `PasswordActualIncorrectaError` → 400, `DemasiadosIntentosError` → 429.
- **`services/passwordService.ts` (`cambiarPassword`):**
  - Compara la contraseña actual con el hash guardado (`bcrypt.compare`).
  - Límite de intentos: máximo 5 fallos por usuario en una ventana de 15 minutos, igual esquema que `services/authService.ts` para el login — **pero en un `Map` completamente separado**: fallar aquí no bloquea el login, y viceversa.
  - En éxito: `bcrypt.hash(passwordNueva, 12)` (mismo costo que el resto del proyecto) y `updatePasswordHash` (nuevo en `services/userService.ts`) actualiza el documento en MongoDB.

## Decisiones de alcance (confirmadas con el usuario antes de implementar)

- Página propia `/perfil` enlazada desde el menú, no un formulario embebido en `/menu`.
- Único requisito de la contraseña nueva: mínimo 8 caracteres (sin reglas de complejidad adicionales).
- La sesión activa **no se cierra** tras un cambio exitoso.
- Sí se limita el número de intentos fallidos de contraseña actual, con el mismo esquema que el login (5 intentos / 15 min), pero en un contador independiente.

## Datos pendientes / fuera de alcance

- No hay recuperación de contraseña para usuarios sin sesión ("olvidé mi contraseña") — sigue fuera de alcance, igual que en la feature 001.
- No hay administración de usuarios (crear, eliminar, cambiar rol) desde interfaz — sigue siendo solo vía `pnpm run seed:users`.
- La verificación manual completa del flujo (iniciar sesión real, cambiar la contraseña, confirmar que la nueva funciona) la hizo el usuario del proyecto contra MongoDB Atlas y la confirmó como exitosa — ver `DOCS/009-cambio-contrasena-errores-implementacion.md` para el detalle de por qué esta sesión solo hizo una verificación de solo lectura.

## Errores previsibles

| Situación | Comportamiento esperado |
| --- | --- |
| Contraseña actual incorrecta | 400, "La contraseña actual no es correcta.", cuenta como un intento fallido |
| 5 intentos fallidos de contraseña actual en 15 minutos | 429, "Demasiados intentos fallidos. Intenta de nuevo en unos minutos.", incluso si el siguiente intento trae la contraseña correcta |
| Contraseña nueva menor a 8 caracteres | 400 antes de tocar la base de datos (validado también en el cliente) |
| Confirmación no coincide con la contraseña nueva | Error de cliente, no se llega a enviar la petición |
| Sin sesión iniciada | `/perfil` redirige a `/login`; `PATCH /api/perfil/password` devuelve 401 |
