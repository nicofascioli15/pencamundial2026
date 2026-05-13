// app/api/config/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPuntosConfig, setPuntosConfig } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getPuntosConfig();
  return NextResponse.json({ config });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin)
    return NextResponse.json({ error: "Solo el administrador puede cambiar la configuración" }, { status: 403 });

  const body = await req.json();
  const resultado_exacto = Number(body.resultado_exacto);
  const ganador_diferencia = Number(body.ganador_diferencia);
  const ganador_correcto = Number(body.ganador_correcto);
  const empate_correcto = Number(body.empate_correcto);

  if (
    isNaN(resultado_exacto) || resultado_exacto < 1 ||
    isNaN(ganador_diferencia) || ganador_diferencia < 1 ||
    isNaN(ganador_correcto) || ganador_correcto < 1 ||
    isNaN(empate_correcto) || empate_correcto < 1
  ) {
    return NextResponse.json({ error: "Valores de puntos inválidos" }, { status: 400 });
  }

  await setPuntosConfig({ resultado_exacto, ganador_diferencia, ganador_correcto, empate_correcto });
  return NextResponse.json({ ok: true });
}
