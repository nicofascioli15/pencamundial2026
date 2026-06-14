import { NextResponse } from "next/server";
import { getGoleadores } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const todos = await getGoleadores();
    const scorers = todos
      .filter(s => s.goles > 0)
      .sort((a, b) => b.goles - a.goles || b.asistencias - a.asistencias)
      .slice(0, 15);
    return NextResponse.json({ ok: true, scorers }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
