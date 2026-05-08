// app/api/predicciones/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllPrediccionesUsuario, setPrediccion, getResultado } from "@/lib/kv";
import { TODOS_PARTIDOS } from "@/lib/mundial";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const predicciones = await getAllPrediccionesUsuario(session.username);
  return NextResponse.json({ predicciones });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { partidoId, local, visitante } = await req.json();
  if (!partidoId || local === undefined || visitante === undefined)
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });

  const partido = TODOS_PARTIDOS.find(p => p.id === partidoId);
  if (!partido)
    return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });

  // ── Bloqueo exacto a la hora del partido (hora Montevideo) ────────
  const [h, m] = partido.hora.split(":").map(Number);
  // Construir fecha/hora del partido como UTC (hora MVD = UTC-3, sumamos 3h)
  const partidoUTC = new Date(`${partido.fecha}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00.000+00:00`);
  partidoUTC.setHours(partidoUTC.getHours() + 3); // convertir MVD a UTC

  if (Date.now() >= partidoUTC.getTime()) {
    return NextResponse.json({
      error: `Ya comenzó ${partido.local} vs ${partido.visitante}, no podés modificar tu pronóstico`,
      bloqueado: true
    }, { status: 403 });
  }

  // ── Bloqueo por resultado cargado ─────────────────────────────────
  const resultadoReal = await getResultado(partidoId);
  if (resultadoReal)
    return NextResponse.json({ error: "El partido ya tiene resultado cargado", bloqueado: true }, { status: 403 });

  const l = parseInt(local);
  const v = parseInt(visitante);
  if (isNaN(l) || isNaN(v) || l < 0 || v < 0 || l > 20 || v > 20)
    return NextResponse.json({ error: "Valores de goles inválidos" }, { status: 400 });

  await setPrediccion(session.username, partidoId, { local: l, visitante: v });
  return NextResponse.json({ ok: true });
}
