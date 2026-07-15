import { getDb } from "@/lib/mongodb";
import type { BrandAsset } from "@/models/BrandAsset";

const BRAND_ASSETS_COLLECTION = "brandAssets";

export async function getBrandAsset(nombre: string): Promise<BrandAsset | null> {
  const db = await getDb();
  const asset = await db.collection<BrandAsset>(BRAND_ASSETS_COLLECTION).findOne({ nombre });
  if (!asset) return null;

  // El driver de MongoDB devuelve los binarios como BSON Binary, no como Buffer nativo.
  const data = Buffer.isBuffer(asset.data) ? asset.data : Buffer.from((asset.data as unknown as { buffer: Buffer }).buffer);
  return { ...asset, data };
}

export async function upsertBrandAsset(
  nombre: string,
  data: Buffer,
  contentType: string
): Promise<void> {
  const db = await getDb();
  await db
    .collection<BrandAsset>(BRAND_ASSETS_COLLECTION)
    .updateOne({ nombre }, { $set: { nombre, data, contentType, updatedAt: new Date() } }, { upsert: true });
}
