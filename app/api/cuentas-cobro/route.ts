import { NextResponse } from "next/server";
import { listCuentasCobro, saveCuentaCobro } from "@/services/cuentaCobroService";
import type { ClienteCuentaCobro, ItemCuentaCobro } from "@/models/CuentaCobro";

export async function GET() {
  const cuentas = await listCuentasCobro();
  return NextResponse.json(cuentas);
}

function isValidCliente(cliente: unknown): cliente is ClienteCuentaCobro {
  if (!cliente || typeof cliente !== "object") return false;
  const c = cliente as Record<string, unknown>;

  return (
    (c.tratamiento === "Señor" || c.tratamiento === "Señora") &&
    typeof c.nombre === "string" &&
    c.nombre.trim().length > 0 &&
    typeof c.cedula === "string" &&
    c.cedula.trim().length > 0 &&
    typeof c.direccion === "string" &&
    c.direccion.trim().length > 0 &&
    typeof c.barrio === "string" &&
    c.barrio.trim().length > 0
  );
}

function isValidItems(items: unknown): items is ItemCuentaCobro[] {
  if (!Array.isArray(items) || items.length === 0) return false;

  return items.every((item) => {
    if (!item || typeof item !== "object") return false;
    const i = item as Record<string, unknown>;

    return (
      typeof i.descripcion === "string" &&
      i.descripcion.trim().length > 0 &&
      typeof i.cantidad === "number" &&
      Number.isFinite(i.cantidad) &&
      i.cantidad > 0 &&
      typeof i.valorUnitario === "number" &&
      Number.isFinite(i.valorUnitario) &&
      i.valorUnitario > 0
    );
  });
}

function isValidAbonoInicial(abonoInicial: unknown): abonoInicial is number {
  return typeof abonoInicial === "number" && Number.isFinite(abonoInicial) && abonoInicial >= 0;
}

export async function POST(request: Request) {
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
