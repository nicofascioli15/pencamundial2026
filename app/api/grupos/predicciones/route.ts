import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPrediccionGrupo, setPrediccionGrupo, getGruposUsuario, getAllPrediccionesGrupoUsuario, GRUPO_GLOBAL } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const grupoId = req.nextUrl.searchParams.get("grupoId") ?? GRUPO_GLOBAL;
  const predicciones = await getAllPrediccionesGrupoUsuario(grupoId, session.username);
  return NextResponse.json({ predicciones });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { grupoId, partidoId, local, visitante } = await req.json();
  if (!partidoId || local === undefined || visitante === undefined)
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

  const targetGrupoId = grupoId ?? GRUPO_GLOBAL;

  // Guardar en el grupo especificado
  await setPrediccionGrupo(targetGrupoId, session.username, partidoId, { local, visitante });

  // Replicar a todos los grupos donde NO hay pick aún (bidireccional)
  const misGrupos = await getGruposUsuario(session.username);
  const todosGrupos = [GRUPO_GLOBAL, ...misGrupos];
  await Promise.all(todosGrupos.map(async (gId) => {
    if (gId === targetGrupoId) return;
    const existing = await getPrediccionGrupo(gId, session.username, partidoId);
    if (!existing) {
      await setPrediccionGrupo(gId, session.username, partidoId, { local, visitante });
    }
  }));

  return NextResponse.json({ ok: true });
}
