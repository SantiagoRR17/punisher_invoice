import { NextResponse } from "next/server";
import { saveCotizacion } from "@/services/cotizacionService";
import type { ClienteCotizacion, ItemCotizacion } from "@/models/Cotizacion";

function isValidCliente(cliente: unknown): cliente is ClienteCotizacion {
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

function isValidItems(items: unknown): items is ItemCotizacion[] {
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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || !isValidCliente(body.cliente) || !isValidItems(body.items)) {
    return NextResponse.json({ error: "Datos de la cotización inválidos." }, { status: 400 });
  }

  const items = body.items as ItemCotizacion[];
  const total = items.reduce((sum, item) => sum + item.cantidad * item.valorUnitario, 0);

  const id = await saveCotizacion({
    cliente: body.cliente,
    items,
    fecha: new Date(),
    total,
  });

  return NextResponse.json({ id, total }, { status: 201 });
}
