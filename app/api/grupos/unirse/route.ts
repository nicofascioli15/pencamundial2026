import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getGruposByCodigo, getGrupo, agregarUsuarioAGrupo, getGruposUsuario } from "@/lib/kv";

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
  return NextResponse.json({ ok: true, grupo });
}
