# Menú principal

Documentación funcional y técnica de la pantalla de menú. Ver también `specs/features/002-menu-principal/`.

## Comportamiento

- Ruta protegida: `/menu` (requiere sesión válida; `middleware.ts` redirige a `/login` en caso contrario, agregando `callbackUrl` para volver aquí tras iniciar sesión).
- Muestra un título, un subtítulo y dos accesos (`components/LogoutButton.tsx` + enlaces `next/link`) con estilo glassmorphism coherente con `/login`.
- Acceso "Cotización" → `/cotizacion` (placeholder de la feature `003-formulario-cotizacion`).
- Acceso "Cuenta de cobro" → `/cuenta-cobro` (placeholder de la feature `004-formulario-cuenta-cobro`).
- Botón "Cerrar sesión" (`components/LogoutButton.tsx`) invoca `signOut({ callbackUrl: "/login" })` de `next-auth/react` y termina la sesión JWT.

## Rutas placeholder

`app/cotizacion/page.tsx` y `app/cuenta-cobro/page.tsx` son páginas mínimas que solo indican que la pantalla real llega con su feature correspondiente. Se reemplazan por completo cuando se implementen las features 003 y 004 (mismo patrón usado para el stub de `/menu` durante la feature 001).

## Errores previsibles

| Situación | Comportamiento esperado |
| --- | --- |
| Acceso a `/menu` sin sesión iniciada | Redirección a `/login?callbackUrl=...` |
| Click en "Cerrar sesión" | Termina la sesión y redirige a `/login` |
| Click en los accesos a cotización/cuenta de cobro | Navega a la página placeholder correspondiente, sin errores en consola |

## Pruebas

- `tests/components/MenuPage.test.tsx` — presencia y `href` de los dos accesos, presencia del botón de cerrar sesión.
- `tests/components/LogoutButton.test.tsx` — render del botón e invocación de `signOut` con `callbackUrl: "/login"`.
- `tests/e2e/menu.spec.ts` — smoke test de protección de ruta (`/menu` sin sesión redirige a `/login`).
- QA manual en navegador (login real contra MongoDB Atlas, viewports 1280×800 y 375×667, navegación a ambos placeholders y logout) — sin errores de consola.
