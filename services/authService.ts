import bcrypt from "bcrypt";
import { findUserByUsername } from "@/services/userService";
import type { AuthenticatedUser } from "@/models/User";

// Hash de una contraseña ficticia (costo 12), usado para comparar tiempos
// cuando el usuario no existe y así no revelar por timing qué usuarios son válidos.
const DUMMY_HASH = "$2b$12$DzyyUJQsN/DDByAUV4J/BuzG2GL3EDEfMIqVhnCo1p3z4Pr6.z2bi";

const MAX_INTENTOS = 5;
const VENTANA_MS = 15 * 60 * 1000;

interface RegistroIntentos {
  intentos: number;
  primerIntentoEn: number;
}

const intentosFallidos = new Map<string, RegistroIntentos>();

function estaBloqueado(username: string): boolean {
  const registro = intentosFallidos.get(username);
  if (!registro) return false;

  if (Date.now() - registro.primerIntentoEn > VENTANA_MS) {
    intentosFallidos.delete(username);
    return false;
  }

  return registro.intentos >= MAX_INTENTOS;
}

function registrarIntentoFallido(username: string): void {
  const registro = intentosFallidos.get(username);

  if (!registro || Date.now() - registro.primerIntentoEn > VENTANA_MS) {
    intentosFallidos.set(username, { intentos: 1, primerIntentoEn: Date.now() });
    return;
  }

  registro.intentos += 1;
}

function limpiarIntentos(username: string): void {
  intentosFallidos.delete(username);
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<AuthenticatedUser | null> {
  if (!username || !password) {
    return null;
  }

  if (estaBloqueado(username)) {
    return null;
  }

  const user = await findUserByUsername(username);
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordMatches) {
    registrarIntentoFallido(username);
    return null;
  }

  limpiarIntentos(username);

  return {
    id: String(user._id),
    username: user.username,
    role: user.role,
  };
}
