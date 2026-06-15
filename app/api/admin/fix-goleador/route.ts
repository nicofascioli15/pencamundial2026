import { NextRequest, NextResponse } from "next/server";
import { actualizarGoleador, getGoleadores } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const nombre = req.nextUrl.searchParams.get("nombre");
  const equipo = req.nextUrl.searchParams.get("equipo");
  const goles = parseInt(req.nextUrl.searchParams.get("goles") ?? "1");

  if (!nombre || !equipo) {
    return NextResponse.json({ error: "Faltan params: nombre, equipo, goles" }, { status: 400 });
  }

  const key = `${nombre}:${equipo}`.replace(/[^a-zA-Z0-9:_áéíóúÁÉÍÓÚñÑüÜ]/g, "_");
  await actualizarGoleador(key, { nombre, equipo, goles, asistencias: 0 });
  return NextResponse.json({ ok: true, key, nombre, equipo, goles });
}
