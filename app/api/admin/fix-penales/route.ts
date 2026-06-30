import { NextRequest, NextResponse } from "next/server";
import { setGanadorPenales } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const ganador = req.nextUrl.searchParams.get("ganador") as "local"|"visitante"|null;

  if (!id || (ganador !== "local" && ganador !== "visitante")) {
    return NextResponse.json({ error: "Faltan params: id, ganador (local|visitante)" }, { status: 400 });
  }

  await setGanadorPenales(id, ganador);
  return NextResponse.json({ ok: true, id, ganador });
}
