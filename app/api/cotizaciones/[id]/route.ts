import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  CotizacionNoEncontradaError,
  getCotizacion,
  updateCotizacion,
} from "@/services/cotizacionService";
import type { ClienteCotizacion, ItemCotizacion } from "@/models/Cotizacion";

const MAX_TEXTO = 200;
const MAX_DESCRIPCION = 5000;
const MAX_ITEMS = 50;
const MAX_CANTIDAD = 10_000;
const MAX_VALOR_UNITARIO = 1_000_000_000;

function isValidCliente(cliente: unknown): cliente is ClienteCotizacion {
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

function isValidItems(items: unknown): items is ItemCotizacion[] {
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

function isValidAbono(abono: unknown): abono is number {
  return typeof abono === "number" && Number.isFinite(abono) && abono >= 0;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const cotizacion = await getCotizacion(id);

  if (!cotizacion) {
    return NextResponse.json({ error: "No se encontró la cotización." }, { status: 404 });
  }

  return NextResponse.json(cotizacion);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (
    !body ||
    !isValidCliente(body.cliente) ||
    !isValidItems(body.items) ||
    !isValidAbono(body.abono)
  ) {
    return NextResponse.json({ error: "Datos de la cotización inválidos." }, { status: 400 });
  }

  const total = (body.items as ItemCotizacion[]).reduce(
    (sum, item) => sum + item.cantidad * item.valorUnitario,
    0
  );

  if (body.abono > total) {
    return NextResponse.json(
      { error: "El abono no puede ser mayor al total de la cotización." },
      { status: 400 }
    );
  }

  try {
    const cotizacion = await updateCotizacion(id, {
      cliente: body.cliente,
      items: body.items,
      abono: body.abono,
    });
    return NextResponse.json(cotizacion);
  } catch (error) {
    if (error instanceof CotizacionNoEncontradaError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
