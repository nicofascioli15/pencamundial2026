import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllPrediccionesUsuario, getAllPrediccionesGrupoUsuario, getUsuario } from "@/lib/kv";
import { TODOS_PARTIDOS } from "@/lib/mundial";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const username = req.nextUrl.searchParams.get("username");
  const grupoId = req.nextUrl.searchParams.get("grupoId") ?? "fascioli";
  if (!username) return NextResponse.json({ error: "Falta username" }, { status: 400 });
  const user = await getUsuario(username);
  // Buscar picks en ambos sistemas (grupo y legacy)
  const [todasGrupo, todasLegacy] = await Promise.all([
    getAllPrediccionesGrupoUsuario(grupoId, username),
    getAllPrediccionesUsuario(username),
  ]);
  // Combinar — grupo tiene prioridad sobre legacy
  const todas = { ...todasLegacy, ...todasGrupo };
  const ahora = Date.now();
  const predsBloqueadas: Record<string, { local: number; visitante: number }> = {};
  for (const p of TODOS_PARTIDOS) {
    const [h, m] = p.hora.split(":").map(Number);
    const fechaUTC = new Date(`${p.fecha}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`).getTime() + 3*60*60*1000;
    const bloqueoMs = fechaUTC - 10*60*1000;
    if (ahora >= bloqueoMs && todas[p.id]) predsBloqueadas[p.id] = todas[p.id];
  }
  return NextResponse.json({ username, nombre: user?.nombre??username, predicciones: predsBloqueadas });
}
