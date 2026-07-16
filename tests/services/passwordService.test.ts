import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcrypt";
import { getDb } from "@/lib/mongodb";
import {
  cambiarPassword,
  PasswordActualIncorrectaError,
  DemasiadosIntentosError,
} from "@/services/passwordService";
import type { User } from "@/models/User";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.MONGODB_DB = "punisher_invoice_test";
});

afterAll(async () => {
  await mongoServer.stop();
});

async function crearUsuario(username: string, password: string) {
  const db = await getDb();
  const user: User = {
    username,
    passwordHash: await bcrypt.hash(password, 12),
    role: "jefe",
    createdAt: new Date(),
  };
  await db.collection<User>("users").insertOne(user);
}

describe("cambiarPassword", () => {
  it("actualiza el hash cuando la contraseña actual es correcta", async () => {
    await crearUsuario("cambio.exitoso", "clave-vieja");

    await cambiarPassword("cambio.exitoso", "clave-vieja", "clave-nueva-123");

    const db = await getDb();
    const user = await db.collection<User>("users").findOne({ username: "cambio.exitoso" });
    expect(await bcrypt.compare("clave-nueva-123", user!.passwordHash)).toBe(true);
    expect(await bcrypt.compare("clave-vieja", user!.passwordHash)).toBe(false);
  });

  it("lanza PasswordActualIncorrectaError cuando la contraseña actual no coincide", async () => {
    await crearUsuario("cambio.malo", "clave-correcta");

    await expect(
      cambiarPassword("cambio.malo", "clave-incorrecta", "clave-nueva-123")
    ).rejects.toThrow(PasswordActualIncorrectaError);
  });

  it("lanza PasswordActualIncorrectaError cuando el usuario no existe", async () => {
    await expect(
      cambiarPassword("usuario.inexistente", "cualquiera", "clave-nueva-123")
    ).rejects.toThrow(PasswordActualIncorrectaError);
  });

  it("bloquea tras 5 intentos fallidos aunque la contraseña correcta llegue después", async () => {
    await crearUsuario("cambio.bloqueo", "clave-buena");

    for (let i = 0; i < 5; i++) {
      await expect(
        cambiarPassword("cambio.bloqueo", "clave-mala", "clave-nueva-123")
      ).rejects.toThrow(PasswordActualIncorrectaError);
    }

    await expect(
      cambiarPassword("cambio.bloqueo", "clave-buena", "clave-nueva-123")
    ).rejects.toThrow(DemasiadosIntentosError);
  });
});
