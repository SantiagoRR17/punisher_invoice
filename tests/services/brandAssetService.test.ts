import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { getBrandAsset, upsertBrandAsset } from "@/services/brandAssetService";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.MONGODB_DB = "punisher_invoice_test";
});

afterAll(async () => {
  await mongoServer.stop();
});

describe("brandAssetService", () => {
  it("devuelve null cuando el asset no existe", async () => {
    const asset = await getBrandAsset("no-existe");
    expect(asset).toBeNull();
  });

  it("guarda y recupera un asset con sus bytes exactos", async () => {
    const data = Buffer.from([1, 2, 3, 4, 5]);
    await upsertBrandAsset("firma", data, "image/png");

    const asset = await getBrandAsset("firma");

    expect(asset).not.toBeNull();
    expect(asset?.contentType).toBe("image/png");
    expect(Buffer.isBuffer(asset?.data)).toBe(true);
    expect(asset?.data.equals(data)).toBe(true);
  });

  it("sobrescribe el asset existente al subirlo de nuevo (upsert)", async () => {
    await upsertBrandAsset("firma", Buffer.from([1]), "image/png");
    await upsertBrandAsset("firma", Buffer.from([9, 9]), "image/png");

    const asset = await getBrandAsset("firma");

    expect(asset?.data.equals(Buffer.from([9, 9]))).toBe(true);
  });
});
