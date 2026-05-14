import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getGrupo, getClient, GRUPO_GLOBAL } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { grupoId } = await req.json();
  if (!grupoId) return NextResponse.json({ error: "Falta grupoId" }, { status: 400 });
  if (grupoId === GRUPO_GLOBAL) return NextResponse.json({ error: "No podés salir del grupo global" }, { status: 400 });

  const grupo = await getGrupo(grupoId);
  if (!grupo) return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  if (grupo.ownerUsername === session.username) return NextResponse.json({ error: "El dueño no puede salir, solo borrar el grupo" }, { status: 400 });

  const kv = getClient();
  await kv.srem(`grupo:usuarios:${grupoId}`, session.username);
  await kv.srem(`usuario:grupos:${session.username}`, grupoId);

  return NextResponse.json({ ok: true });
}
