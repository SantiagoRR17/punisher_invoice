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
pnpm run seed:users -- --username <usuario> --password <password> --role jefe|contadora
```

Requiere `MONGODB_URI` y `MONGODB_DB` configurados en `.env.local` (copiar desde `.env.local.example`). La contraseña se hashea con bcrypt antes de guardarse; nunca se almacena en texto plano ni se versiona en el repositorio.

## Actualización posterior

- Conexión real a MongoDB Atlas: configurada y validada por el usuario (ver `specs/features/001-login/spec.md`).
- Contenido real de `/menu`: ya implementado en la feature `002-menu-principal` (ver `DOCS/002-menu-principal.md`); dejó de ser un placeholder.

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
