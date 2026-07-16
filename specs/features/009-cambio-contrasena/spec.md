# **009 · Cambio de contraseña de usuario**

**Estado:** Hecho ✅

## Qué hace

Permite que un usuario autenticado (dueño o contadora) cambie su propia contraseña desde una pantalla nueva (`/perfil`), confirmando primero su contraseña actual.

## Por qué

Hoy la única forma de establecer o cambiar una contraseña es que el desarrollador ejecute el script de seed (`pnpm run seed:users`) manualmente. El usuario del sistema necesita poder rotar su propia contraseña sin depender de eso, especialmente si sospecha que quedó expuesta.

## Alcance

### 1. Entrada desde el menú

- El menú principal (`/menu`) agrega un enlace "Cambiar contraseña" junto al botón "Cerrar sesión", que lleva a `/perfil`.

### 2. Pantalla `/perfil`

- Página protegida (como el resto de páginas de la app, vía `middleware.ts`, sin código adicional de protección en la página).
- Mismo layout que `cotización`/`cuenta-cobro`: encabezado con "← Volver al menú" + título, contenido centrado, pie con la tagline del taller.
- Formulario con 3 campos: **contraseña actual**, **contraseña nueva**, **confirmar contraseña nueva**.

### 3. Validaciones

- Contraseña actual: obligatoria.
- Contraseña nueva: mínimo 8 caracteres (sin otras reglas de complejidad).
- Confirmar contraseña nueva: debe coincidir exactamente con la contraseña nueva (validación de cliente, no se envía al servidor).
- Si la contraseña actual no coincide con la almacenada, se muestra un error genérico ("La contraseña actual no es correcta.") sin indicar más detalle.

### 4. Protección contra fuerza bruta

- Igual esquema que el login (`services/authService.ts`): máximo 5 intentos fallidos de contraseña actual por usuario en una ventana de 15 minutos; al superarlo, se rechaza con un mensaje de "demasiados intentos" aunque la contraseña actual sea correcta, hasta que pase la ventana.
- Es un límite independiente del de login (usuarios y contadores separados): fallar aquí no bloquea el inicio de sesión, y viceversa.

### 5. Tras un cambio exitoso

- La sesión activa **no se cierra** — el usuario ve un mensaje de confirmación y puede seguir usando la app con la sesión actual.
- Los campos del formulario se limpian tras el éxito.

## Criterios de aceptación

- [x] El menú principal muestra un enlace "Cambiar contraseña" que lleva a `/perfil`.
- [x] `/perfil` redirige a `/login` si no hay sesión iniciada (protección de `middleware.ts`, sin código adicional; verificado con `curl` contra el servidor de desarrollo).
- [x] El formulario exige contraseña actual, contraseña nueva (mínimo 8 caracteres) y confirmación coincidente antes de enviar la petición.
- [x] Si la contraseña actual es incorrecta, se muestra un mensaje de error y la contraseña no cambia.
- [x] Tras 5 intentos fallidos de contraseña actual en 15 minutos, se rechaza el intento siguiente aunque la contraseña sea correcta, con un mensaje de "demasiados intentos".
- [x] Si la contraseña actual es correcta y la nueva cumple los requisitos, la contraseña queda actualizada en la base de datos (verificado en `tests/services/passwordService.test.ts` y `tests/api/perfilPassword.route.test.ts` contra Mongo Memory Server) y se muestra un mensaje de éxito.
- [x] La sesión sigue activa después de un cambio exitoso (no redirige a `/login`) — no se llama `signOut` en ningún punto del flujo.
- [x] `npx tsc --noEmit` sin errores, `npx eslint` sin errores y `pnpm run test` pasa (78/78, incluyendo las 13 pruebas nuevas de esta feature).

## Fuera de alcance

- No incluye recuperación de contraseña para usuarios sin sesión (olvidé mi contraseña) — sigue explícitamente fuera de alcance, igual que en la feature 001.
- No incluye administración de usuarios (crear/eliminar/cambiar rol) — sigue siendo solo vía script de seed.
- No cambia el modelo de roles ni permisos.
- No agrega más reglas de complejidad de contraseña (mayúsculas, símbolos, etc.) más allá del largo mínimo.
