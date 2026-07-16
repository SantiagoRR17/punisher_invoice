# 009 · Cambio de contraseña de usuario — Plan

## Enfoque técnico

### 1. `services/userService.ts`

Se agrega `updatePasswordHash(username: string, passwordHash: string): Promise<void>`, mismo patrón que `findUserByUsername` (usa `getDb()` y la colección `users`, `updateOne({ username }, { $set: { passwordHash } })`).

### 2. `services/passwordService.ts` (nuevo)

Nuevo servicio, no se reutiliza `authService.ts` directamente:

- `cambiarPassword(username, passwordActual, passwordNueva): Promise<void>`.
- Verifica la contraseña actual con `bcrypt.compare` contra el hash de `findUserByUsername(username)`.
- Límite de intentos: mismo esquema que `authService.ts` (`Map<string, RegistroIntentos>`, `MAX_INTENTOS = 5`, `VENTANA_MS = 15 * 60 * 1000`), pero en un **Map separado**, con sus propias funciones (`estaBloqueado`/`registrarIntentoFallido`/`limpiarIntentos`). Se duplica en vez de extraer un helper compartido: son ~20 líneas ya usadas como patrón aceptado en el proyecto (ver decisión abajo), y evita acoplar el bloqueo de login con el de cambio de contraseña — un fallo aquí no debe afectar el login, y viceversa.
- No hace falta el truco de `DUMMY_HASH` de `authService.ts` (evitar timing attacks para no revelar qué usuarios existen): aquí el `username` ya viene de la sesión autenticada, no hay nada que enumerar.
- Lanza `PasswordActualIncorrectaError` (contraseña actual no coincide) o `DemasiadosIntentosError` (límite superado) — clases de error específicas, mismo patrón que `CuentaCobroNoEncontradaError`/`SaldoInsuficienteError` en `services/cuentaCobroService.ts`.
- Si todo es válido: `bcrypt.hash(passwordNueva, 12)` (mismo costo que el resto del proyecto) y `updatePasswordHash`.

### 3. `app/api/perfil/password/route.ts` (nuevo)

- `PATCH` (coincide con la convención de `app/api/cuentas-cobro/[consecutivo]/route.ts` para actualizaciones).
- `const session = await auth(); const username = session?.user?.name;` — si no hay `username`, 401. (`session.user.name` es el username, ver `auth.ts`: `authorize` devuelve `{ id, name: username, role }`; no hay un campo `id`/`username` propio en el objeto de sesión, solo `name` y `role`.)
- Validación manual del body (mismo estilo hand-rolled que `cotizaciones/route.ts`, sin librería de esquemas): `passwordActual` debe ser string no vacío; `passwordNueva` debe ser string de 8 a 200 caracteres.
- Llama a `cambiarPassword`; mapea `PasswordActualIncorrectaError` → 400, `DemasiadosIntentosError` → 429.
- Éxito: `{ ok: true }` con 200.

### 4. `components/CambiarPasswordForm.tsx` (nuevo)

Mismo patrón que `CotizacionForm.tsx`: `"use client"`, estado por campo, `errors: string[]`, `successMessage`, `isSubmitting`, `validate()` que puebla `errors` y corta si hay problemas, `handleSubmit` con `fetch("/api/perfil/password", { method: "PATCH", ... })`.

- `validate()`: contraseña actual no vacía; contraseña nueva ≥ 8 caracteres; confirmación === contraseña nueva.
- En éxito: limpia los 3 campos, muestra `successMessage`. **No** llama a `signOut` ni redirige — la sesión sigue activa (decisión del usuario).
- En error de la API: muestra el mensaje que devuelve el `error` del JSON de respuesta (igual de específico que el backend, no genérico) — a diferencia de `LoginForm.tsx` (que sí usa un mensaje genérico por seguridad de enumeración de usuarios), aquí no hay enumeración posible porque el usuario ya está autenticado como sí mismo.

### 5. `app/perfil/page.tsx` + `app/perfil/perfil.module.css` (nuevos)

Mismo layout que `app/cotizacion/page.tsx` (`header` con `backLink` a `/menu` + título, `content` centrado con `<CambiarPasswordForm />`, `footer` con tagline). CSS module copiado del de cotización.

### 6. `app/menu/page.tsx` + `app/menu/menu.module.css`

- Se agrega un `<Link href="/perfil">Cambiar contraseña</Link>` en el `footer`, junto a `<LogoutButton />`.
- `menu.module.css`: `.footer` pasa a `gap: 1rem` con ambos elementos centrados; nueva clase `.profileLink` (texto sutil, mismo tratamiento visual que `.backLink` de las otras páginas) para diferenciarlo de los enlaces principales del menú (`.link`).

## Decisiones

- **No se reutiliza el limitador de intentos de `authService.ts` como helper compartido:** se evaluó extraer una fábrica genérica (`createIntentoLimiter(max, ventanaMs)`) pero se descarta para no tocar `authService.ts` (ya validado y probado) fuera del alcance de esta feature. Duplicar ~20 líneas es el mismo patrón de duplicación ya tolerado en el proyecto (ver decisión análoga en `specs/features/008-medios-pago-cotizacion/plan.md`).
- **Servicio nuevo (`passwordService.ts`) en vez de extender `authService.ts`:** cambiar contraseña es una operación distinta de verificar credenciales de login; mantenerlos separados evita que un cambio futuro en la lógica de login afecte accidentalmente el cambio de contraseña.
- **Mensajes de error específicos (no genéricos) en el formulario:** a diferencia del login, aquí no hay riesgo de enumeración de usuarios (la sesión ya identifica al usuario), así que un mensaje claro ("La contraseña actual no es correcta") es mejor UX sin costo de seguridad.

## Riesgos

- **Confusión entre el límite de intentos de login y el de cambio de contraseña:** al ser independientes, un usuario bloqueado en uno podría no estar bloqueado en el otro. Es la decisión correcta (ver arriba), pero conviene que el mensaje de error dentro de `/perfil` sea explícito sobre qué se bloqueó, para no confundir con el bloqueo de login.
- **`session.user.name` como identificador:** se confirmó en `auth.ts` y en `tests/api/cuentasCobro.route.test.ts` (`sesionValida = { user: { name: "dueno.taller" }, ... }`) que es el patrón ya usado en el resto de la app para identificar al usuario autenticado en rutas API — riesgo bajo.

## Fuera de alcance del plan

- No se toca `auth.ts`, `auth.config.ts` ni `middleware.ts` — `/perfil` queda protegida automáticamente por el matcher existente.
- No se modifica `services/authService.ts`.
- No se agrega recuperación de contraseña sin sesión.
