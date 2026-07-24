import { ObjectId } from "mongodb";
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

export async function listCotizaciones(): Promise<Cotizacion[]> {
  const db = await getDb();
  const cotizaciones = await db
    .collection<Cotizacion>(COTIZACIONES_COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  // `abono` se normaliza a 0 para cotizaciones creadas antes de la feature 011,
  // que no guardaban ese campo (evita mostrar "$ NaN" en el historial).
  return cotizaciones.map((cotizacion) => ({
    ...cotizacion,
    _id: cotizacion._id?.toString(),
    abono: cotizacion.abono ?? 0,
  }));
}

export async function getCotizacion(id: string): Promise<Cotizacion | null> {
  if (!ObjectId.isValid(id)) return null;

  const db = await getDb();
  const cotizacion = await db
    .collection<Cotizacion>(COTIZACIONES_COLLECTION)
    .findOne({ _id: new ObjectId(id) as unknown as string });

  return cotizacion
    ? { ...cotizacion, _id: cotizacion._id?.toString(), abono: cotizacion.abono ?? 0 }
    : null;
}

export class CotizacionNoEncontradaError extends Error {
  constructor() {
    super("No se encontró la cotización.");
    this.name = "CotizacionNoEncontradaError";
  }
}

export async function updateCotizacion(
  id: string,
  input: NuevaCotizacionInput
): Promise<CotizacionGuardada> {
  if (!ObjectId.isValid(id)) {
    throw new CotizacionNoEncontradaError();
  }

  const total = input.items.reduce((sum, item) => sum + item.cantidad * item.valorUnitario, 0);
  const abono = input.abono;
  const saldo = total - abono;

  const db = await getDb();
  // Conserva consecutivo, anio, numero, fecha y createdAt: solo se actualizan
  // los datos editables (cliente, ítems, total, abono).
  const resultado = await db
    .collection<Cotizacion>(COTIZACIONES_COLLECTION)
    .findOneAndUpdate(
      { _id: new ObjectId(id) as unknown as string },
      { $set: { cliente: input.cliente, items: input.items, total, abono } },
      { returnDocument: "after" }
    );

  if (!resultado) {
    throw new CotizacionNoEncontradaError();
  }

  return { consecutivo: resultado.consecutivo, total, abono, saldo, fecha: resultado.fecha };
}
