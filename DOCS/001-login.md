# Login

Documentación funcional y técnica de la pantalla de acceso. Ver también `specs/features/001-login/`.

## Comportamiento

- Ruta pública: `/login`.
- Formulario con usuario y contraseña (`components/LoginForm.tsx`).
- Al enviar, se llama a Auth.js (`signIn("credentials", ...)`), que ejecuta `services/authService.ts` para comparar la contraseña contra el hash bcrypt guardado en MongoDB (colección `users`).
- Si las credenciales son correctas, se redirige a `/menu`.
- Si son incorrectas, se muestra el mensaje "Usuario o contraseña inválidos." sin indicar cuál de los dos campos falló.
- `middleware.ts` protege el resto de rutas: sin sesión válida, cualquier ruta que no sea `/login` redirige a `/login`.

## Provisión de usuarios

No hay pantalla de registro. Los usuarios autorizados se crean con el script `scripts/seedUsers.ts`:

```
pnpm run seed:users -- --username <usuario> --password <password> --role dueno|contadora
```

Requiere `MONGODB_URI` y `MONGODB_DB` configurados en `.env.local` (copiar desde `.env.local.example`). La contraseña se hashea con bcrypt antes de guardarse; nunca se almacena en texto plano ni se versiona en el repositorio.

## Pendiente fuera de esta feature

- Conexión real a MongoDB Atlas: por ahora solo existe la variable documentada en `.env.local.example`. La conexión real la configura el usuario del proyecto cuando lo decida.
- Contenido real de `/menu`: esta feature solo agrega una página placeholder como destino de redirección; el contenido completo es la feature `002-menu-principal`.

## Errores previsibles

| Situación | Comportamiento esperado |
| --- | --- |
| Usuario no existe | Mensaje de error genérico, sin redirección |
| Contraseña incorrecta | Mensaje de error genérico, sin redirección |
| Campos vacíos | El formulario exige ambos campos (`required`) antes de enviar |
| `MONGODB_URI` no configurado | La autenticación falla con un error de configuración al intentar consultar la base de datos |

## Pruebas

- `tests/services/authService.test.ts` — credenciales válidas/inválidas/usuario inexistente, contra Mongo Memory Server.
- `tests/components/LoginForm.test.tsx` — render del formulario, redirección en éxito, mensaje de error en fallo.
- `tests/e2e/login.spec.ts` — smoke test de render del formulario en escritorio y viewport móvil.
