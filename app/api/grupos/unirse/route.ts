import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getGruposByCodigo, getGrupo, agregarUsuarioAGrupo, getGruposUsuario, getAllPrediccionesGrupoUsuario, setPrediccionGrupo, GRUPO_GLOBAL } from "@/lib/kv";
import { TODOS_PARTIDOS } from "@/lib/mundial";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { codigo } = await req.json();
  if (!codigo?.trim()) return NextResponse.json({ error: "Falta el código" }, { status: 400 });

  const grupoId = await getGruposByCodigo(codigo.trim().toUpperCase());
  if (!grupoId) return NextResponse.json({ error: "Código inválido" }, { status: 404 });

  const grupo = await getGrupo(grupoId);
  if (!grupo) return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });

  const misGrupos = await getGruposUsuario(session.username);
  if (misGrupos.includes(grupoId)) return NextResponse.json({ error: "Ya sos miembro de este grupo" }, { status: 400 });

  await agregarUsuarioAGrupo(session.username, grupoId);

  // Replicar picks de PencaFascioli a este grupo (solo partidos no bloqueados)
  const predsGlobal = await getAllPrediccionesGrupoUsuario(GRUPO_GLOBAL, session.username);
  const ahora = Date.now();
  await Promise.all(
    TODOS_PARTIDOS
      .filter(p => {
        const [h, m] = p.hora.split(":").map(Number);
        const bloqueoMs = new Date(`${p.fecha}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`).getTime() - 3*60*1000;
        return bloqueoMs > ahora && predsGlobal[p.id];
      })
      .map(p => setPrediccionGrupo(grupoId, session.username, p.id, predsGlobal[p.id]))
  );

  return NextResponse.json({ ok: true, grupo });
}
