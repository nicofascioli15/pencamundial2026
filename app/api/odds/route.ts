import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getClient } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const kv = getClient();

  // Usar cache de Redis por 6 horas
  const cached = await kv.get("odds:cache");
  if (cached) return NextResponse.json({ odds: JSON.parse(cached as string) });

  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) return NextResponse.json({ odds: {} });

  try {
    const res = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer_fifa_world_cup/odds/?apiKey=${apiKey}&regions=eu&markets=h2h&oddsFormat=decimal`
    );
    const data = await res.json();

    // Convertir a probabilidades por equipos
    const odds: Record<string, { home: number; draw: number; away: number }> = {};

    for (const game of data) {
      const bookmaker = game.bookmakers?.[0];
      if (!bookmaker) continue;
      const market = bookmaker.markets?.find((m: any) => m.key === "h2h");
      if (!market) continue;

      const outcomes = market.outcomes;
      const home = outcomes.find((o: any) => o.name === game.home_team);
      const away = outcomes.find((o: any) => o.name === game.away_team);
      const draw = outcomes.find((o: any) => o.name === "Draw");

      if (!home || !away || !draw) continue;

      // Convertir cuotas decimales a probabilidad implícita
      const pHome = 1 / home.price;
      const pDraw = 1 / draw.price;
      const pAway = 1 / away.price;
      const total = pHome + pDraw + pAway;

      odds[`${game.home_team}|${game.away_team}`] = {
        home: Math.round((pHome / total) * 100),
        draw: Math.round((pDraw / total) * 100),
        away: Math.round((pAway / total) * 100),
      };
    }

    // Cachear 6 horas
    await kv.set("odds:cache", JSON.stringify(odds), "EX", 6 * 60 * 60);
    return NextResponse.json({ odds });
  } catch {
    return NextResponse.json({ odds: {} });
  }
}
