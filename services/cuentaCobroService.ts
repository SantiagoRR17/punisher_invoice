import { getDb } from "@/lib/mongodb";
import { getNextConsecutivo, formatConsecutivo } from "@/services/consecutivoService";
import type { AbonoCuentaCobro, ClienteCuentaCobro, CuentaCobro, ItemCuentaCobro } from "@/models/CuentaCobro";

const CUENTAS_COBRO_COLLECTION = "cuentasCobro";

export interface NuevaCuentaCobroInput {
  cliente: ClienteCuentaCobro;
  items: ItemCuentaCobro[];
  abonoInicial: number;
}

export interface CuentaCobroGuardada {
  consecutivo: string;
  total: number;
  saldo: number;
  fecha: Date;
}

export async function saveCuentaCobro(input: NuevaCuentaCobroInput): Promise<CuentaCobroGuardada> {
  const total = input.items.reduce((sum, item) => sum + item.cantidad * item.valorUnitario, 0);
  const abonos: AbonoCuentaCobro[] =
    input.abonoInicial > 0 ? [{ valor: input.abonoInicial, fecha: new Date() }] : [];
  const saldo = total - input.abonoInicial;

  const fecha = new Date();
  const anio = fecha.getFullYear();
  const numero = await getNextConsecutivo(anio);
  const consecutivo = formatConsecutivo(anio, numero);

  const db = await getDb();
  const cuenta: Omit<CuentaCobro, "_id"> = {
    consecutivo,
    anio,
    numero,
    cliente: input.cliente,
    items: input.items,
    total,
    abonos,
    saldo,
    fecha,
    createdAt: new Date(),
  };

  await db.collection<Omit<CuentaCobro, "_id">>(CUENTAS_COBRO_COLLECTION).insertOne(cuenta);

  return { consecutivo, total, saldo, fecha };
}

export async function listCuentasCobro(): Promise<CuentaCobro[]> {
  const db = await getDb();
  const cuentas = await db
    .collection<CuentaCobro>(CUENTAS_COBRO_COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return cuentas.map((cuenta) => ({ ...cuenta, _id: cuenta._id?.toString() }));
}

export class SaldoInsuficienteError extends Error {
  constructor() {
    super("El abono no puede ser mayor al saldo pendiente.");
    this.name = "SaldoInsuficienteError";
  }
}

export class CuentaCobroNoEncontradaError extends Error {
  constructor() {
    super("No se encontró la cuenta de cobro.");
    this.name = "CuentaCobroNoEncontradaError";
  }
}

export async function registrarAbono(consecutivo: string, valor: number): Promise<CuentaCobro> {
  const db = await getDb();
  const collection = db.collection<CuentaCobro>(CUENTAS_COBRO_COLLECTION);

  if (valor <= 0) {
    throw new SaldoInsuficienteError();
  }

  const nuevoAbono: AbonoCuentaCobro = { valor, fecha: new Date() };

  // Validación y escritura en una sola operación atómica: la condición del
  // saldo va en el filtro, así dos abonos simultáneos nunca se pisan entre sí.
  const resultado = await collection.findOneAndUpdate(
    { consecutivo, saldo: { $gte: valor } },
    { $push: { abonos: nuevoAbono }, $inc: { saldo: -valor } },
    { returnDocument: "after" }
  );

  if (!resultado) {
    const existente = await collection.findOne({ consecutivo });
    if (!existente) {
      throw new CuentaCobroNoEncontradaError();
    }
    throw new SaldoInsuficienteError();
  }

  return { ...resultado, _id: resultado._id?.toString() };
}
