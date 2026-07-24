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
  tipoDocumento: "CC" as const,
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

async function crearCotizacion(): Promise<string> {
  const { saveCotizacion } = await import("@/services/cotizacionService");
  const { getDb } = await import("@/lib/mongodb");
  const { consecutivo } = await saveCotizacion({
    cliente,
    items: [{ descripcion: "Reja", cantidad: 1, valorUnitario: 100000 }],
    abono: 0,
  });
  const db = await getDb();
  const doc = await db.collection("cotizaciones").findOne({ consecutivo });
  return doc!._id.toString();
}

describe("GET /api/cotizaciones/[id]", () => {
  it("devuelve 401 sin sesión", async () => {
    mockAuth.mockResolvedValue(null);
    const { GET } = await import("@/app/api/cotizaciones/[id]/route");

    const response = await GET(new Request("http://localhost/api/cotizaciones/x"), {
      params: Promise.resolve({ id: "x" }),
    });
    expect(response.status).toBe(401);
  });

  it("devuelve la cotización existente", async () => {
    mockAuth.mockResolvedValue(sesionValida);
    const id = await crearCotizacion();
    const { GET } = await import("@/app/api/cotizaciones/[id]/route");

    const response = await GET(new Request(`http://localhost/api/cotizaciones/${id}`), {
      params: Promise.resolve({ id }),
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.consecutivo).toMatch(/^COT-\d{4}-\d{4}$/);
  });

  it("devuelve 404 para un id inexistente", async () => {
    mockAuth.mockResolvedValue(sesionValida);
    const { GET } = await import("@/app/api/cotizaciones/[id]/route");

    const response = await GET(
      new Request("http://localhost/api/cotizaciones/ffffffffffffffffffffffff"),
      { params: Promise.resolve({ id: "ffffffffffffffffffffffff" }) }
    );
    expect(response.status).toBe(404);
  });
});

describe("PUT /api/cotizaciones/[id]", () => {
  it("actualiza la cotización y devuelve el nuevo total y saldo", async () => {
    mockAuth.mockResolvedValue(sesionValida);
    const id = await crearCotizacion();
    const { PUT } = await import("@/app/api/cotizaciones/[id]/route");

    const response = await PUT(
      new Request(`http://localhost/api/cotizaciones/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          cliente,
          items: [{ descripcion: "Reja reforzada", cantidad: 2, valorUnitario: 100000 }],
          abono: 50000,
        }),
      }),
      { params: Promise.resolve({ id }) }
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.total).toBe(200000);
    expect(body.abono).toBe(50000);
    expect(body.saldo).toBe(150000);
  });

  it("rechaza un abono mayor al total con 400", async () => {
    mockAuth.mockResolvedValue(sesionValida);
    const id = await crearCotizacion();
    const { PUT } = await import("@/app/api/cotizaciones/[id]/route");

    const response = await PUT(
      new Request(`http://localhost/api/cotizaciones/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          cliente,
          items: [{ descripcion: "Reja", cantidad: 1, valorUnitario: 100000 }],
          abono: 200000,
        }),
      }),
      { params: Promise.resolve({ id }) }
    );

    expect(response.status).toBe(400);
  });

  it("devuelve 404 al actualizar un id inexistente", async () => {
    mockAuth.mockResolvedValue(sesionValida);
    const { PUT } = await import("@/app/api/cotizaciones/[id]/route");

    const response = await PUT(
      new Request("http://localhost/api/cotizaciones/ffffffffffffffffffffffff", {
        method: "PUT",
        body: JSON.stringify({
          cliente,
          items: [{ descripcion: "Reja", cantidad: 1, valorUnitario: 100000 }],
          abono: 0,
        }),
      }),
      { params: Promise.resolve({ id: "ffffffffffffffffffffffff" }) }
    );

    expect(response.status).toBe(404);
  });
});
