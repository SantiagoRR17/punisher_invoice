/**
 * Script para subir un asset de marca sensible (ej. la firma) a MongoDB,
 * sin que el archivo quede commiteado en el repositorio (ver
 * `specs/features/006-mejoras-visuales-pdf/`).
 *
 * Uso:
 *   1. Completa .env.local con MONGODB_URI y MONGODB_DB reales.
 *   2. Ejecuta: pnpm run upload:brand-asset -- --nombre firma --archivo ruta/al/firma.png
 */
import { readFile } from "fs/promises";
import { extname } from "path";
import { config as loadEnv } from "dotenv";
import { upsertBrandAsset } from "../services/brandAssetService";

loadEnv({ path: ".env.local" });

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const value = argv[i + 1];
      args[key] = value;
      i += 1;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { nombre, archivo } = args;

  if (!nombre || !archivo) {
    console.error(
      "Uso: pnpm run upload:brand-asset -- --nombre <nombre> --archivo <ruta-al-archivo>"
    );
    process.exit(1);
  }

  const contentType = CONTENT_TYPES[extname(archivo).toLowerCase()];
  if (!contentType) {
    console.error(`Extensión no soportada en "${archivo}". Usa .png, .jpg o .jpeg.`);
    process.exit(1);
  }

  const data = await readFile(archivo);
  await upsertBrandAsset(nombre, data, contentType);

  console.log(`Asset "${nombre}" (${contentType}, ${data.length} bytes) subido correctamente.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Error al subir el asset de marca:", error);
  process.exit(1);
});
