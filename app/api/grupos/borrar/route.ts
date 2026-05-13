import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getGrupo, borrarGrupo, GRUPO_GLOBAL } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { grupoId } = await req.json();
  if (!grupoId) return NextResponse.json({ error: "Falta grupoId" }, { status: 400 });
  if (grupoId === GRUPO_GLOBAL) return NextResponse.json({ error: "No se puede borrar el grupo global" }, { status: 400 });

  const grupo = await getGrupo(grupoId);
  if (!grupo) return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });

  // Solo el dueño o admin puede borrar
  if (grupo.ownerUsername !== session.username && !session.isAdmin)
    return NextResponse.json({ error: "No tenés permiso" }, { status: 403 });

  await borrarGrupo(grupoId);
  return NextResponse.json({ ok: true });
}
