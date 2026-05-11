import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllPrediccionesUsuario, getUsuario } from "@/lib/kv";
import { TODOS_PARTIDOS } from "@/lib/mundial";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const username = req.nextUrl.searchParams.get("username");
  if (!username) return NextResponse.json({ error: "Falta username" }, { status: 400 });
  const user = await getUsuario(username);
  const todas = await getAllPrediccionesUsuario(username);
  const ahora = Date.now();
  const predsBloqueadas: Record<string, { local: number; visitante: number }> = {};
  for (const p of TODOS_PARTIDOS) {
    const [h, m] = p.hora.split(":").map(Number);
    const bloqueoMs = new Date(`${p.fecha}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`).getTime()+3*60*60*1000-10*60*1000;
    if (ahora >= bloqueoMs && todas[p.id]) predsBloqueadas[p.id] = todas[p.id];
  }
  return NextResponse.json({ username, nombre: user?.nombre??username, predicciones: predsBloqueadas });
}
