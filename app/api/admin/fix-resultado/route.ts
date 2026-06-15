import { NextRequest, NextResponse } from "next/server";
import { setResultado, getResultado } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const local = req.nextUrl.searchParams.get("local");
  const visitante = req.nextUrl.searchParams.get("visitante");

  if (!id || local === null || visitante === null) {
    return NextResponse.json({ error: "Faltan params: id, local, visitante" }, { status: 400 });
  }

  await setResultado(id, { local: parseInt(local), visitante: parseInt(visitante) });
  const saved = await getResultado(id);
  return NextResponse.json({ ok: true, id, saved });
}
