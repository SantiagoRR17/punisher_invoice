# 002 · Menú principal — Plan

_Cómo se implementa lo descrito en `spec.md`. Debe respetar la `constitution/`._

## Enfoque

El menú se implementará como una pantalla de navegación simple con dos tarjetas o botones principales, reutilizando estilos visuales compartidos para mantener coherencia con el login y con los formularios posteriores.

## Implementación

1. Reemplazar el stub `app/menu/page.tsx` (creado como placeholder en la feature 001) con la vista principal real.
2. Construir el componente visual con dos accesos: cotización y cuenta de cobro.
3. Crear páginas placeholder `app/cotizacion/page.tsx` y `app/cuenta-cobro/page.tsx` (mismo patrón que el stub de `/menu` en la feature 001) como destino de cada acceso, pendientes de las features 003 y 004.
4. Agregar un botón de "Cerrar sesión" que invoque `signOut` de Auth.js (`next-auth/react`) y regrese a `/login`.
5. Verificar que la pantalla responda correctamente en distintos tamaños.

## Decisiones

- **Navegación directa** — se prioriza el acceso inmediato a las dos funciones principales del negocio.
- **Sin redes sociales** — se elimina contenido ajeno al flujo operativo.
- **Estilo compartido** — el menú debe sentirse parte del mismo sistema que el login y los formularios.
- **Rutas placeholder para features 003/004** — `/cotizacion` y `/cuenta-cobro` se crean como páginas stub (igual que se hizo con `/menu` en la feature 001), para no bloquear la navegación mientras esas features no existen.
- **Cerrar sesión en esta feature** — no había forma de terminar sesión tras la feature 001; se agrega aquí por ser el lugar natural de navegación post-login, usando la infraestructura de Auth.js ya existente (no se construye autenticación nueva).

## Riesgos

- **Confusión entre accesos si el diseño es demasiado decorativo** — mitigar con etiquetas claras y jerarquía visual simple.
- **Rutas mal enlazadas** — mitigar con pruebas de navegación y verificación manual de enlaces.
- **Desalineación visual con las demás pantallas** — mitigar reutilizando tokens y componentes comunes.
