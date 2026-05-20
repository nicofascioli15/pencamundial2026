import { NextResponse } from "next/server";
import { setResultado, getResultado } from "@/lib/kv";
import { TODOS_PARTIDOS, getFlag } from "@/lib/mundial";
import { enviarPushATodos } from "@/lib/push";

const API_KEY = process.env.FOOTBALL_API_KEY ?? "";
const BASE_URL = "https://api.football-data.org/v4";

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

function mapTeam(name: string): string { return TEAM_MAP[name] ?? name; }

function findPartido(homeTeam: string, awayTeam: string) {
  const home = mapTeam(homeTeam);
  const away = mapTeam(awayTeam);
  return TODOS_PARTIDOS.find(p => p.local === home && p.visitante === away) ?? null;
}

export const dynamic = "force-dynamic";

export async function GET() {
  if (!API_KEY) return NextResponse.json({ error: "API key no configurada" }, { status: 500 });

  try {
    const [liveRes, finRes] = await Promise.all([
      fetch(`${BASE_URL}/competitions/WC/matches?status=IN_PLAY,PAUSED`, {
        headers: { "X-Auth-Token": API_KEY }
      }),
      fetch(`${BASE_URL}/competitions/WC/matches?status=FINISHED`, {
        headers: { "X-Auth-Token": API_KEY }
      })
    ]);

    const liveData = liveRes.ok ? await liveRes.json() : { matches: [] };
    const finData = finRes.ok ? await finRes.json() : { matches: [] };

    const liveMatches = liveData.matches ?? [];
    const finMatches = finData.matches ?? [];

    const enVivo: any[] = [];
    for (const match of liveMatches) {
      const partido = findPartido(match.homeTeam.name, match.awayTeam.name);
      if (!partido) continue;
      const scoreHome = match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? 0;
      const scoreAway = match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? 0;
      enVivo.push({
        partidoId: partido.id,
        estado: match.status === "PAUSED" ? "entretiempo" : "jugando",
        minuto: match.minute ?? null,
        local: scoreHome,
        visitante: scoreAway,
      });
    }

    const nuevos: any[] = [];
    for (const match of finMatches) {
      if (match.status !== "FINISHED") continue;
      const { home, away } = match.score.fullTime;
      if (home === null || away === null) continue;
      const partido = findPartido(match.homeTeam.name, match.awayTeam.name);
      if (!partido) continue;
      const yaExistia = await getResultado(partido.id);
      await setResultado(partido.id, { local: home, visitante: away });
      if (!yaExistia) nuevos.push({ partido, local: home, visitante: away });
    }

    for (const { partido, local, visitante } of nuevos) {
      const flagL = getFlag(partido.local);
      const flagV = getFlag(partido.visitante);
      const titulo = `${flagL} ${partido.local} ${local} - ${visitante} ${partido.visitante} ${flagV}`;
      await enviarPushATodos(titulo, `Resultado final. ¡Mirá cómo quedaste!`, "/penca?tab=tabla");
    }

    return NextResponse.json({ ok: true, enVivo, nuevosFinalizados: nuevos.length });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
