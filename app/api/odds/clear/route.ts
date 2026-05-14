import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getClient } from "@/lib/kv";
export const dynamic = "force-dynamic";
export async function POST() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const kv = getClient();
  await kv.del("odds:cache");
  return NextResponse.json({ ok: true });
}
