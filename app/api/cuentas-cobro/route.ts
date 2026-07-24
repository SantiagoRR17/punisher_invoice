import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listCuentasCobro, saveCuentaCobro } from "@/services/cuentaCobroService";
import type { ClienteCuentaCobro, ItemCuentaCobro } from "@/models/CuentaCobro";

const MAX_TEXTO = 200;
const MAX_DESCRIPCION = 5000;
const MAX_ITEMS = 50;
const MAX_CANTIDAD = 10_000;
const MAX_VALOR_UNITARIO = 1_000_000_000;

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const cuentas = await listCuentasCobro();
  return NextResponse.json(cuentas);
}

function isValidCliente(cliente: unknown): cliente is ClienteCuentaCobro {
  if (!cliente || typeof cliente !== "object") return false;
  const c = cliente as Record<string, unknown>;

  return (
    (c.tipoDocumento === "CC" || c.tipoDocumento === "NIT") &&
    (c.tratamiento === "Señor" || c.tratamiento === "Señora") &&
    typeof c.nombre === "string" &&
    c.nombre.trim().length > 0 &&
    c.nombre.length <= MAX_TEXTO &&
    typeof c.cedula === "string" &&
    c.cedula.length <= MAX_TEXTO &&
    typeof c.direccion === "string" &&
    c.direccion.length <= MAX_TEXTO &&
    typeof c.celular === "string" &&
    c.celular.trim().length > 0 &&
    c.celular.length <= MAX_TEXTO
  );
}

function isValidItems(items: unknown): items is ItemCuentaCobro[] {
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) return false;

  return items.every((item) => {
    if (!item || typeof item !== "object") return false;
    const i = item as Record<string, unknown>;

    return (
      typeof i.descripcion === "string" &&
      i.descripcion.trim().length > 0 &&
      i.descripcion.length <= MAX_DESCRIPCION &&
      typeof i.cantidad === "number" &&
      Number.isFinite(i.cantidad) &&
      i.cantidad > 0 &&
      i.cantidad <= MAX_CANTIDAD &&
      typeof i.valorUnitario === "number" &&
      Number.isFinite(i.valorUnitario) &&
      i.valorUnitario > 0 &&
      i.valorUnitario <= MAX_VALOR_UNITARIO
    );
  });
}

function isValidAbonoInicial(abonoInicial: unknown): abonoInicial is number {
  return typeof abonoInicial === "number" && Number.isFinite(abonoInicial) && abonoInicial >= 0;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (
    !body ||
    !isValidCliente(body.cliente) ||
    !isValidItems(body.items) ||
    !isValidAbonoInicial(body.abonoInicial)
  ) {
    return NextResponse.json({ error: "Datos de la cuenta de cobro inválidos." }, { status: 400 });
  }

  const total = (body.items as ItemCuentaCobro[]).reduce(
    (sum, item) => sum + item.cantidad * item.valorUnitario,
    0
  );

  if (body.abonoInicial > total) {
    return NextResponse.json(
      { error: "El abono no puede ser mayor al total de la cuenta." },
      { status: 400 }
    );
  }

  const cuenta = await saveCuentaCobro({
    cliente: body.cliente,
    items: body.items,
    abonoInicial: body.abonoInicial,
  });

  return NextResponse.json(cuenta, { status: 201 });
}
