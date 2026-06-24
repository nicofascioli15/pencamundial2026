import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/kv";
import { TODOS_PARTIDOS } from "@/lib/mundial";

const LS_KEY = process.env.LIVESCORE_KEY ?? "";
const LS_SECRET = process.env.LIVESCORE_SECRET ?? "";

const TEAM_MAP: Record<string, string> = {
  "Mexico": "México", "South Korea": "Corea del Sur", "Korea Republic": "Corea del Sur",
  "South Africa": "Sudáfrica", "Czech Republic": "República Checa", "Czechia": "República Checa",
  "Canada": "Canadá", "Bosnia and Herzegovina": "Bosnia y Herzegovina",
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
  "DR Congo": "RD Congo", "England": "Inglaterra", "Croatia": "Croacia",
  "Ghana": "Ghana", "Panama": "Panamá", "Australia": "Australia",
  "Serbia": "Serbia", "Ecuador": "Ecuador", "Senegal": "Senegal",
  "Austria": "Austria", "Paraguay": "Paraguay", "Qatar": "Qatar",
  "Uruguay": "Uruguay", "Argentina": "Argentina",
};

function mapTeam(name: string): string { return TEAM_MAP[name] ?? name; }

export const dynamic = "force-dynamic";

async function getMatchId(partidoId: string, fecha: string): Promise<string | null> {
  const kv = getClient();
  
  // 1. Primero buscar en Redis (matchId guardado cuando estaba en vivo)
  const stored = await kv.get(`live:matchid:${partidoId}`);
  if (stored) return stored;

  // 2. Buscar en fixtures de la fecha del partido
  const partido = TODOS_PARTIDOS.find(p => p.id === partidoId);
  if (!partido) return null;

  // Buscar en fixture del día del partido y días cercanos
  const fechas = [partido.fecha];
  const d = new Date(partido.fecha + "T12:00:00Z");
  d.setDate(d.getDate() + 1);
  fechas.push(d.toISOString().split("T")[0]);

  for (const f of fechas) {
    try {
      const res = await fetch(
        `https://livescore-api.com/api-client/matches/fixtures.json?key=${LS_KEY}&secret=${LS_SECRET}&competition_id=362&date=${f}`,
        { cache: "no-store" }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const matches = data.data?.fixtures ?? [];
      for (const m of matches) {
        const home = mapTeam(m.home?.name ?? "");
        const away = mapTeam(m.away?.name ?? "");
        if (
          (home === partido.local && away === partido.visitante) ||
          (home === partido.visitante && away === partido.local)
        ) {
          // Guardar para futuras consultas
          await kv.set(`live:matchid:${partidoId}`, m.id?.toString() ?? "");
          return m.id?.toString() ?? null;
        }
      }
    } catch {}
  }

  return null;
}

export async function GET(req: NextRequest) {
  const partidoId = req.nextUrl.searchParams.get("partidoId");
  if (!partidoId) return NextResponse.json({ error: "Falta partidoId" }, { status: 400 });
  if (!LS_KEY || !LS_SECRET) return NextResponse.json({ ok: false, msg: "Sin credenciales" });

  const partido = TODOS_PARTIDOS.find(p => p.id === partidoId);
  if (!partido) return NextResponse.json({ ok: false, msg: "Partido no encontrado" });

  const matchId = await getMatchId(partidoId, partido.fecha);
  if (!matchId) return NextResponse.json({ ok: false, msg: "Sin alineaciones aún" });

  try {
    const res = await fetch(
      `https://livescore-api.com/api-client/matches/lineups.json?key=${LS_KEY}&secret=${LS_SECRET}&match_id=${matchId}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    if (!data.success) return NextResponse.json({ ok: false, msg: "Sin alineaciones aún" });

    const lineup = data.data?.lineup;
    if (!lineup?.home?.players?.length) return NextResponse.json({ ok: false, msg: "Sin alineaciones aún" });

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
      local: { equipo: partido.local, jugadores: mapPlayers(lineup.home?.players ?? []) },
      visitante: { equipo: partido.visitante, jugadores: mapPlayers(lineup.away?.players ?? []) },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
