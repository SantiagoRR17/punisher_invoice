import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { getDb } from "@/lib/mongodb";
import { saveCotizacion } from "@/services/cotizacionService";
import type { Cotizacion } from "@/models/Cotizacion";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.MONGODB_DB = "punisher_invoice_test";
});

afterAll(async () => {
  await mongoServer.stop();
});

describe("saveCotizacion", () => {
  it("guarda la cotización en la colección cotizaciones", async () => {
    const cotizacion: Omit<Cotizacion, "_id" | "createdAt"> = {
      cliente: {
        tratamiento: "Señora",
        nombre: "Nohora Stella Coronado",
        cedula: "51.607.476",
        direccion: "Cl 74a #78 16",
        barrio: "Tabora",
      },
      items: [{ descripcion: "Portón levadizo de 320x230", cantidad: 1, valorUnitario: 8900000 }],
      fecha: new Date("2026-05-16"),
      total: 8900000,
    };

    const id = await saveCotizacion(cotizacion);
    expect(id).toBeTruthy();

    const db = await getDb();
    const stored = await db.collection("cotizaciones").findOne({});

    expect(stored?.cliente.nombre).toBe("Nohora Stella Coronado");
    expect(stored?.total).toBe(8900000);
    expect(stored?.createdAt).toBeInstanceOf(Date);
  });
});
