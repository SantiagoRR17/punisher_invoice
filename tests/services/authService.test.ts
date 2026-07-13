import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcrypt";
import { getDb } from "@/lib/mongodb";
import { verifyCredentials } from "@/services/authService";
import type { User } from "@/models/User";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.MONGODB_DB = "punisher_invoice_test";

  const passwordHash = await bcrypt.hash("clave-correcta", 12);
  const db = await getDb();
  const user: User = {
    username: "dueno.taller",
    passwordHash,
    role: "jefe",
    createdAt: new Date(),
  };
  await db.collection<User>("users").insertOne(user);
});

afterAll(async () => {
  await mongoServer.stop();
});

describe("verifyCredentials", () => {
  it("devuelve el usuario cuando el usuario y la contraseña son correctos", async () => {
    const result = await verifyCredentials("dueno.taller", "clave-correcta");

    expect(result).not.toBeNull();
    expect(result?.username).toBe("dueno.taller");
    expect(result?.role).toBe("jefe");
  });

  it("devuelve null cuando la contraseña es incorrecta", async () => {
    const result = await verifyCredentials("dueno.taller", "clave-incorrecta");

    expect(result).toBeNull();
  });

  it("devuelve null cuando el usuario no existe", async () => {
    const result = await verifyCredentials("usuario.inexistente", "cualquiera");

    expect(result).toBeNull();
  });

  it("devuelve null cuando falta el usuario o la contraseña", async () => {
    expect(await verifyCredentials("", "clave-correcta")).toBeNull();
    expect(await verifyCredentials("dueno.taller", "")).toBeNull();
  });
});

describe("verifyCredentials - límite de intentos", () => {
  it("bloquea tras 5 intentos fallidos aunque la contraseña correcta llegue después", async () => {
    const username = "usuario.bloqueo";
    const db = await getDb();
    await db.collection<User>("users").insertOne({
      username,
      passwordHash: await bcrypt.hash("clave-buena", 12),
      role: "contadora",
      createdAt: new Date(),
    });

    for (let i = 0; i < 5; i++) {
      expect(await verifyCredentials(username, "clave-mala")).toBeNull();
    }

    const resultado = await verifyCredentials(username, "clave-buena");
    expect(resultado).toBeNull();
  });
});
