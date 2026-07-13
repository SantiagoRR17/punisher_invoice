import { getDb } from "@/lib/mongodb";
import type { Cotizacion } from "@/models/Cotizacion";

const COTIZACIONES_COLLECTION = "cotizaciones";

export async function saveCotizacion(
  cotizacion: Omit<Cotizacion, "_id" | "createdAt">
): Promise<string> {
  const db = await getDb();
  const result = await db.collection<Omit<Cotizacion, "_id">>(COTIZACIONES_COLLECTION).insertOne({
    ...cotizacion,
    createdAt: new Date(),
  });

  return result.insertedId.toString();
}
