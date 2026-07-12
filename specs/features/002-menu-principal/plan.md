# 002 · Menú principal — Plan

_Cómo se implementa lo descrito en `spec.md`. Debe respetar la `constitution/`._

## Enfoque

El menú se implementará como una pantalla de navegación simple con dos tarjetas o botones principales, reutilizando estilos visuales compartidos para mantener coherencia con el login y con los formularios posteriores.

## Implementación

1. Crear la vista principal en `app/` o la ruta equivalente del menú.
2. Construir el componente visual con dos accesos: cotización y cuenta de cobro.
3. Conectar cada acceso con la ruta del formulario correspondiente.
4. Verificar que la pantalla responda correctamente en distintos tamaños.

## Decisiones

- **Navegación directa** — se prioriza el acceso inmediato a las dos funciones principales del negocio.
- **Sin redes sociales** — se elimina contenido ajeno al flujo operativo.
- **Estilo compartido** — el menú debe sentirse parte del mismo sistema que el login y los formularios.

## Riesgos

- **Confusión entre accesos si el diseño es demasiado decorativo** — mitigar con etiquetas claras y jerarquía visual simple.
- **Rutas mal enlazadas** — mitigar con pruebas de navegación y verificación manual de enlaces.
- **Desalineación visual con las demás pantallas** — mitigar reutilizando tokens y componentes comunes.
