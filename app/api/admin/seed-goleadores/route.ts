import { NextRequest, NextResponse } from "next/server";
import { getClient, actualizarGoleador } from "@/lib/kv";

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
  "Netherlands": "Países Bajos", "Japan": "Japón", "Tunisia": "Túnez",
  "Sweden": "Suecia", "Belgium": "Bélgica", "Iran": "Irán",
  "Egypt": "Egipto", "New Zealand": "Nueva Zelanda", "Spain": "España",
  "Saudi Arabia": "Arabia Saudita", "Cape Verde": "Cabo Verde",
  "France": "Francia", "England": "Inglaterra", "Croatia": "Croacia",
  "Ghana": "Ghana", "Panama": "Panamá", "Australia": "Australia",
  "Serbia": "Serbia", "Ecuador": "Ecuador", "Senegal": "Senegal",
  "Paraguay": "Paraguay", "Qatar": "Qatar", "Uruguay": "Uruguay", "Argentina": "Argentina",
};

function mapTeam(name: string): string { return TEAM_MAP[name] ?? name; }

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const kv = getClient();
  let procesados = 0;

  // Procesar historial desde el inicio del torneo
  const fechaInicio = new Date("2026-06-11");
  const hoy = new Date();
  const fechas: string[] = [];
  for (let d = new Date(fechaInicio); d <= hoy; d.setDate(d.getDate() + 1)) {
    fechas.push(d.toISOString().split("T")[0]);
  }

  for (const fecha of fechas) {
    const res = await fetch(
      `https://livescore-api.com/api-client/matches/history.json?key=${LS_KEY}&secret=${LS_SECRET}&competition_id=362&from=${fecha}&to=${fecha}`,
      { cache: "no-store" }
    );
    if (!res.ok) continue;
    const data = await res.json();
    if (!data.success) continue;
    const matches = data.data?.match ?? [];

    for (const match of matches) {
      if (match.status !== "FINISHED") continue;
      const matchId = match.id?.toString() ?? "";
      const yaProc = await kv.sismember("goleadores:partidos", matchId);
      if (yaProc) continue;

      const evRes = await fetch(
        `https://livescore-api.com/api-client/scores/events.json?id=${matchId}&key=${LS_KEY}&secret=${LS_SECRET}`,
        { cache: "no-store" }
      );
      if (!evRes.ok) continue;
      const evData = await evRes.json();
      const events = evData.data?.event ?? [];

      for (const e of events) {
        if (e.event !== "GOAL" && e.event !== "GOAL_PENALTY") continue;
        const teamName = e.home_away === "h" ? match.home?.name : match.away?.name;
        const equipo = mapTeam(teamName ?? "");
        const playerKey = `${e.player}:${equipo}`.replace(/[^a-zA-Z0-9:_áéíóúÁÉÍÓÚñÑüÜ]/g, "_");
        const existing = await kv.get(`goleador:${playerKey}`);
        const prev = existing ? JSON.parse(existing) : { nombre: e.player, equipo, goles: 0, asistencias: 0 };
        prev.goles += 1;
        await actualizarGoleador(playerKey, prev);

        if (e.info) {
          const assistKey = `${e.info}:${equipo}`.replace(/[^a-zA-Z0-9:_áéíóúÁÉÍÓÚñÑüÜ]/g, "_");
          const existingA = await kv.get(`goleador:${assistKey}`);
          const prevA = existingA ? JSON.parse(existingA) : { nombre: e.info, equipo, goles: 0, asistencias: 0 };
          prevA.asistencias += 1;
          await actualizarGoleador(assistKey, prevA);
        }
      }
      await kv.sadd("goleadores:partidos", matchId);
      procesados++;
    }
  }

  return NextResponse.json({ ok: true, procesados });
}
