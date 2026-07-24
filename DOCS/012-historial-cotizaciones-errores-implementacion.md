# 012 · Errores de implementación

Registro de errores encontrados y resueltos durante la implementación de la feature 012.

## 1. Consulta por `_id` (ObjectId) contra una colección tipada con `_id: string`

- **Causa:** el modelo `Cotizacion` declara `_id?: string`, pero en Mongo el `_id` es un `ObjectId`. `getCotizacion`/`updateCotizacion` necesitan filtrar por `{ _id: new ObjectId(id) }`, lo que TypeScript rechaza contra `db.collection<Cotizacion>`.
- **Solución:** se importó `ObjectId` de `mongodb` y se validó el id con `ObjectId.isValid` antes de construirlo (devolviendo `null`/`CotizacionNoEncontradaError` para ids inválidos). El filtro usa `new ObjectId(id) as unknown as string` para satisfacer el tipo sin cambiar el modelo. Es el primer punto del código que consulta por `_id`; el resto usa `consecutivo`.

## 2. Cotizaciones previas a la feature 011 sin `abono` mostraban "$ NaN"

- **Causa:** las cotizaciones creadas antes de la 011 no tienen el campo `abono`. `formatCurrencyCOP(undefined)` produce `"$ NaN"`, que se vería en las columnas Abono/Saldo del historial.
- **Solución:** `listCotizaciones` y `getCotizacion` normalizan `abono` a `0` al leer (sin backfill en la base). Además, la lista usa `_id` como clave de fila (en vez del `consecutivo`, que en esos registros antiguos puede faltar) para evitar claves de React duplicadas.

## 3. Validación específica de Next para rutas dinámicas y páginas server

- **Causa:** en Next 15 los `params` de rutas dinámicas y páginas son `Promise`; un tipado incorrecto rompe el `pnpm build` aunque `tsc` pase.
- **Solución:** tanto `app/api/cotizaciones/[id]/route.ts` como `app/cotizacion/[id]/editar/page.tsx` tipan `params: Promise<{ id: string }>` y hacen `await params`. `pnpm build` completó con `/cotizacion/[id]/editar` como ruta dinámica (ƒ) y `/api/cotizaciones/[id]` reconocida.

## 4. Botones de acción muy pequeños y pegados en móvil (feedback del usuario)

- **Causa:** los botones de acción de los historiales (`Ver detalle`, `Descargar PDF`, `Editar`) usan la clase compartida `.linkButton`, que son enlaces de texto subrayado pequeños; en móvil se apilaban con poca separación y un área de toque mínima. Afectaba tanto al historial de cotizaciones (nuevo) como al de cuentas de cobro (existente), al compartir `HistorialList.module.css`.
- **Solución:** en la media query `max-width: 640px` se convirtieron en botones tipo pill a ancho completo (borde, `padding` 0.65rem, `font-size` 0.95rem, `align-items: stretch`, `gap` 0.6rem). En escritorio se conservan como enlaces subrayados. Mejora ambos historiales por igual.

## Nota sobre validación visual

Las pestañas, el listado de cotizaciones y el formulario en modo edición se validaron por `tsc`, tests (100/100) y `pnpm build`. La revisión visual (pestañas, tabla, responsive 1280×800 / 375×667 y el PDF re-descargado/editado) queda pendiente de la validación manual del usuario en el navegador.
