import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getClient, getGrupo, getMiembrosGrupo } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const kv = getClient();
  const grupoIds = await kv.smembers("grupos:all");

  const grupos = await Promise.all(grupoIds.map(async (gId) => {
    const grupo = await getGrupo(gId);
    if (!grupo) return null;
    const miembros = await getMiembrosGrupo(gId);
    return { id: grupo.id, nombre: grupo.nombre, codigo: grupo.codigo, ownerUsername: grupo.ownerUsername, miembros: miembros.length };
  }));

  return NextResponse.json({ grupos: grupos.filter(Boolean) });
}
