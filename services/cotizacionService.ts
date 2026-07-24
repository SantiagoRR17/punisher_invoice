import { getDb } from "@/lib/mongodb";
import { getNextConsecutivo, formatConsecutivo } from "@/services/consecutivoService";
import type { ClienteCotizacion, Cotizacion, ItemCotizacion } from "@/models/Cotizacion";

const COTIZACIONES_COLLECTION = "cotizaciones";

export interface NuevaCotizacionInput {
  cliente: ClienteCotizacion;
  items: ItemCotizacion[];
  abono: number;
}

export interface CotizacionGuardada {
  consecutivo: string;
  total: number;
  abono: number;
  saldo: number;
  fecha: Date;
}

export async function saveCotizacion(input: NuevaCotizacionInput): Promise<CotizacionGuardada> {
  const total = input.items.reduce((sum, item) => sum + item.cantidad * item.valorUnitario, 0);
  const abono = input.abono;
  const saldo = total - abono;

  const fecha = new Date();
  const anio = fecha.getFullYear();
  const numero = await getNextConsecutivo(anio, "cotizacion");
  const consecutivo = formatConsecutivo(anio, numero, "COT");

  const db = await getDb();
  const cotizacion: Omit<Cotizacion, "_id"> = {
    consecutivo,
    anio,
    numero,
    cliente: input.cliente,
    items: input.items,
    total,
    abono,
    fecha,
    createdAt: new Date(),
  };

  await db.collection<Omit<Cotizacion, "_id">>(COTIZACIONES_COLLECTION).insertOne(cotizacion);

  return { consecutivo, total, abono, saldo, fecha };
}
