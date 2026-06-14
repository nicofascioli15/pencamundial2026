import { NextResponse } from "next/server";

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
  "DR Congo": "RD Congo", "Congo DR": "RD Congo",
  "England": "Inglaterra", "Croatia": "Croacia", "Ghana": "Ghana",
  "Panama": "Panamá", "Australia": "Australia", "Serbia": "Serbia",
  "Ecuador": "Ecuador", "Senegal": "Senegal", "Austria": "Austria",
  "Paraguay": "Paraguay", "Qatar": "Qatar", "Uruguay": "Uruguay", "Argentina": "Argentina",
};

function mapTeam(name: string): string { return TEAM_MAP[name] ?? name; }

export const dynamic = "force-dynamic";

export async function GET() {
  if (!LS_KEY || !LS_SECRET) return NextResponse.json({ error: "Sin credenciales" }, { status: 500 });
  try {
    const res = await fetch(
      `https://livescore-api.com/api-client/competitions/standings.json?key=${LS_KEY}&secret=${LS_SECRET}&competition_id=362`,
      { cache: "no-store" }
    );
    const data = await res.json();
    if (!data.success) return NextResponse.json({ error: data.error }, { status: 500 });
    const rows = data.data?.table ?? [];
    const grupos: Record<string, any[]> = {};
    for (const row of rows) {
      const grupo = row.group_name;
      if (!grupo) continue;
      const equipo = mapTeam(row.name);
      if (!grupos[grupo]) grupos[grupo] = [];
      grupos[grupo].push({
        equipo,
        pj: parseInt(row.matches ?? "0"),
        g: parseInt(row.won ?? "0"),
        e: parseInt(row.drawn ?? "0"),
        p: parseInt(row.lost ?? "0"),
        gf: parseInt(row.goals_scored ?? "0"),
        ga: parseInt(row.goals_conceded ?? "0"),
        dg: parseInt(row.goal_diff ?? "0"),
        pts: parseInt(row.points ?? "0"),
      });
    }
    return NextResponse.json({ ok: true, grupos }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
