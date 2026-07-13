import { NextResponse } from "next/server";
import {
  CuentaCobroNoEncontradaError,
  SaldoInsuficienteError,
  registrarAbono,
} from "@/services/cuentaCobroService";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ consecutivo: string }> }
) {
  const { consecutivo } = await params;
  const body = await request.json().catch(() => null);
  const valor = body?.valor;

  if (typeof valor !== "number" || !Number.isFinite(valor) || valor <= 0) {
    return NextResponse.json({ error: "El valor del abono debe ser mayor a cero." }, { status: 400 });
  }

  try {
    const cuenta = await registrarAbono(consecutivo, valor);
    return NextResponse.json(cuenta);
  } catch (error) {
    if (error instanceof CuentaCobroNoEncontradaError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof SaldoInsuficienteError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
