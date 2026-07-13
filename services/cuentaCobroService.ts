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
