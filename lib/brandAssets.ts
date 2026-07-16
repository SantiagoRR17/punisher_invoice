function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Obtiene la firma real desde el servidor (nunca vive en el repo ni en public/,
 * ver `specs/features/006-mejoras-visuales-pdf/`). Si todavía no se ha subido
 * o falla la petición, devuelve `undefined` sin interrumpir la generación del PDF.
 */
export async function fetchFirmaDataUrl(): Promise<string | undefined> {
  try {
    const response = await fetch("/api/brand-assets/firma");
    if (!response.ok) return undefined;
    return await blobToDataUrl(await response.blob());
  } catch {
    return undefined;
  }
}

/**
 * Obtiene el QR de pagos real desde el servidor (mismo mecanismo que la
 * firma, ver `specs/features/007-rediseno-pdf-v2/`). Si todavía no se ha
 * subido o falla la petición, devuelve `undefined` sin interrumpir la
 * generación del PDF (se muestra el placeholder).
 */
export async function fetchQrDataUrl(): Promise<string | undefined> {
  try {
    const response = await fetch("/api/brand-assets/qr");
    if (!response.ok) return undefined;
    return await blobToDataUrl(await response.blob());
  } catch {
    return undefined;
  }
}
