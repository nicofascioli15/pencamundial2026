import { NextResponse } from "next/server";
import { setResultado, getResultado, setLiveScore, delLiveScore, getClient, actualizarGoleador, setGanadorPenales } from "@/lib/kv";
import { TODOS_PARTIDOS, getFlag } from "@/lib/mundial";
import { enviarPushATodos } from "@/lib/push";

const LS_KEY = process.env.LIVESCORE_KEY ?? "";
const LS_SECRET = process.env.LIVESCORE_SECRET ?? "";
const COMPETITION_ID = "362";

const TEAM_MAP: Record<string, string> = {
  "Mexico": "México", "Korea Republic": "Corea del Sur", "South Korea": "Corea del Sur", "South Africa": "Sudáfrica",
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

async function findPartidoBracket(homeTeam: string, awayTeam: string) {
  const home = mapTeam(homeTeam);
  const away = mapTeam(awayTeam);
  const kv = getClient();
  const idPorLocal = await kv.get(`bracket:reverse:${home}`);
  const idPorVisitante = await kv.get(`bracket:reverse:${away}`);
  const partidoId = idPorLocal ?? idPorVisitante;
  if (!partidoId) return null;
  const partido = TODOS_PARTIDOS.find(p => p.id === partidoId);
  if (!partido) return null;
  // Solo usar si el partido es dentro de 24hs futuras o 48hs pasadas
  const now = Date.now();
  const matchTime = new Date(`${partido.fecha}T${partido.hora}:00-03:00`).getTime();
  const diffHoras = (matchTime - now) / 3600000;
  if (diffHoras > 24 || diffHoras < -48) return null;
  return partido;
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

    // Procesar partidos finalizados del historial
    if (histRes.ok) {
      const histData = await histRes.json();
      const histMatches = histData.data?.match ?? [];
      for (const match of histMatches) {
        if (match.status !== "FINISHED") continue;
        const score = parseScore(match.scores?.ft_score ?? "");
        if (!score) continue;
        let partido = findPartido(match.home?.name ?? "", match.away?.name ?? "");
        if (!partido) partido = findPartido(match.away?.name ?? "", match.home?.name ?? "");
        if (!partido) partido = await findPartidoBracket(match.home?.name ?? "", match.away?.name ?? "");
        if (!partido) { console.log("NO MATCH HIST:", match.home?.name, "vs", match.away?.name); continue; }
        const yaExistia = await getResultado(partido.id);
        if (!yaExistia) {
          await setResultado(partido.id, { local: score.home, visitante: score.away });
          await delLiveScore(partido.id);
          nuevos.push({ partido, local: score.home, visitante: score.away });

          // Si fue empate en los 90', resolver ganador por penales para el avance de fase
          if (score.home === score.away) {
            const psScore = match.scores?.ps_score ?? "";
            const etScore = match.scores?.et_score ?? "";
            const psParts = psScore.split("-").map((s:string)=>parseInt(s.trim()));
            if (psParts.length === 2 && !isNaN(psParts[0]) && !isNaN(psParts[1]) && psParts[0] !== psParts[1]) {
              await setGanadorPenales(partido.id, psParts[0] > psParts[1] ? "local" : "visitante");
            } else if (match.outcomes?.penalty_shootout === "1") {
              await setGanadorPenales(partido.id, "local");
            } else if (match.outcomes?.penalty_shootout === "2") {
              await setGanadorPenales(partido.id, "visitante");
            }
          }
        }
      }
    }

    const matches = data.data?.match ?? [];
    const enVivo: any[] = [];

    for (const match of matches) {
      let partido = findPartido(match.home?.name ?? "", match.away?.name ?? "");
      if (!partido) partido = await findPartidoBracket(match.home?.name ?? "", match.away?.name ?? "");
      if (!partido) { console.log("NO MATCH LIVE:", match.home?.name, "vs", match.away?.name); continue; }

      const status = match.status;
      const minuto = parseInt(match.time ?? "0") || null;

      if (status === "IN PLAY" || status === "HT" || status === "HALF TIME BREAK") {
        const score = parseScore(match.scores?.score ?? "");

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
        if (!yaExistia) {
          await setResultado(partido.id, { local: score.home, visitante: score.away });
          nuevos.push({ partido, local: score.home, visitante: score.away });

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
      const esUru = partido.local === "Uruguay" || partido.visitante === "Uruguay";
      const titulo = esUru
        ? `🇺🇾 ${flagL} ${partido.local} ${local} - ${visitante} ${partido.visitante} ${flagV} 🇺🇾`
        : `${flagL} ${partido.local} ${local} - ${visitante} ${partido.visitante} ${flagV}`;
      const ganoUruguay = (partido.local === "Uruguay" && local > visitante) || (partido.visitante === "Uruguay" && visitante > local);
      const perdioUruguay = (partido.local === "Uruguay" && local < visitante) || (partido.visitante === "Uruguay" && visitante < local);
      const cuerpoFinal = esUru
        ? ganoUruguay ? `🎉 ¡GANÓ URUGUAY! ¡Mirá cómo te fue!`
          : perdioUruguay ? `😢 Perdió Uruguay... ¡A ver cómo quedaste igual!`
          : `🤝 Uruguay empató. ¡Mirá cómo quedaste!`
        : `Resultado final. ¡Mirá cómo quedaste!`;
      await enviarPushATodos(titulo, cuerpoFinal, "/penca?tab=tabla");
    }

    // Detectar partidos que desaparecieron del live
    for (const p of TODOS_PARTIDOS) {
      const yaResult = await getResultado(p.id);
      if (yaResult) continue;
      const lastSeenRaw = await getClient().get(`live:lastseen:${p.id}`);
      if (!lastSeenRaw) continue;
      const lastSeen = JSON.parse(lastSeenRaw);
      const sigueEnVivo = enVivo.some(e => e.partidoId === p.id);
      if (sigueEnVivo) continue;
      if (Date.now() - lastSeen.ts < 20 * 60 * 1000) continue;
      const matchId = await getClient().get(`live:matchid:${p.id}`);
      try {
        if (matchId) {
          const evRes = await fetch(
            `https://livescore-api.com/api-client/scores/events.json?id=${matchId}&key=${LS_KEY}&secret=${LS_SECRET}`,
            { cache: "no-store" }
          );
          if (evRes.ok) {
            const evData = await evRes.json();
            const events = evData.data?.event ?? [];
            let localGoles = 0, visitanteGoles = 0;
            for (const e of events) {
              if (e.event === "GOAL" || e.event === "GOAL_PENALTY") {
                if (e.home_away === "h") localGoles++; else visitanteGoles++;
              } else if (e.event === "OWN_GOAL") {
                if (e.home_away === "h") visitanteGoles++; else localGoles++;
              }
            }
            for (const e of events) {
              if (e.event !== "GOAL" && e.event !== "GOAL_PENALTY") continue;
              const teamName = e.home_away === "h" ? p.local : p.visitante;
              const playerKey = `${e.player}:${teamName}`.replace(/[^a-zA-Z0-9:_áéíóúÁÉÍÓÚñÑüÜ]/g, "_");
              const existing = await getClient().get(`goleador:${playerKey}`);
              const prev = existing ? JSON.parse(existing) : { nombre: e.player, equipo: teamName, goles: 0, asistencias: 0 };
              prev.goles += 1;
              await actualizarGoleador(playerKey, prev);
            }
            await getClient().sadd("goleadores:partidos", matchId);
            const scoreReal = { local: localGoles, visitante: visitanteGoles };
            await setResultado(p.id, scoreReal);
            await delLiveScore(p.id);
            await getClient().del(`live:lastseen:${p.id}`);
            await getClient().del(`live:matchid:${p.id}`);
            nuevos.push({ partido: p, local: scoreReal.local, visitante: scoreReal.visitante });
            continue;
          }
        }
      } catch {}
      await setResultado(p.id, { local: lastSeen.local, visitante: lastSeen.visitante });
      await delLiveScore(p.id);
      await getClient().del(`live:lastseen:${p.id}`);
      if (matchId) await getClient().del(`live:matchid:${p.id}`);
      nuevos.push({ partido: p, local: lastSeen.local, visitante: lastSeen.visitante });
    }

    // Notificación 30 min antes
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
        const esUruguay = p.local === "Uruguay" || p.visitante === "Uruguay";
        const tituloPrePartido = esUruguay
          ? `🇺🇾 ¡ARRANCA URUGUAY! ${flagL} ${p.local} vs ${p.visitante} ${flagV} 🇺🇾`
          : `${flagL} ${p.local} vs ${p.visitante} ${flagV}`;
        const cuerpoPrePartido = esUruguay
          ? `⚡ ¡En 30 minutos juega la Celeste! ¡Poné tu pronóstico antes que cierre!`
          : `⏰ El partido arranca en 30 minutos. ¡Cerrá tu pronóstico!`;
        await enviarPushATodos(tituloPrePartido, cuerpoPrePartido, "/penca?tab=proximos");
        await kv.set(`push:prepartido:${p.id}`, "1", "EX", 3600);
      }
    }

    // Refrescar bracket al final
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "https://lapencadefascioli.com"}/api/bracket`, { cache: "no-store" });
    } catch {}

    return NextResponse.json(
      { ok: true, enVivo, nuevosFinalizados: nuevos.length },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
