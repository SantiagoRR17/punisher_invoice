import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import type { Session } from "next-auth";
import { upsertBrandAsset } from "@/services/brandAssetService";

const mockAuth = vi.fn<() => Promise<Session | null>>();
vi.mock("@/auth", () => ({ auth: mockAuth }));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.MONGODB_DB = "punisher_invoice_test";
});

afterAll(async () => {
  await mongoServer.stop();
});

beforeEach(() => {
  mockAuth.mockReset();
});

const sesionValida = {
  user: { name: "dueno.taller" },
  expires: new Date(Date.now() + 60_000).toISOString(),
};

describe("GET /api/brand-assets/[nombre]", () => {
  it("rechaza la petición sin sesión con 401", async () => {
    mockAuth.mockResolvedValue(null);
    const { GET } = await import("@/app/api/brand-assets/[nombre]/route");

    const response = await GET(new Request("http://localhost/api/brand-assets/firma"), {
      params: Promise.resolve({ nombre: "firma" }),
    });

    expect(response.status).toBe(401);
  });

  it("devuelve 404 cuando el asset no existe", async () => {
    mockAuth.mockResolvedValue(sesionValida);
    const { GET } = await import("@/app/api/brand-assets/[nombre]/route");

    const response = await GET(new Request("http://localhost/api/brand-assets/no-existe"), {
      params: Promise.resolve({ nombre: "no-existe" }),
    });

    expect(response.status).toBe(404);
  });

  it("devuelve los bytes y el content-type cuando el asset existe", async () => {
    mockAuth.mockResolvedValue(sesionValida);
    await upsertBrandAsset("firma", Buffer.from([1, 2, 3]), "image/png");

    const { GET } = await import("@/app/api/brand-assets/[nombre]/route");
    const response = await GET(new Request("http://localhost/api/brand-assets/firma"), {
      params: Promise.resolve({ nombre: "firma" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(Array.from(bytes)).toEqual([1, 2, 3]);
  });
});
