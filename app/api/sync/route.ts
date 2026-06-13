import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, actualizados: 0, total: 0, msg: "sync deshabilitado - resultados via /api/live" });
}
