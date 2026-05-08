// app/api/sync/route.ts
// Sincroniza resultados automáticamente desde football-data.org
import { NextResponse } from "next/server";
import { setResultado } from "@/lib/kv";
import { TODOS_PARTIDOS } from "@/lib/mundial";

const API_KEY = process.env.FOOTBALL_API_KEY ?? "";
const BASE_URL = "https://api.football-data.org/v4";

// Mapeo nombres football-data.org → nombres en nuestra app
const TEAM_MAP: Record<string, string> = {
  "Mexico": "México", "Korea Republic": "Corea del Sur", "South Africa": "Sudáfrica",
  "Czech Republic": "República Checa", "Czechia": "República Checa",
  "Canada": "Canadá", "Bosnia and Herzegovina": "Bosnia y Herzegovina",
  "Switzerland": "Suiza", "Brazil": "Brasil", "Morocco": "Marruecos",
  "Scotland": "Escocia", "Haiti": "Haití", "USA": "Estados Unidos",
  "United States": "Estados Unidos", "Turkey": "Turquía", "Germany": "Alemania",
  "Ivory Coast": "Costa de Marfil", "Curaçao": "Curazao", "Curacao": "Curazao",
  "Netherlands": "Países Bajos", "Japan": "Japón", "Tunisia": "Túnez", "Sweden": "Suecia",
  "Belgium": "Bélgica", "Iran": "Irán", "Egypt": "Egipto", "New Zealand": "Nueva Zelanda",
  "Spain": "España", "Saudi Arabia": "Arabia Saudita", "Cape Verde": "Cabo Verde",
  "France": "Francia", "Iraq": "Irak", "Norway": "Noruega", "Algeria": "Argelia",
  "Jordan": "Jordania", "Portugal": "Portugal", "Colombia": "Colombia",
  "Uzbekistan": "Uzbekistán", "DR Congo": "RD Congo", "Congo DR": "RD Congo",
  "England": "Inglaterra", "Croatia": "Croacia", "Ghana": "Ghana", "Panama": "Panamá",
};

function mapTeam(name: string): string {
  return TEAM_MAP[name] ?? name;
}

function findPartidoId(homeTeam: string, awayTeam: string): string | null {
  const home = mapTeam(homeTeam);
  const away = mapTeam(awayTeam);
  return TODOS_PARTIDOS.find(p => p.local === home && p.visitante === away)?.id ?? null;
}

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ error: "FOOTBALL_API_KEY no configurada" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `${BASE_URL}/competitions/WC/matches?status=FINISHED`,
      {
        headers: { "X-Auth-Token": API_KEY },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: `API error: ${res.status}` }, { status: 500 });
    }

    const data = await res.json();
    const matches = data.matches ?? [];
    let actualizados = 0;

    for (const match of matches) {
      if (match.status !== "FINISHED") continue;
      const { home, away } = match.score.fullTime;
      if (home === null || away === null) continue;
      const partidoId = findPartidoId(match.homeTeam.name, match.awayTeam.name);
      if (!partidoId) continue;
      await setResultado(partidoId, { local: home, visitante: away });
      actualizados++;
    }

    return NextResponse.json({ ok: true, actualizados, total: matches.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
