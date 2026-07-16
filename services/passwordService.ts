import bcrypt from "bcrypt";
import { findUserByUsername, updatePasswordHash } from "@/services/userService";

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

export class PasswordActualIncorrectaError extends Error {
  constructor() {
    super("La contraseña actual no es correcta.");
    this.name = "PasswordActualIncorrectaError";
  }
}

export class DemasiadosIntentosError extends Error {
  constructor() {
    super("Demasiados intentos fallidos. Intenta de nuevo en unos minutos.");
    this.name = "DemasiadosIntentosError";
  }
}

export async function cambiarPassword(
  username: string,
  passwordActual: string,
  passwordNueva: string
): Promise<void> {
  if (estaBloqueado(username)) {
    throw new DemasiadosIntentosError();
  }

  const user = await findUserByUsername(username);
  const coincide = user ? await bcrypt.compare(passwordActual, user.passwordHash) : false;

  if (!user || !coincide) {
    registrarIntentoFallido(username);
    throw new PasswordActualIncorrectaError();
  }

  limpiarIntentos(username);

  const nuevoHash = await bcrypt.hash(passwordNueva, 12);
  await updatePasswordHash(username, nuevoHash);
}
