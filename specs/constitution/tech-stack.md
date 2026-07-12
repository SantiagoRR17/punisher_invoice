# Tech stack y convenciones

_Cómo está construido el proyecto y las reglas que todo el código debe respetar. Esta es la referencia técnica que ningún plan de feature debería contradecir._

## Tecnologías

- **Lenguaje:** TypeScript 5.x, HTML 5, CSS 3, JavaScript moderno
- **Framework / runtime:** Next.js 15.x + React 19.x
- **Base de datos:** MongoDB Atlas
- **Autenticación:** Auth.js / NextAuth compatible con bcrypt
- **PDF:** librería de generación de PDF compatible con el runtime de Next.js
- **Tests unitarios e integración:** Vitest 2.x + React Testing Library 16.x + Mongo Memory Server
- **E2E:** Playwright 1.x
- **Despliegue:** Vercel
- **Gestor de paquetes:** pnpm 9.x o superior

## Archivos / módulos clave

_Mapa breve de dónde vive cada cosa. Solo lo que un recién llegado necesita para orientarse._

- `app/` — Páginas de la aplicación usando App Router.
- `app/api/` — Route Handlers para autenticación, cotizaciones, cuentas de cobro, PDF y consecutivos.
- `components/` — Componentes reutilizables de interfaz.
- `lib/` — Conexión a MongoDB, helpers, validaciones y utilidades.
- `models/` — Tipos e interfaces de TypeScript.
- `services/` — Lógica de negocio y acceso a datos.
- `hooks/` — Hooks personalizados de React.
- `public/` — Recursos estáticos como logo, firma, iconos e imágenes.
- `styles/` — Estilos globales y tokens visuales.
- `tests/` — Pruebas unitarias, de integración y E2E.
- `DOCS/` — Documentación funcional y técnica por pantalla o feature.
- `.env.local` — Variables de entorno locales, nunca versionadas.

## Comandos

- `pnpm run dev` — Arranca el servidor de desarrollo.
- `pnpm run build` — Genera la versión de producción.
- `pnpm run start` — Ejecuta la aplicación compilada.
- `pnpm run lint` — Ejecuta ESLint.
- `pnpm run test` — Ejecuta las pruebas unitarias.
- `pnpm run test:watch` — Ejecuta las pruebas en modo observación.
- `pnpm run test:e2e` — Ejecuta las pruebas end-to-end.
- `pnpm run format` — Formatea el código.

## Convenciones

_Reglas de estilo y patrones a seguir. Nombres, organización, manejo de errores, validación, idioma del contenido, etc._

- Los identificadores del código van en inglés y el contenido visible al usuario va en español.
- Las funciones, variables y archivos funcionales deben usar `camelCase` o nombres descriptivos consistentes.
- Los tests deben vivir en `tests/` o cerca del módulo que prueban, usando nombres explícitos como `cotizacion.test.ts`.
- Los campos numéricos deben validarse antes de calcular totales o guardar datos.
- La documentación funcional debe vivir en `DOCS/`, con un archivo por pantalla o por feature relevante.
- Toda feature debe documentar errores previsibles, validaciones y comportamiento esperado.

## Estilo visual

_Solo si el proyecto tiene interfaz. Tema, colores/tokens, tipografías, responsive. Omite si no aplica._

- El encabezado debe usar una paleta metalizada con base en `#1B2A31` y `#215866`.
- El fondo general debe mantenerse en `#F6F6F6` o un equivalente muy cercano.
- Los formularios de cotización y cuenta de cobro deben tener un pie visual oscuro tipo metalizado con un icono editable relacionado con soldadura.
- La tipografía de títulos será Inter SemiBold y el contenido Inter Regular.
- La interfaz debe ser responsive para escritorio, tablet y móvil.
- La interfaz de los formularios deberá seguir el diseño de encabezados, footer y tabla de productos que se propone en '../../template_model.jpeg'

## Límites duros

_Lo que NUNCA se debe hacer. Reglas de seguridad, dependencias prohibidas, zonas congeladas._

- No añadir dependencias sin avisar.
- No subir `.env*` al repositorio.
- No usar `npm`; si se requiere gestor de paquetes, usar `pnpm`.
- No dejar versiones ambiguas cuando la tecnología pueda fijarse en la documentación.
- No permitir acceso público general; solo usuarios autorizados.
- No reiniciar el consecutivo de cuentas de cobro sin autorización y justificación.
- No modificar la base de datos real sin autorización explícita.
- Sí se pueden definir métodos de creación y edición, además de pruebas y documentación, pero sin afectar datos reales sin permiso.
