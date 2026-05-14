import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getClient, getAllUsernames } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const kv = getClient();
  const validos = await getAllUsernames();
  const grupos = await kv.smembers("grupos:all");
  grupos.push("fascioli");
  let eliminados = 0;
  for (const gId of grupos) {
    const miembros = await kv.smembers(`grupo:usuarios:${gId}`);
    for (const u of miembros) {
      if (!validos.includes(u)) {
        await kv.srem(`grupo:usuarios:${gId}`, u);
        eliminados++;
      }
    }
  }
  return NextResponse.json({ ok: true, eliminados });
}
