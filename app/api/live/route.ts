import { NextResponse } from "next/server";
import { setResultado, getResultado } from "@/lib/kv";
import { TODOS_PARTIDOS, getFlag } from "@/lib/mundial";
import { enviarPushATodos } from "@/lib/push";

const LS_KEY = process.env.LIVESCORE_KEY ?? "";
const LS_SECRET = process.env.LIVESCORE_SECRET ?? "";
const COMPETITION_ID = "362";

const TEAM_MAP: Record<string, string> = {
  "Mexico": "México", "Korea Republic": "Corea del Sur", "South Africa": "Sudáfrica",
  "Czech Republic": "República Checa", "Czechia": "República Checa",
  "Canada": "Canadá", "Bosnia and Herzegovina": "Bosnia y Herzegovina",
  "Bosnia & Herzegovina": "Bosnia y Herzegovina", "Bosnia-Herzegovina": "Bosnia y Herzegovina",
  "Switzerland": "Suiza", "Brazil": "Brasil", "Morocco": "Marruecos",
  "Scotland": "Escocia", "Haiti": "Haití", "USA": "Estados Unidos",
  "United States": "Estados Unidos", "Turkey": "Turquía", "Türkiye": "Turquía",
  "Germany": "Alemania", "Ivory Coast": "Costa de Marfil",
  "Côte d'Ivoire": "Costa de Marfil", "Cote d'Ivoire": "Costa de Marfil",
  "Curaçao": "Curazao", "Curacao": "Curazao",
  "Netherlands": "Países Bajos", "Japan": "Japón", "Tunisia": "Túnez",
  "Sweden": "Suecia", "Belgium": "Bélgica", "Iran": "Irán",
  "Egypt": "Egipto", "New Zealand": "Nueva Zelanda", "Spain": "España",
  "Saudi Arabia": "Arabia Saudita", "Cape Verde": "Cabo Verde",
  "France": "Francia", "Iraq": "Irak", "Norway": "Noruega",
  "Algeria": "Argelia", "Jordan": "Jordania", "Portugal": "Portugal",
  "Colombia": "Colombia", "Uzbekistan": "Uzbekistán",
  "DR Congo": "RD Congo", "Congo DR": "RD Congo", "Democratic Republic of Congo": "RD Congo",
  "England": "Inglaterra", "Croatia": "Croacia", "Ghana": "Ghana",
  "Panama": "Panamá", "Australia": "Australia", "Serbia": "Serbia",
  "Ecuador": "Ecuador", "Senegal": "Senegal", "Austria": "Austria",
  "Paraguay": "Paraguay", "Uruguay": "Uruguay", "Argentina": "Argentina",
  "Qatar": "Katar", "Peru": "Perú",
};

function mapTeam(name: string): string { return TEAM_MAP[name] ?? name; }

function findPartido(homeTeam: string, awayTeam: string) {
  const home = mapTeam(homeTeam);
  const away = mapTeam(awayTeam);
  return TODOS_PARTIDOS.find(p => p.local === home && p.visitante === away) ?? null;
}

function parseScore(scoreStr: string): { home: number; away: number } | null {
  if (!scoreStr?.trim()) return null;
  const parts = scoreStr.split("-").map(s => s.trim());
  if (parts.length !== 2) return null;
  const home = parseInt(parts[0]);
  const away = parseInt(parts[1]);
  if (isNaN(home) || isNaN(away)) return null;
  return { home, away };
}

export const dynamic = "force-dynamic";

export async function GET() {
  if (!LS_KEY || !LS_SECRET) {
    return NextResponse.json({ error: "LIVESCORE_KEY o LIVESCORE_SECRET no configurados" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://livescore-api.com/api-client/matches/live.json?key=${LS_KEY}&secret=${LS_SECRET}&competition_id=${COMPETITION_ID}`,
      { cache: "no-store" }
    );

    if (!res.ok) return NextResponse.json({ error: `API error: ${res.status}` }, { status: 500 });

    const data = await res.json();
    if (!data.success) return NextResponse.json({ error: data.error ?? "API error" }, { status: 500 });

    const matches = data.data?.match ?? [];
    const enVivo: any[] = [];
    const nuevos: any[] = [];

    for (const match of matches) {
      const partido = findPartido(match.home?.name ?? "", match.away?.name ?? "");
      if (!partido) continue;

      const status = match.status;
      const minuto = parseInt(match.time ?? "0") || null;

      if (status === "IN PLAY" || status === "HT") {
        const yaFinalizado = await getResultado(partido.id);
        if (yaFinalizado) continue;

        const score = parseScore(match.scores?.score ?? "");
        enVivo.push({
          partidoId: partido.id,
          estado: status === "HT" ? "entretiempo" : "jugando",
          minuto: status === "HT" ? null : minuto,
          local: score?.home ?? 0,
          visitante: score?.away ?? 0,
        });

      } else if (status === "FT") {
        const score = parseScore(match.scores?.ft_score ?? match.scores?.score ?? "");
        if (!score) continue;
        const yaExistia = await getResultado(partido.id);
        await setResultado(partido.id, { local: score.home, visitante: score.away });
        if (!yaExistia) nuevos.push({ partido, local: score.home, visitante: score.away });
      }
    }

    for (const { partido, local, visitante } of nuevos) {
      const flagL = getFlag(partido.local);
      const flagV = getFlag(partido.visitante);
      const titulo = `${flagL} ${partido.local} ${local} - ${visitante} ${partido.visitante} ${flagV}`;
      await enviarPushATodos(titulo, `Resultado final. ¡Mirá cómo quedaste!`, "/penca?tab=tabla");
    }

    return NextResponse.json(
      { ok: true, enVivo, nuevosFinalizados: nuevos.length },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
