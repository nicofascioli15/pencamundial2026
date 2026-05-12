import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getClient } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { partidoId } = await req.json();
  if (!partidoId) return NextResponse.json({ error: "Falta partidoId" }, { status: 400 });
  const kv = getClient();
  await kv.del(`result:${partidoId}`);
  await kv.srem("results:all", partidoId);
  return NextResponse.json({ ok: true });
}
