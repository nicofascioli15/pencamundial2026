import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getClient } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getSession();
    const kv = getClient();
    const username = session?.username ?? "anonimo";

    // Guardar que este usuario instaló la app
    await kv.sadd("pwa:instalados", username);
    await kv.set(`pwa:install:${username}`, new Date().toISOString());

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    const kv = getClient();
    const instalados = await kv.smembers("pwa:instalados");
    return NextResponse.json({ total: instalados.length, usuarios: instalados });
  } catch {
    return NextResponse.json({ total: 0, usuarios: [] });
  }
}
