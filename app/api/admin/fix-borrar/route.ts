import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
  const kv = getClient();
  await kv.del(`result:${id}`);
  await kv.srem("results:all", id);
  return NextResponse.json({ ok: true, borrado: id });
}
