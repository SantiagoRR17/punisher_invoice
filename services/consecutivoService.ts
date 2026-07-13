import { getDb } from "@/lib/mongodb";

const COUNTERS_COLLECTION = "counters";

interface CounterDoc {
  _id: string;
  seq: number;
}

/**
 * Devuelve el siguiente número secuencial para el año dado, usando un
 * contador atómico en MongoDB (findOneAndUpdate + $inc) para evitar
 * consecutivos duplicados si se crean varias cuentas al mismo tiempo.
 */
export async function getNextConsecutivo(anio: number): Promise<number> {
  const db = await getDb();
  const result = await db.collection<CounterDoc>(COUNTERS_COLLECTION).findOneAndUpdate(
    { _id: `cuenta-cobro-${anio}` },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  if (!result) {
    throw new Error("No se pudo asignar el consecutivo de la cuenta de cobro.");
  }

  return result.seq;
}

export function formatConsecutivo(anio: number, numero: number): string {
  return `CC-${anio}-${String(numero).padStart(4, "0")}`;
}
