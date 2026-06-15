import { NextResponse } from "next/server";
import { setResultado, getResultado, setLiveScore, delLiveScore, getClient, actualizarGoleador } from "@/lib/kv";
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
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const [liveRes, histRes] = await Promise.all([
      fetch(`https://livescore-api.com/api-client/matches/live.json?key=${LS_KEY}&secret=${LS_SECRET}&competition_id=${COMPETITION_ID}`, { cache: "no-store" }),
      fetch(`https://livescore-api.com/api-client/matches/history.json?key=${LS_KEY}&secret=${LS_SECRET}&competition_id=${COMPETITION_ID}&from=${yesterday}&to=${tomorrow}`, { cache: "no-store" }),
    ]);

    if (!liveRes.ok) return NextResponse.json({ error: `API error: ${liveRes.status}` }, { status: 500 });
    const data = await liveRes.json();
    if (!data.success) return NextResponse.json({ error: data.error ?? "API error" }, { status: 500 });

    const nuevos: any[] = [];

    // Procesar partidos finalizados del historial de hoy
    if (histRes.ok) {
      const histData = await histRes.json();
      const histMatches = histData.data?.match ?? [];
      for (const match of histMatches) {
        if (match.status !== "FINISHED") continue;
        const score = parseScore(match.scores?.ft_score ?? "");
        if (!score) continue;
        let partido = findPartido(match.home?.name ?? "", match.away?.name ?? "");
        if (!partido) partido = findPartido(match.away?.name ?? "", match.home?.name ?? "");
        if (!partido) {
          console.log("NO MATCH HIST:", match.home?.name, "vs", match.away?.name);
          continue;
        }
        const yaExistia = await getResultado(partido.id);
        if (!yaExistia) {
          await setResultado(partido.id, { local: score.home, visitante: score.away });
          await delLiveScore(partido.id);
          nuevos.push({ partido, local: score.home, visitante: score.away });
        }
      }
    }

    const matches = data.data?.match ?? [];
    const enVivo: any[] = [];

    for (const match of matches) {
      const partido = findPartido(match.home?.name ?? "", match.away?.name ?? "");
      if (!partido) continue;

      const status = match.status;
      const minuto = parseInt(match.time ?? "0") || null;

      if (status === "IN PLAY" || status === "HT" || status === "HALF TIME BREAK") {
        const score = parseScore(match.scores?.score ?? "");

        // Traer eventos (goles y tarjetas)
        let goles: any[] = [];
        try {
          const evRes = await fetch(
            `https://livescore-api.com/api-client/scores/events.json?id=${match.id}&key=${LS_KEY}&secret=${LS_SECRET}`,
            { cache: "no-store" }
          );
          if (evRes.ok) {
            const evData = await evRes.json();
            const events = evData.data?.event ?? [];
            goles = events
              .filter((e: any) => ["GOAL","OWN_GOAL","GOAL_PENALTY","YELLOW_CARD"].includes(e.event))
              .map((e: any) => ({
                minuto: e.time,
                jugador: e.player,
                esPropio: e.event === "OWN_GOAL",
                esPenal: e.event === "GOAL_PENALTY",
                esAmarilla: e.event === "YELLOW_CARD",
                equipo: e.home_away,
              }));
          }
        } catch {}

        const liveScore = { local: score?.home ?? 0, visitante: score?.away ?? 0 };
        await setLiveScore(partido.id, liveScore);
        await getClient().set(`live:matchid:${partido.id}`, match.id?.toString() ?? "");
        // Guardar último score visto con timestamp
        await getClient().set(`live:lastseen:${partido.id}`, JSON.stringify({
          ...liveScore, ts: Date.now()
        }));
        enVivo.push({
          partidoId: partido.id,
          estado: (status === "HT" || status === "HALF TIME BREAK") ? "entretiempo" : "jugando",
          minuto: status === "HT" ? null : minuto,
          local: liveScore.local,
          visitante: liveScore.visitante,
          goles,
        });

      } else if (status === "FT") {
        const ftScore = match.scores?.ft_score ?? "";
        const score = parseScore(ftScore) ?? parseScore(match.scores?.score ?? "");
        if (!score) continue;
        const yaExistia = await getResultado(partido.id);
        // Solo guardar si no existe ya — no pisar resultado manual
        if (!yaExistia) {
          await setResultado(partido.id, { local: score.home, visitante: score.away });
          nuevos.push({ partido, local: score.home, visitante: score.away });

          // Guardar goleadores del partido
          try {
            const kv = getClient();
            const yaProc = await kv.sismember("goleadores:partidos", match.id?.toString() ?? "");
            if (!yaProc) {
              const evRes = await fetch(
                `https://livescore-api.com/api-client/scores/events.json?id=${match.id}&key=${LS_KEY}&secret=${LS_SECRET}`,
                { cache: "no-store" }
              );
              if (evRes.ok) {
                const evData = await evRes.json();
                const events = evData.data?.event ?? [];
                const kv2 = getClient();
                for (const e of events) {
                  if (e.event !== "GOAL" && e.event !== "GOAL_PENALTY") continue;
                  const teamName = e.home_away === "h" ? match.home?.name : match.away?.name;
                  const equipo = mapTeam(teamName ?? "");
                  const playerKey = `${e.player}:${equipo}`.replace(/[^a-zA-Z0-9:_áéíóúÁÉÍÓÚñÑüÜ]/g, "_");
                  const existing = await kv2.get(`goleador:${playerKey}`);
                  const prev = existing ? JSON.parse(existing) : { nombre: e.player, equipo, goles: 0, asistencias: 0 };
                  prev.goles += 1;
                  // Asistencia va al jugador en el campo "info"
                  if (e.info) {
                    const assistKey = `${e.info}:${equipo}`.replace(/[^a-zA-Z0-9:_áéíóúÁÉÍÓÚñÑüÜ]/g, "_");
                    const existingA = await kv2.get(`goleador:${assistKey}`);
                    const prevA = existingA ? JSON.parse(existingA) : { nombre: e.info, equipo, goles: 0, asistencias: 0 };
                    prevA.asistencias += 1;
                    await actualizarGoleador(assistKey, prevA);
                  }
                  await actualizarGoleador(playerKey, prev);
                }
                await kv.sadd("goleadores:partidos", match.id?.toString() ?? "");
              }
            }
          } catch {}
        }
        await delLiveScore(partido.id);
      }
    }

    for (const { partido, local, visitante } of nuevos) {
      const flagL = getFlag(partido.local);
      const flagV = getFlag(partido.visitante);
      const titulo = `${flagL} ${partido.local} ${local} - ${visitante} ${partido.visitante} ${flagV}`;
      await enviarPushATodos(titulo, `Resultado final. ¡Mirá cómo quedaste!`, "/penca?tab=tabla");
    }

    // Detectar partidos que desaparecieron del live usando último score visto
    for (const p of TODOS_PARTIDOS) {
      const yaResult = await getResultado(p.id);
      if (yaResult) continue;
      const lastSeenRaw = await getClient().get(`live:lastseen:${p.id}`);
      if (!lastSeenRaw) continue;
      const lastSeen = JSON.parse(lastSeenRaw);
      const sigueEnVivo = enVivo.some(e => e.partidoId === p.id);
      if (sigueEnVivo) continue;
      // Si desapareció del live y pasaron más de 15 minutos → asumir FT
      if (Date.now() - lastSeen.ts > 15 * 60 * 1000) {
        await setResultado(p.id, { local: lastSeen.local, visitante: lastSeen.visitante });
        await delLiveScore(p.id);
        await getClient().del(`live:lastseen:${p.id}`);
        await getClient().del(`live:matchid:${p.id}`);
        nuevos.push({ partido: p, local: lastSeen.local, visitante: lastSeen.visitante });
        continue;
      }
    }

    // Chequear partidos que estaban en vivo pero ya no aparecen (pueden haber terminado)
    for (const p of TODOS_PARTIDOS) {
      const yaResult = await getResultado(p.id);
      if (yaResult) continue;
      const matchId = await getClient().get(`live:matchid:${p.id}`);
      if (!matchId) continue;
      const sigueEnVivo = enVivo.some(e => e.partidoId === p.id);
      if (sigueEnVivo) continue;
      // No está en vivo ni tiene resultado — buscar directamente
      try {
        const mRes = await fetch(
          `https://livescore-api.com/api-client/scores/history.json?id=${matchId}&key=${LS_KEY}&secret=${LS_SECRET}`,
          { cache: "no-store" }
        );
        if (mRes.ok) {
          const mData = await mRes.json();
          const match = mData.data?.match;
          if (match?.status === "FINISHED" || match?.time === "FT") {
            const ftScore = parseScore(match.scores?.ft_score ?? match.scores?.score ?? "");
            if (ftScore) {
              await setResultado(p.id, { local: ftScore.home, visitante: ftScore.away });
              await delLiveScore(p.id);
              await getClient().del(`live:matchid:${p.id}`);
              nuevos.push({ partido: p, local: ftScore.home, visitante: ftScore.away });
            }
          }
        }
      } catch {}
    }

    // Notificación 30 min antes del partido
    const ahora = Date.now();
    const kv = getClient();
    for (const p of TODOS_PARTIDOS) {
      const [h, m] = p.hora.split(":").map(Number);
      const [y, mo, d] = p.fecha.split("-").map(Number);
      const kickoffUTC = Date.UTC(y, mo-1, d, h+3, m, 0);
      const diff = kickoffUTC - ahora;
      const yaNotificado = await kv.get(`push:prepartido:${p.id}`);
      if (diff > 0 && diff <= 30*60*1000 && !yaNotificado) {
        const flagL = getFlag(p.local);
        const flagV = getFlag(p.visitante);
        await enviarPushATodos(
          `${flagL} ${p.local} vs ${p.visitante} ${flagV}`,
          `⏰ El partido arranca en 30 minutos. ¡Cerrá tu pronóstico!`,
          "/penca?tab=proximos"
        );
        await kv.set(`push:prepartido:${p.id}`, "1", "EX", 3600);
      }
    }

    return NextResponse.json(
      { ok: true, enVivo, nuevosFinalizados: nuevos.length },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
