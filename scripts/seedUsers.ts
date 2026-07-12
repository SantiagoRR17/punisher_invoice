/**
 * Script de seed para provisionar usuarios autorizados (dueño y contadora).
 *
 * Uso:
 *   1. Completa .env.local con MONGODB_URI y MONGODB_DB reales.
 *   2. Ejecuta: pnpm run seed:users -- --username <usuario> --password <password> --role dueno|contadora
 *
 * No incluye ni almacena contraseñas reales en el repositorio: las recibes por
 * argumento en el momento de ejecutar el script en tu propia máquina.
 */
import { config as loadEnv } from "dotenv";
import bcrypt from "bcrypt";
import { getDb } from "../lib/mongodb";
import type { User, UserRole } from "../models/User";

loadEnv({ path: ".env.local" });

const VALID_ROLES: UserRole[] = ["dueno", "contadora"];

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const value = argv[i + 1];
      args[key] = value;
      i += 1;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { username, password, role } = args;

  if (!username || !password || !role) {
    console.error(
      "Uso: pnpm run seed:users -- --username <usuario> --password <password> --role dueno|contadora"
    );
    process.exit(1);
  }

  if (!VALID_ROLES.includes(role as UserRole)) {
    console.error(`Rol inválido: ${role}. Debe ser uno de: ${VALID_ROLES.join(", ")}`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const db = await getDb();

  const user: User = {
    username,
    passwordHash,
    role: role as UserRole,
    createdAt: new Date(),
  };

  await db
    .collection<User>("users")
    .updateOne({ username }, { $set: user }, { upsert: true });

  console.log(`Usuario "${username}" (${role}) creado o actualizado correctamente.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Error al ejecutar el seed de usuarios:", error);
  process.exit(1);
});
