import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcrypt";
import type { Session } from "next-auth";
import { getDb } from "@/lib/mongodb";
import type { User } from "@/models/User";

const mockAuth = vi.fn<() => Promise<Session | null>>();
vi.mock("@/auth", () => ({ auth: mockAuth }));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.MONGODB_DB = "punisher_invoice_test";

  const db = await getDb();
  const user: User = {
    username: "usuario.perfil",
    passwordHash: await bcrypt.hash("clave-actual", 12),
    role: "contadora",
    createdAt: new Date(),
  };
  await db.collection<User>("users").insertOne(user);
});

afterAll(async () => {
  await mongoServer.stop();
});

beforeEach(() => {
  mockAuth.mockReset();
});

const sesionValida = {
  user: { name: "usuario.perfil" },
  expires: new Date(Date.now() + 60_000).toISOString(),
};

function patchRequest(body: unknown) {
  return new Request("http://localhost/api/perfil/password", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/perfil/password", () => {
  it("rechaza la petición sin sesión con 401", async () => {
    mockAuth.mockResolvedValue(null);
    const { PATCH } = await import("@/app/api/perfil/password/route");

    const response = await PATCH(
      patchRequest({ passwordActual: "clave-actual", passwordNueva: "clave-nueva-123" })
    );

    expect(response.status).toBe(401);
  });

  it("rechaza una contraseña nueva menor a 8 caracteres con 400", async () => {
    mockAuth.mockResolvedValue(sesionValida);
    const { PATCH } = await import("@/app/api/perfil/password/route");

    const response = await PATCH(
      patchRequest({ passwordActual: "clave-actual", passwordNueva: "corta" })
    );

    expect(response.status).toBe(400);
  });

  it("rechaza una contraseña actual incorrecta con 400", async () => {
    mockAuth.mockResolvedValue(sesionValida);
    const { PATCH } = await import("@/app/api/perfil/password/route");

    const response = await PATCH(
      patchRequest({ passwordActual: "clave-incorrecta", passwordNueva: "clave-nueva-123" })
    );

    expect(response.status).toBe(400);
  });

  it("cambia la contraseña cuando la sesión y los datos son válidos", async () => {
    mockAuth.mockResolvedValue(sesionValida);
    const { PATCH } = await import("@/app/api/perfil/password/route");

    const response = await PATCH(
      patchRequest({ passwordActual: "clave-actual", passwordNueva: "clave-nueva-123" })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);

    const db = await getDb();
    const user = await db.collection<User>("users").findOne({ username: "usuario.perfil" });
    expect(await bcrypt.compare("clave-nueva-123", user!.passwordHash)).toBe(true);
  });
});
