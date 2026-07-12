# spec/ — documentación SDD del proyecto

Este directorio concentra la documentación guiada por especificación del proyecto web. El flujo de trabajo es fijo: primero se define la intención del producto en la constitución, luego cada feature se redacta en `spec.md`, se aterriza en `plan.md` y finalmente se divide en `tasks.md` antes de implementar.

## Cómo usarlo

1. Mantener `constitution/` como referencia estable del proyecto.
2. Crear una carpeta por feature en `features/NNN-nombre-feature/`.
3. Completar `spec.md` con comportamiento observable y criterios de aceptación.
4. Completar `plan.md` con decisiones técnicas alineadas con la constitución.
5. Desglosar `tasks.md` en acciones pequeñas y verificables.
6. Ejecutar la implementación solo después de cerrar la documentación.

## Estructura

```
spec/
├── constitution/
│   ├── mission.md
│   ├── tech-stack.md
│   └── roadmap.md
└── features/
    └── NNN-nombre-feature/
        ├── spec.md
        ├── plan.md
        └── tasks.md
```

## Regla principal

La constitución manda. Si una feature contradice `mission.md`, `tech-stack.md` o `roadmap.md`, se corrige la feature o se vuelve a decidir el alcance antes de tocar código.
