import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getClient } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const sub = await req.json();
  const kv = getClient();
  await kv.set(`push:${session.username}`, JSON.stringify(sub));
  await kv.sadd("push:all", session.username);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const kv = getClient();
  await kv.del(`push:${session.username}`);
  await kv.srem("push:all", session.username);
  return NextResponse.json({ ok: true });
}
