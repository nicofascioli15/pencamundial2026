// app/api/resultados/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllResultados, setResultado } from "@/lib/kv";

// GET /api/resultados — público, para que todos vean los resultados
export async function GET() {
  const resultados = await getAllResultados();
  return NextResponse.json({ resultados });
}

// POST /api/resultados — solo admin
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin)
    return NextResponse.json({ error: "Solo el administrador puede cargar resultados" }, { status: 403 });

  const { partidoId, local, visitante } = await req.json();

  if (!partidoId || local === undefined || visitante === undefined)
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });

  const l = parseInt(local);
  const v = parseInt(visitante);
  if (isNaN(l) || isNaN(v) || l < 0 || v < 0 || l > 20 || v > 20)
    return NextResponse.json({ error: "Valores inválidos" }, { status: 400 });

  await setResultado(partidoId, { local: l, visitante: v });
  return NextResponse.json({ ok: true });
}
