import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getClient } from "@/lib/kv";
export const dynamic = "force-dynamic";
export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const kv = getClient();
  const users = await kv.smembers("push:all");
  const subs = await Promise.all(users.map(async u => {
    const sub = await kv.get(`push:${u}`);
    return { user: u, tiene_sub: !!sub };
  }));
  return NextResponse.json({ total: users.length, usuarios: subs });
}
