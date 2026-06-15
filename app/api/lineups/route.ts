import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/kv";

const LS_KEY = process.env.LIVESCORE_KEY ?? "";
const LS_SECRET = process.env.LIVESCORE_SECRET ?? "";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const partidoId = req.nextUrl.searchParams.get("partidoId");
  if (!partidoId) return NextResponse.json({ error: "Falta partidoId" }, { status: 400 });

  const kv = getClient();
  const matchId = await kv.get(`live:matchid:${partidoId}`);
  if (!matchId) return NextResponse.json({ ok: false, msg: "Sin alineaciones aún" });

  try {
    const res = await fetch(
      `https://livescore-api.com/api-client/matches/lineups.json?key=${LS_KEY}&secret=${LS_SECRET}&match_id=${matchId}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    if (!data.success) return NextResponse.json({ ok: false, msg: "Sin alineaciones aún" });

    const lineup = data.data?.lineup;
    if (!lineup) return NextResponse.json({ ok: false, msg: "Sin alineaciones aún" });

    const mapPlayers = (players: any[]) =>
      players
        .filter(p => p.substitution === "0")
        .sort((a, b) => {
          const order: Record<string, number> = { GK: 0, DF: 1, MF: 2, FW: 3 };
          return (order[a.position] ?? 4) - (order[b.position] ?? 4);
        })
        .map(p => ({ nombre: p.name, numero: p.shirt_number, posicion: p.position }));

    return NextResponse.json({
      ok: true,
      local: { equipo: lineup.home?.team?.name, jugadores: mapPlayers(lineup.home?.players ?? []) },
      visitante: { equipo: lineup.away?.team?.name, jugadores: mapPlayers(lineup.away?.players ?? []) },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
