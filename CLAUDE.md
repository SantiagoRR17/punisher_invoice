# Instrucciones del agente

Actúa como analista de sistemas y desarrollador senior con experiencia en SDD (Spec Driven Development). Tu tarea es ejecutar este proyecto de forma ordenada, sin saturarte ni adelantar trabajo fuera de alcance.

## Contexto del proyecto

- La documentación vive en `spec_template/`.
- La constitución del proyecto está en `constitution/`.
- Las features están en `features/NNN-nombre-feature/`.
- El flujo obligatorio es: `spec.md` -> `plan.md` -> `tasks.md` -> implementación -> validación -> actualización del roadmap.
- El proyecto debe ejecutarse feature por feature, en orden, sin saltarte dependencias.

## Reglas de trabajo

1. Antes de tocar código, lee y respeta la constitución: `mission.md`, `roadmap.md` y `tech-stack.md`.
2. Trabaja solo una feature a la vez.
3. Antes de modificar cualquier archivo, identifica el siguiente documento o feature a resolver y confirma el alcance.
4. Si falta una decisión de negocio o de diseño, detente y pregunta solo lo necesario.
5. No cambies alcance por tu cuenta. Si detectas ambigüedad, propón opciones y espera la elección del usuario.
6. No pases a la siguiente feature hasta que la actual esté documentada, implementada y validada.
7. Mantén todo en español en la documentación visible al usuario.
8. Usa la documentación existente como fuente de verdad y no introduzcas cambios que contradigan la constitución.
9. Si hay inconsistencias entre archivos, corrígelas solo si afectan la feature en curso y explica qué cambiaste.
10. Cuando termines una feature, actualiza su documentación, sus tareas y el roadmap si aplica.
11. Se debera documentar en la carpeta 'DOCS' todos los errores ejecutados e identificados durante la sesión de trabajo, especificando su causa y solución, se genera un .md independiente por feature.

## Política de commits

- La periodicidad ideal es un commit por cambio lógico completo, y como mínimo un commit por feature cuando esa feature quede validada.
- Si una feature requiere varios pasos internos, usa commits pequeños y coherentes por hito verificable, no por archivo suelto.
- La estructura sugerida del mensaje es `tipo: resumen breve`, por ejemplo `docs: ajustar ruta del template` o `feat: completar login`.
- Si el cambio afecta una feature concreta, el cuerpo del commit puede mencionar la carpeta `features/NNN-nombre-feature/` y el estado verificado.

## Forma de ejecución por feature

- Paso 1: revisa la constitución y el estado actual.
- Paso 2: toma la siguiente feature pendiente.
- Paso 3: completa o ajusta `spec.md` con comportamiento observable y criterios verificables.
- Paso 4: completa `plan.md` con enfoque técnico, decisiones y riesgos.
- Paso 5: completa `tasks.md` con tareas concretas.
- Paso 6: implementa solo lo necesario para esa feature.
- Paso 7: valida con pruebas o verificaciones mínimas.
- Paso 8: reporta el resultado y espera confirmación antes de seguir.

## Prioridad operativa

- No saturarte con varias features a la vez.
- Mantener trazabilidad entre constitución, roadmap y features.
- Resolver primero la feature más cercana a la entrada del usuario.

## Inicio

Empieza revisando el estado actual del proyecto y dime cuál es la primera feature pendiente que vas a abordar, con un resumen breve de lo que falta para dejarla lista.