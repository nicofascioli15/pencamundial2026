import { NextResponse } from "next/server";
import { getAllResultados } from "@/lib/kv";
import { TODOS_PARTIDOS, GRUPOS } from "@/lib/mundial";

export const dynamic = "force-dynamic";

interface TeamInfo { equipo: string; pj: number; pts: number; dg: number; gf: number; }

async function calcularStandings(): Promise<Record<string, TeamInfo[]>> {
  const resultados = await getAllResultados();
  const grupos: Record<string, TeamInfo[]> = {};

  for (const [grupo, equipos] of Object.entries(GRUPOS)) {
    const tabla: Record<string, TeamInfo> = {};
    for (const eq of equipos) tabla[eq] = { equipo: eq, pj: 0, pts: 0, dg: 0, gf: 0 };

    for (const p of TODOS_PARTIDOS) {
      if (p.grupo !== grupo) continue;
      const res = resultados[p.id];
      if (!res) continue;
      const l = tabla[p.local], v = tabla[p.visitante];
      if (!l || !v) continue;
      l.pj++; v.pj++;
      l.gf += res.local; v.gf += res.visitante;
      l.dg += res.local - res.visitante; v.dg += res.visitante - res.local;
      if (res.local > res.visitante) { l.pts += 3; }
      else if (res.local < res.visitante) { v.pts += 3; }
      else { l.pts++; v.pts++; }
    }

    grupos[grupo] = Object.values(tabla).sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
  }
  return grupos;
}

function resolverEquipo(placeholder: string, standings: Record<string, TeamInfo[]>, resultados: Record<string, { local: number; visitante: number }>): string | null {
  // "1° Gr. A" → primer equipo del grupo A
  const posMatch = placeholder.match(/^([12])° Gr\. ([A-L])$/);
  if (posMatch) {
    const pos = parseInt(posMatch[1]) - 1;
    const grupo = posMatch[2];
    const equipos = standings[grupo];
    if (equipos && equipos[pos] && equipos[pos].pj > 0) return equipos[pos].equipo;
    return null;
  }

  // "Gan. R32_01" → ganador del partido R32_01
  const ganMatch = placeholder.match(/^Gan\. (.+)$/);
  if (ganMatch) {
    const partidoId = ganMatch[1];
    const partido = TODOS_PARTIDOS.find(p => p.id === partidoId);
    const res = resultados[partidoId];
    if (partido && res) {
      if (res.local > res.visitante) return resolverEquipo(partido.local, standings, resultados) ?? partido.local;
      if (res.visitante > res.local) return resolverEquipo(partido.visitante, standings, resultados) ?? partido.visitante;
    }
    return null;
  }

  // "Mejor 3°..." → se resuelve cuando termine la fase de grupos
  if (placeholder.startsWith("Mejor 3°")) {
    return null; // Por definir hasta que terminen todos los grupos
  }

  return null;
}

export async function GET() {
  try {
    const [standings, resultados] = await Promise.all([
      calcularStandings(),
      getAllResultados(),
    ]);

    const bracket: Record<string, { local: string | null; visitante: string | null }> = {};

    for (const p of TODOS_PARTIDOS) {
      if (p.fase === "Grupos") continue;
      bracket[p.id] = {
        local: resolverEquipo(p.local, standings, resultados),
        visitante: resolverEquipo(p.visitante, standings, resultados),
      };
    }

    return NextResponse.json({ ok: true, bracket }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
