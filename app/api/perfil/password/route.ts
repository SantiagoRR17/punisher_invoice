import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  cambiarPassword,
  PasswordActualIncorrectaError,
  DemasiadosIntentosError,
} from "@/services/passwordService";

const MIN_PASSWORD_NUEVA = 8;
const MAX_PASSWORD_NUEVA = 200;

export async function PATCH(request: Request) {
  const session = await auth();
  const username = session?.user?.name;
  if (!username) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const passwordActual = body?.passwordActual;
  const passwordNueva = body?.passwordNueva;

  if (typeof passwordActual !== "string" || passwordActual.length === 0) {
    return NextResponse.json({ error: "Ingresa tu contraseña actual." }, { status: 400 });
  }

  if (
    typeof passwordNueva !== "string" ||
    passwordNueva.length < MIN_PASSWORD_NUEVA ||
    passwordNueva.length > MAX_PASSWORD_NUEVA
  ) {
    return NextResponse.json(
      { error: `La contraseña nueva debe tener al menos ${MIN_PASSWORD_NUEVA} caracteres.` },
      { status: 400 }
    );
  }

  try {
    await cambiarPassword(username, passwordActual, passwordNueva);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PasswordActualIncorrectaError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof DemasiadosIntentosError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    throw error;
  }
}
