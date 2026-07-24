import { getDb } from "@/lib/mongodb";

const COUNTERS_COLLECTION = "counters";

interface CounterDoc {
  _id: string;
  seq: number;
}

/** Tipo de documento al que pertenece el consecutivo. Cada tipo tiene su propio contador. */
export type TipoConsecutivo = "cuenta-cobro" | "cotizacion";

/**
 * Devuelve el siguiente número secuencial para el año y tipo dados, usando un
 * contador atómico en MongoDB (findOneAndUpdate + $inc) para evitar
 * consecutivos duplicados si se crean varios documentos al mismo tiempo.
 * Cada `tipo` usa un contador independiente (`${tipo}-${anio}`), así que las
 * cotizaciones y las cuentas de cobro no comparten numeración.
 */
export async function getNextConsecutivo(
  anio: number,
  tipo: TipoConsecutivo = "cuenta-cobro"
): Promise<number> {
  const db = await getDb();
  const result = await db.collection<CounterDoc>(COUNTERS_COLLECTION).findOneAndUpdate(
    { _id: `${tipo}-${anio}` },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  if (!result) {
    throw new Error("No se pudo asignar el consecutivo del documento.");
  }

  return result.seq;
}

export function formatConsecutivo(anio: number, numero: number, prefijo = "CC"): string {
  return `${prefijo}-${anio}-${String(numero).padStart(4, "0")}`;
}
