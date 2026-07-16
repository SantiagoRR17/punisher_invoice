# 008 · Medios de pago y QR en cotización — Errores durante la implementación

## 1. Script de QA visual falla con "React is not defined" al ejecutar JSX vía `tsx`

**Qué pasó:** Al crear un script temporal (`scripts/tmpRenderCotizacionQr.tsx`) para renderizar la cotización con datos de prueba y revisar el PDF resultante, la primera ejecución (`npx tsx scripts/tmpRenderCotizacionQr.tsx`) falló con `ReferenceError: React is not defined`, tanto en el propio script como luego dentro de `CotizacionPdf.tsx`.

**Causa:** `tsconfig.json` del proyecto tiene `"jsx": "preserve"` (pensado para el bundler de Next.js, que aplica su propia transformación). `tsx` (el runner, vía esbuild) interpreta ese valor como transformación **clásica** (`React.createElement`), que requiere `React` en el alcance de cada archivo con JSX — pero ni el script ni los componentes de `components/pdf/` importan `React` explícitamente (el proyecto usa el runtime automático de React 19 en el resto de la app, vía Next.js).

**Cómo se corrigió:** Se creó un `scripts/tmpTsconfig.json` temporal que extiende el `tsconfig.json` real pero sobreescribe `"jsx": "react-jsx"` (runtime automático), y se ejecutó el script con la variable de entorno `TSX_TSCONFIG_PATH=scripts/tmpTsconfig.json`. Con eso el script y los componentes importados se transforman correctamente sin necesitar `import React` en cada archivo. Mismo tipo de problema que documentó la feature 007 al intentar previsualizar el logo fuera del navegador (limitación del entorno de Node, no un defecto de la app). Ambos archivos (`tmpRenderCotizacionQr.tsx`, `tmpTsconfig.json`) se borraron al terminar la QA, nunca se commitearon.

## 2. Dos pruebas fallaron en la primera corrida completa de `pnpm run test`, pasaron al repetir

**Qué pasó:** La primera ejecución de la suite completa (`pnpm run test`) tras los cambios de código mostró 2 fallos: `CotizacionForm > guarda la cotización y descarga el PDF...` y `CuentaCobroForm > guarda la cuenta de cobro y descarga el PDF...`, ambos con timeout dentro de un `waitFor`.

**Diagnóstico:** El log de esa corrida mostró tiempos de entorno muy altos (`environment 166.42s`, `setup 34.02s`) comparado con corridas posteriores (`environment ~28s`, `setup ~5s`) — consistente con el entorno (Windows, primera carga en frío de la suite completa con 16 archivos de test) tardando más que el timeout por defecto de `waitFor`, no con un defecto introducido por los cambios de esta feature. `CuentaCobroForm.tsx` ni `CuentaCobroPdf.tsx` tuvieron cambios que afecten ese flujo (solo el texto de cierre, que no se verifica en ese test).

**Cómo se corrigió:** No hizo falta ningún cambio de código. Se repitió `pnpm run test` dos veces más y las 64 pruebas pasaron de forma estable ambas veces.
