import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllUsernames, agregarUsuarioAGrupo, GRUPO_GLOBAL } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const usernames = await getAllUsernames();
  await Promise.all(usernames.map(u => agregarUsuarioAGrupo(u, GRUPO_GLOBAL)));

  return NextResponse.json({ ok: true, migrados: usernames.length, usuarios: usernames });
}
