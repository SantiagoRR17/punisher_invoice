# 001 · Login — Plan

_Cómo se implementa lo descrito en `spec.md`. Debe respetar la `constitution/`._

## Enfoque

La autenticación se resolverá con un proveedor de credenciales sobre Auth.js o una capa equivalente de autenticación de Next.js, usando bcrypt para comparar contraseñas y MongoDB como fuente de verdad de usuarios. La interfaz será una pantalla única, clara y responsive con estética glassmorphism.

## Implementación

0. Inicializar la base del proyecto (Next.js 15 + TypeScript + pnpm) con la estructura de carpetas de `tech-stack.md`, ya que el repositorio no tiene código todavía y esta es la primera feature que lo requiere.
1. Definir la configuración de autenticación y la lectura de usuarios desde MongoDB en `app/api/auth/[...nextauth]/route.ts` o el módulo equivalente.
2. Crear o ajustar la capa de acceso a datos para usuarios en `lib/` o `services/`, incluyendo la comparación de contraseñas con bcrypt.
3. Implementar la pantalla de login en `app/` o `components/` con estados de carga, error y redirección al menú principal.
4. Agregar pruebas para credenciales válidas, credenciales inválidas y render responsive.
5. Crear un script de seed (`scripts/`) para provisionar los usuarios autorizados, pensado para que el usuario del proyecto lo ejecute con credenciales reales; no se generan ni almacenan contraseñas reales en el repositorio.

## Decisiones

- **Credenciales contra base de datos** — se evita un registro abierto y se mantiene el control centralizado de acceso.
- **Auth.js con bcrypt** — se aprovecha una solución estándar del ecosistema Next.js en lugar de una autenticación artesanal.
- **Sin botones sociales** — se elimina ruido funcional porque el acceso debe ser privado y directo.
- **Conexión a Mongo Atlas real pospuesta** — para esta feature solo se documenta la variable de entorno (`.env.local.example`) y se valida contra una base en memoria (Mongo Memory Server); conectar a Atlas real queda fuera de alcance y a criterio del usuario.
- **Seed script en vez de registro** — mantiene la regla de "sin registro" del spec, delegando en el usuario del proyecto la creación de usuarios reales fuera del repositorio versionado.

## Riesgos

- **Contraseñas mal hashadas o inconsistentes** — mitigar con validación del formato almacenado y pruebas de autenticación.
- **Bloqueo por mala configuración de sesión o callback** — mitigar con un flujo de redirección simple y validado en pruebas.
- **Problemas de responsive o contraste** — mitigar validando el formulario en pantallas pequeñas antes de cerrar la feature.
