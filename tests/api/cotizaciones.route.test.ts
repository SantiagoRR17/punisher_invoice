import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import type { Session } from "next-auth";

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

const cliente = {
  tratamiento: "Señor" as const,
  nombre: "Carlos Pérez",
  cedula: "1.234.567",
  direccion: "Cl 10 #5 20",
  celular: "300 123 4567",
};

const sesionValida = {
  user: { name: "dueno.taller" },
  expires: new Date(Date.now() + 60_000).toISOString(),
};

describe("POST /api/cotizaciones", () => {
  it("rechaza la petición sin sesión con 401", async () => {
    mockAuth.mockResolvedValue(null);
    const { POST } = await import("@/app/api/cotizaciones/route");

    const response = await POST(
      new Request("http://localhost/api/cotizaciones", {
        method: "POST",
        body: JSON.stringify({ cliente, items: [] }),
      })
    );

    expect(response.status).toBe(401);
  });

  it("rechaza un valorUnitario por encima del máximo permitido", async () => {
    mockAuth.mockResolvedValue(sesionValida);
    const { POST } = await import("@/app/api/cotizaciones/route");

    const response = await POST(
      new Request("http://localhost/api/cotizaciones", {
        method: "POST",
        body: JSON.stringify({
          cliente,
          items: [{ descripcion: "Item", cantidad: 1, valorUnitario: 1_000_000_001 }],
        }),
      })
    );

    expect(response.status).toBe(400);
  });

  it("crea la cotización cuando hay sesión y los datos son válidos", async () => {
    mockAuth.mockResolvedValue(sesionValida);
    const { POST } = await import("@/app/api/cotizaciones/route");

    const response = await POST(
      new Request("http://localhost/api/cotizaciones", {
        method: "POST",
        body: JSON.stringify({
          cliente,
          items: [{ descripcion: "Mantenimiento", cantidad: 2, valorUnitario: 50000 }],
        }),
      })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.total).toBe(100000);
  });
});
