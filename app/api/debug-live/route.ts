import { NextResponse } from "next/server";
import { TODOS_PARTIDOS } from "@/lib/mundial";
export const dynamic = "force-dynamic";

const TEAM_MAP: Record<string, string> = {
  "Brazil": "Brasil", "Japan": "Japón",
};
function mapTeam(name: string): string { return TEAM_MAP[name] ?? name; }

export async function GET() {
  const key = process.env.LIVESCORE_KEY ?? "";
  const secret = process.env.LIVESCORE_SECRET ?? "";
  const res = await fetch(`https://livescore-api.com/api-client/matches/live.json?key=${key}&secret=${secret}&competition_id=362`, { cache: "no-store" });
  const data = await res.json();
  const match = data.data?.match?.[0];
  if (!match) return NextResponse.json({ error: "no match" });

  const home = mapTeam(match.home?.name ?? "");
  const away = mapTeam(match.away?.name ?? "");
  const partido = TODOS_PARTIDOS.find(p => p.local === home && p.visitante === away);

  return NextResponse.json({
    rawHome: match.home?.name,
    rawAway: match.away?.name,
    mappedHome: home,
    mappedAway: away,
    status: match.status,
    score: match.scores?.score,
    partidoEncontrado: !!partido,
    partidoId: partido?.id ?? null,
  });
}
