import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { getDb } from "@/lib/mongodb";
import { saveCuentaCobro } from "@/services/cuentaCobroService";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.MONGODB_DB = "punisher_invoice_test";
});

afterAll(async () => {
  await mongoServer.stop();
});

const cliente = {
  tratamiento: "Señora" as const,
  nombre: "Nohora Stella Coronado",
  cedula: "51.607.476",
  direccion: "Cl 74a #78 16",
  barrio: "Tabora",
};

describe("saveCuentaCobro", () => {
  it("calcula el total, asigna consecutivo y guarda la cuenta con abono cero", async () => {
    const resultado = await saveCuentaCobro({
      cliente,
      items: [{ descripcion: "Mantenimiento de portón", cantidad: 2, valorUnitario: 100000 }],
      abonoInicial: 0,
    });

    expect(resultado.total).toBe(200000);
    expect(resultado.saldo).toBe(200000);
    expect(resultado.consecutivo).toMatch(/^CC-\d{4}-0001$/);

    const db = await getDb();
    const stored = await db.collection("cuentasCobro").findOne({ consecutivo: resultado.consecutivo });

    expect(stored?.abonos).toEqual([]);
  });

  it("calcula el saldo pendiente cuando hay un abono inicial", async () => {
    const resultado = await saveCuentaCobro({
      cliente,
      items: [{ descripcion: "Reparación de reja", cantidad: 1, valorUnitario: 500000 }],
      abonoInicial: 250000,
    });

    expect(resultado.total).toBe(500000);
    expect(resultado.saldo).toBe(250000);

    const db = await getDb();
    const stored = await db.collection("cuentasCobro").findOne({ consecutivo: resultado.consecutivo });

    expect(stored?.abonos).toHaveLength(1);
    expect(stored?.abonos[0].valor).toBe(250000);
  });

  it("asigna consecutivos distintos y crecientes a cuentas sucesivas", async () => {
    const a = await saveCuentaCobro({
      cliente,
      items: [{ descripcion: "Item A", cantidad: 1, valorUnitario: 1000 }],
      abonoInicial: 0,
    });
    const b = await saveCuentaCobro({
      cliente,
      items: [{ descripcion: "Item B", cantidad: 1, valorUnitario: 1000 }],
      abonoInicial: 0,
    });

    expect(a.consecutivo).not.toBe(b.consecutivo);
  });
});
