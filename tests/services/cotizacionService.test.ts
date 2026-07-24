import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { getDb } from "@/lib/mongodb";
import { saveCotizacion, type NuevaCotizacionInput } from "@/services/cotizacionService";

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
