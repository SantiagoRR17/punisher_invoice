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
  tratamiento: "Señora" as const,
  nombre: "Nohora Stella Coronado",
  cedula: "51.607.476",
  direccion: "Cl 74a #78 16",
  celular: "300 123 4567",
};

const sesionValida = {
  user: { name: "dueno.taller" },
  expires: new Date(Date.now() + 60_000).toISOString(),
};

describe("GET /api/cuentas-cobro", () => {
  it("rechaza la petición sin sesión con 401", async () => {
    mockAuth.mockResolvedValue(null);
    const { GET } = await import("@/app/api/cuentas-cobro/route");

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("devuelve la lista cuando hay sesión", async () => {
    mockAuth.mockResolvedValue(sesionValida);
    const { GET } = await import("@/app/api/cuentas-cobro/route");

    const response = await GET();

    expect(response.status).toBe(200);
    expect(Array.isArray(await response.json())).toBe(true);
  });
});

describe("POST /api/cuentas-cobro", () => {
  it("rechaza la petición sin sesión con 401", async () => {
    mockAuth.mockResolvedValue(null);
    const { POST } = await import("@/app/api/cuentas-cobro/route");

    const response = await POST(
      new Request("http://localhost/api/cuentas-cobro", {
        method: "POST",
        body: JSON.stringify({ cliente, items: [], abonoInicial: 0 }),
      })
    );

    expect(response.status).toBe(401);
  });

  it("rechaza un ítem cuya descripción excede el máximo permitido", async () => {
    mockAuth.mockResolvedValue(sesionValida);
    const { POST } = await import("@/app/api/cuentas-cobro/route");

    const response = await POST(
      new Request("http://localhost/api/cuentas-cobro", {
        method: "POST",
        body: JSON.stringify({
          cliente,
          items: [{ descripcion: "a".repeat(501), cantidad: 1, valorUnitario: 1000 }],
          abonoInicial: 0,
        }),
      })
    );

    expect(response.status).toBe(400);
  });

  it("rechaza más de 50 ítems", async () => {
    mockAuth.mockResolvedValue(sesionValida);
    const { POST } = await import("@/app/api/cuentas-cobro/route");

    const items = Array.from({ length: 51 }, (_, i) => ({
      descripcion: `Item ${i}`,
      cantidad: 1,
      valorUnitario: 1000,
    }));

    const response = await POST(
      new Request("http://localhost/api/cuentas-cobro", {
        method: "POST",
        body: JSON.stringify({ cliente, items, abonoInicial: 0 }),
      })
    );

    expect(response.status).toBe(400);
  });

  it("crea la cuenta cuando hay sesión y los datos son válidos", async () => {
    mockAuth.mockResolvedValue(sesionValida);
    const { POST } = await import("@/app/api/cuentas-cobro/route");

    const response = await POST(
      new Request("http://localhost/api/cuentas-cobro", {
        method: "POST",
        body: JSON.stringify({
          cliente,
          items: [{ descripcion: "Mantenimiento", cantidad: 1, valorUnitario: 100000 }],
          abonoInicial: 0,
        }),
      })
    );

    expect(response.status).toBe(201);
  });
});

describe("PATCH /api/cuentas-cobro/[consecutivo]", () => {
  it("rechaza la petición sin sesión con 401", async () => {
    mockAuth.mockResolvedValue(null);
    const { PATCH } = await import("@/app/api/cuentas-cobro/[consecutivo]/route");

    const response = await PATCH(
      new Request("http://localhost/api/cuentas-cobro/CC-2026-0001", {
        method: "PATCH",
        body: JSON.stringify({ valor: 10 }),
      }),
      { params: Promise.resolve({ consecutivo: "CC-2026-0001" }) }
    );

    expect(response.status).toBe(401);
  });

  it("registra el abono cuando hay sesión", async () => {
    mockAuth.mockResolvedValue(sesionValida);
    const { POST: crearCuenta } = await import("@/app/api/cuentas-cobro/route");
    const creada = await crearCuenta(
      new Request("http://localhost/api/cuentas-cobro", {
        method: "POST",
        body: JSON.stringify({
          cliente,
          items: [{ descripcion: "Item", cantidad: 1, valorUnitario: 1000 }],
          abonoInicial: 0,
        }),
      })
    );
    const { consecutivo } = await creada.json();

    const { PATCH } = await import("@/app/api/cuentas-cobro/[consecutivo]/route");
    const response = await PATCH(
      new Request(`http://localhost/api/cuentas-cobro/${consecutivo}`, {
        method: "PATCH",
        body: JSON.stringify({ valor: 400 }),
      }),
      { params: Promise.resolve({ consecutivo }) }
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.saldo).toBe(600);
  });
});
