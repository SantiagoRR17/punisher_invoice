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
});

describe("formatConsecutivo", () => {
  it("da formato CC-{año}-{secuencial} con padding de 4 dígitos", () => {
    expect(formatConsecutivo(2026, 1)).toBe("CC-2026-0001");
    expect(formatConsecutivo(2026, 516)).toBe("CC-2026-0516");
    expect(formatConsecutivo(2026, 12345)).toBe("CC-2026-12345");
  });
});
