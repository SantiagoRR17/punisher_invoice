import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { formatConsecutivo, getNextConsecutivo } from "@/services/consecutivoService";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.MONGODB_DB = "punisher_invoice_test";
});

afterAll(async () => {
  await mongoServer.stop();
});

describe("getNextConsecutivo", () => {
  it("asigna números secuenciales crecientes dentro del mismo año", async () => {
    const anio = 2030;
    const primero = await getNextConsecutivo(anio);
    const segundo = await getNextConsecutivo(anio);
    const tercero = await getNextConsecutivo(anio);

    expect(primero).toBe(1);
    expect(segundo).toBe(2);
    expect(tercero).toBe(3);
  });

  it("reinicia el contador para un año distinto", async () => {
    const primero2031 = await getNextConsecutivo(2031);

    expect(primero2031).toBe(1);
  });

  it("usa contadores independientes por tipo de documento", async () => {
    const anio = 2032;
    const cuenta1 = await getNextConsecutivo(anio, "cuenta-cobro");
    const cuenta2 = await getNextConsecutivo(anio, "cuenta-cobro");
    const cotizacion1 = await getNextConsecutivo(anio, "cotizacion");

    expect(cuenta1).toBe(1);
    expect(cuenta2).toBe(2);
    // La cotización arranca en 1 pese a que ya hay dos cuentas del mismo año.
    expect(cotizacion1).toBe(1);
  });
});

describe("formatConsecutivo", () => {
  it("da formato CC-{año}-{secuencial} con padding de 4 dígitos", () => {
    expect(formatConsecutivo(2026, 1)).toBe("CC-2026-0001");
    expect(formatConsecutivo(2026, 516)).toBe("CC-2026-0516");
    expect(formatConsecutivo(2026, 12345)).toBe("CC-2026-12345");
  });

  it("permite un prefijo distinto (COT para cotizaciones)", () => {
    expect(formatConsecutivo(2026, 1, "COT")).toBe("COT-2026-0001");
  });
});
