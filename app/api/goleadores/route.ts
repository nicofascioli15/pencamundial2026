import { NextResponse } from "next/server";

const LS_KEY = process.env.LIVESCORE_KEY ?? "";
const LS_SECRET = process.env.LIVESCORE_SECRET ?? "";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!LS_KEY || !LS_SECRET) return NextResponse.json({ error: "Sin credenciales" }, { status: 500 });
  try {
    const res = await fetch(
      `https://livescore-api.com/api-client/competitions/topscorers.json?key=${LS_KEY}&secret=${LS_SECRET}&competition_id=362`,
      { cache: "no-store" }
    );
    const data = await res.json();
    if (!data.success) return NextResponse.json({ error: data.error }, { status: 500 });
    const scorers = (data.data?.topscorers ?? [])
      .filter((s: any) => s.goals > 0)
      .sort((a: any, b: any) => b.goals - a.goals || b.assists - a.assists)
      .slice(0, 15)
      .map((s: any) => ({
        nombre: s.player?.name ?? "—",
        foto: s.player?.photo ?? null,
        equipo: s.team?.name ?? "",
        logo: s.team?.logo ?? null,
        goles: s.goals,
        asistencias: s.assists,
        jugados: s.played,
      }));
    return NextResponse.json({ ok: true, scorers }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
