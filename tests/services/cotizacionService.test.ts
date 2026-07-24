import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { getDb } from "@/lib/mongodb";
import {
  CotizacionNoEncontradaError,
  getCotizacion,
  listCotizaciones,
  saveCotizacion,
  updateCotizacion,
  type NuevaCotizacionInput,
} from "@/services/cotizacionService";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.MONGODB_DB = "punisher_invoice_test";
});

afterAll(async () => {
  await mongoServer.stop();
});

const baseInput: NuevaCotizacionInput = {
  cliente: {
    tipoDocumento: "CC",
    tratamiento: "Señora",
    nombre: "Nohora Stella Coronado",
    cedula: "51.607.476",
    direccion: "Cl 74a #78 16",
    celular: "300 123 4567",
  },
  items: [{ descripcion: "Portón levadizo de 320x230", cantidad: 1, valorUnitario: 8900000 }],
  abono: 0,
};

describe("saveCotizacion", () => {
  it("guarda la cotización con consecutivo, total y abono", async () => {
    const guardada = await saveCotizacion({ ...baseInput, abono: 4450000 });

    expect(guardada.consecutivo).toMatch(/^COT-\d{4}-\d{4}$/);
    expect(guardada.total).toBe(8900000);
    expect(guardada.abono).toBe(4450000);
    expect(guardada.saldo).toBe(4450000);

    const db = await getDb();
    const stored = await db.collection("cotizaciones").findOne({ consecutivo: guardada.consecutivo });

    expect(stored?.cliente.nombre).toBe("Nohora Stella Coronado");
    expect(stored?.total).toBe(8900000);
    expect(stored?.abono).toBe(4450000);
    expect(stored?.createdAt).toBeInstanceOf(Date);
  });

  it("asigna consecutivos COT crecientes", async () => {
    const primera = await saveCotizacion(baseInput);
    const segunda = await saveCotizacion(baseInput);

    const numero = (consecutivo: string) => Number(consecutivo.split("-").at(-1));
    expect(numero(primera.consecutivo)).toBeLessThan(numero(segunda.consecutivo));
  });
});

async function idPorConsecutivo(consecutivo: string): Promise<string> {
  const db = await getDb();
  const doc = await db.collection("cotizaciones").findOne({ consecutivo });
  return doc!._id.toString();
}

describe("listCotizaciones", () => {
  it("devuelve las cotizaciones con _id como string", async () => {
    const guardada = await saveCotizacion(baseInput);
    const todas = await listCotizaciones();

    const encontrada = todas.find((c) => c.consecutivo === guardada.consecutivo);
    expect(encontrada).toBeDefined();
    expect(typeof encontrada?._id).toBe("string");
  });
});

describe("getCotizacion", () => {
  it("devuelve la cotización por id", async () => {
    const guardada = await saveCotizacion(baseInput);
    const id = await idPorConsecutivo(guardada.consecutivo);

    const cotizacion = await getCotizacion(id);
    expect(cotizacion?.consecutivo).toBe(guardada.consecutivo);
  });

  it("devuelve null para un id con formato inválido", async () => {
    expect(await getCotizacion("no-es-un-objectid")).toBeNull();
  });

  it("devuelve null para un id válido inexistente", async () => {
    expect(await getCotizacion("ffffffffffffffffffffffff")).toBeNull();
  });
});

describe("updateCotizacion", () => {
  it("actualiza cliente, ítems y abono conservando el consecutivo", async () => {
    const guardada = await saveCotizacion(baseInput);
    const id = await idPorConsecutivo(guardada.consecutivo);

    const actualizada = await updateCotizacion(id, {
      cliente: { ...baseInput.cliente, nombre: "Cliente Editado" },
      items: [{ descripcion: "Reja nueva", cantidad: 2, valorUnitario: 1000000 }],
      abono: 500000,
    });

    expect(actualizada.consecutivo).toBe(guardada.consecutivo);
    expect(actualizada.total).toBe(2000000);
    expect(actualizada.abono).toBe(500000);
    expect(actualizada.saldo).toBe(1500000);

    const db = await getDb();
    const stored = await db.collection("cotizaciones").findOne({ consecutivo: guardada.consecutivo });
    expect(stored?.cliente.nombre).toBe("Cliente Editado");
    expect(stored?.total).toBe(2000000);
  });

  it("lanza CotizacionNoEncontradaError para un id inexistente", async () => {
    await expect(
      updateCotizacion("ffffffffffffffffffffffff", baseInput)
    ).rejects.toBeInstanceOf(CotizacionNoEncontradaError);
  });

  it("lanza CotizacionNoEncontradaError para un id inválido", async () => {
    await expect(updateCotizacion("id-malo", baseInput)).rejects.toBeInstanceOf(
      CotizacionNoEncontradaError
    );
  });
});
