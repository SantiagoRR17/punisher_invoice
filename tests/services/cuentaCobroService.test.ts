import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { getDb } from "@/lib/mongodb";
import {
  CuentaCobroNoEncontradaError,
  SaldoInsuficienteError,
  listCuentasCobro,
  registrarAbono,
  saveCuentaCobro,
} from "@/services/cuentaCobroService";

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
  celular: "300 123 4567",
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

describe("listCuentasCobro", () => {
  it("devuelve las cuentas ordenadas de la más reciente a la más antigua", async () => {
    const a = await saveCuentaCobro({
      cliente,
      items: [{ descripcion: "Primera", cantidad: 1, valorUnitario: 1000 }],
      abonoInicial: 0,
    });
    const b = await saveCuentaCobro({
      cliente,
      items: [{ descripcion: "Segunda", cantidad: 1, valorUnitario: 2000 }],
      abonoInicial: 0,
    });

    const cuentas = await listCuentasCobro();
    const indiceA = cuentas.findIndex((c) => c.consecutivo === a.consecutivo);
    const indiceB = cuentas.findIndex((c) => c.consecutivo === b.consecutivo);

    expect(indiceB).toBeLessThan(indiceA);
  });
});

describe("registrarAbono", () => {
  it("suma el abono a la lista y descuenta el saldo", async () => {
    const creada = await saveCuentaCobro({
      cliente,
      items: [{ descripcion: "Item", cantidad: 1, valorUnitario: 1000 }],
      abonoInicial: 0,
    });

    const actualizada = await registrarAbono(creada.consecutivo, 400);

    expect(actualizada.saldo).toBe(600);
    expect(actualizada.abonos).toHaveLength(1);
    expect(actualizada.abonos[0].valor).toBe(400);

    const otraVez = await registrarAbono(creada.consecutivo, 600);
    expect(otraVez.saldo).toBe(0);
    expect(otraVez.abonos).toHaveLength(2);
  });

  it("rechaza un abono mayor al saldo pendiente", async () => {
    const creada = await saveCuentaCobro({
      cliente,
      items: [{ descripcion: "Item", cantidad: 1, valorUnitario: 1000 }],
      abonoInicial: 0,
    });

    await expect(registrarAbono(creada.consecutivo, 1500)).rejects.toBeInstanceOf(
      SaldoInsuficienteError
    );
  });

  it("lanza un error si el consecutivo no existe", async () => {
    await expect(registrarAbono("CC-9999-9999", 100)).rejects.toBeInstanceOf(
      CuentaCobroNoEncontradaError
    );
  });

  it("no permite que dos abonos simultáneos dejen el saldo negativo (condición de carrera)", async () => {
    const creada = await saveCuentaCobro({
      cliente,
      items: [{ descripcion: "Item", cantidad: 1, valorUnitario: 1000 }],
      abonoInicial: 0,
    });

    const resultados = await Promise.allSettled([
      registrarAbono(creada.consecutivo, 700),
      registrarAbono(creada.consecutivo, 700),
    ]);

    const exitosos = resultados.filter((r) => r.status === "fulfilled");
    const rechazados = resultados.filter((r) => r.status === "rejected");

    expect(exitosos).toHaveLength(1);
    expect(rechazados).toHaveLength(1);

    const db = await getDb();
    const final = await db.collection("cuentasCobro").findOne({ consecutivo: creada.consecutivo });
    expect(final?.saldo).toBe(300);
  });
});
