import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getBrandAsset } from "@/services/brandAssetService";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ nombre: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { nombre } = await params;
  const asset = await getBrandAsset(nombre);

  if (!asset) {
    return NextResponse.json({ error: "Recurso no encontrado." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(asset.data), {
    headers: { "Content-Type": asset.contentType },
  });
}
