import { NextResponse } from "next/server";
import { getAllResultados } from "@/lib/kv";
import { TODOS_PARTIDOS, GRUPOS } from "@/lib/mundial";

export const dynamic = "force-dynamic";

// Tabla de combinaciones FIFA - Annex C del reglamento
// Key: 8 grupos ordenados que clasifican 3ros (ej "ABDEFGHI")
// Value: [vs1A, vs1B, vs1D, vs1E, vs1G, vs1I, vs1K, vs1L] = grupo cuyo 3ro va a ese slot
// Slots: 1A=R32_07, 1B=R32_13, 1D=R32_10, 1E=R32_03, 1G=R32_09, 1I=R32_06, 1K=R32_16, 1L=R32_08
const COMB: Record<string, string[]> = {
  "BEFGHJKL":["E","J","B","F","H","G","L","K"],
  "BDEFIJKL":["E","J","B","D","I","F","L","K"],
  "BDEFHJKL":["E","J","B","D","H","F","L","K"],
  "BDEFHIKL":["E","I","B","D","H","F","L","K"],
  "BDEFHIJL":["E","J","B","D","H","F","L","I"],
  "BDEFHIJK":["E","J","B","D","H","F","I","K"],
  "BDEFGJKL":["E","G","B","D","J","F","L","K"],
  "BDEFGIKL":["E","G","B","D","I","F","L","K"],
  "BDEFGIJL":["E","G","B","D","J","F","L","I"],
  "BDEFGIJK":["E","G","B","D","J","F","I","K"],
  "BDEFGHKL":["E","G","B","D","H","F","L","K"],
  "BDEFGHJL":["H","G","B","D","J","F","L","E"],
  "BDEFGHJK":["H","G","B","D","J","F","E","K"],
  "BDEFGHIL":["E","G","B","D","H","F","L","I"],
  "BDEFGHIK":["E","G","B","D","H","F","I","K"],
  "BDEFGHIJ":["H","G","B","D","J","F","E","I"],
  "ABDEFJKL":["E","J","B","D","A","F","L","K"],
  "ABDEFIKL":["E","I","B","D","A","F","L","K"],
  "ABDEFIJL":["E","J","B","D","A","F","L","I"],
  "ABDEFIJK":["E","J","B","D","A","F","I","K"],
  "ABDEFHKL":["H","E","B","D","A","F","L","K"],
  "ABDEFHJL":["H","J","B","D","A","F","L","E"],
  "ABDEFHJK":["H","J","B","D","A","F","E","K"],
  "ABDEFHIL":["H","E","B","D","A","F","L","I"],
  "ABDEFHIK":["H","E","B","D","A","F","I","K"],
  "ABDEFHIJ":["H","J","B","D","A","F","E","I"],
  "ABDEFGKL":["E","G","B","D","A","F","L","K"],
  "ABDEFGJL":["E","G","B","D","A","F","L","J"],
  "ABDEFGJK":["E","G","B","D","A","F","J","K"],
  "ABDEFGIL":["E","G","B","D","A","F","L","I"],
  "ABDEFGIK":["E","G","B","D","A","F","I","K"],
  "ABDEFGIJ":["E","G","B","D","A","F","I","J"],
  "ABDEFGHL":["H","G","B","D","A","F","L","E"],
  "ABDEFGHK":["H","G","B","D","A","F","E","K"],
  "ABDEFGHJ":["H","G","B","D","A","F","E","J"],
  "ABDEFGHI":["H","G","B","D","A","F","E","I"],
  "ABCDEFKL":["C","E","B","D","A","F","L","K"],
  "ABCDEFJL":["C","J","B","D","A","F","L","E"],
  "ABCDEFJK":["C","J","B","D","A","F","E","K"],
  "ABCDEFIL":["C","E","B","D","A","F","L","I"],
  "ABCDEFIK":["C","E","B","D","A","F","I","K"],
  "ABCDEFIJ":["C","J","B","D","A","F","E","I"],
  "ABCDEFHL":["H","F","B","C","A","D","L","E"],
  "ABCDEFHK":["H","E","B","C","A","F","D","K"],
  "ABCDEFHJ":["H","J","B","C","A","F","D","E"],
  "ABCDEFHI":["H","E","B","C","A","F","D","I"],
  "ABCDEFGL":["C","G","B","D","A","F","L","E"],
  "ABCDEFGK":["C","G","B","D","A","F","E","K"],
  "ABCDEFGJ":["C","G","B","D","A","F","E","J"],
  "ABCDEFGI":["C","G","B","D","A","F","E","I"],
  "ABCDEFGH":["H","G","B","C","A","F","D","E"],
};

// Mapeo de slots a IDs de partido R32
const SLOT_TO_R32: Record<string, string> = {
  "1A":"R32_07","1B":"R32_13","1D":"R32_10","1E":"R32_03",
  "1G":"R32_09","1I":"R32_06","1K":"R32_16","1L":"R32_08"
};

interface TeamInfo { equipo: string; pj: number; pts: number; dg: number; gf: number; grupo: string; }

async function calcularStandings(resultados: Record<string, {local:number;visitante:number}>): Promise<Record<string, TeamInfo[]>> {
  const grupos: Record<string, TeamInfo[]> = {};
  for (const [grupo, equipos] of Object.entries(GRUPOS)) {
    const tabla: Record<string, TeamInfo> = {};
    for (const eq of equipos) tabla[eq] = { equipo: eq, pj:0, pts:0, dg:0, gf:0, grupo };
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
    grupos[grupo] = Object.values(tabla).sort((a,b) => b.pts-a.pts || b.dg-a.dg || b.gf-a.gf);
  }
  return grupos;
}

function resolverTeam(placeholder: string, standings: Record<string, TeamInfo[]>, resultados: Record<string, {local:number;visitante:number}>, tercerosPorGrupo: Record<string, TeamInfo>): string | null {
  const pos = placeholder.match(/^([12])° Gr\. ([A-L])$/);
  if (pos) {
    const idx = parseInt(pos[1]) - 1;
    const g = pos[2];
    const eq = standings[g]?.[idx];
    if (eq && eq.pj > 0) return eq.equipo;
    return null;
  }

  const gan = placeholder.match(/^Gan\. (.+)$/);
  if (gan) {
    const pid = gan[1];
    const p = TODOS_PARTIDOS.find(x => x.id === pid);
    const res = resultados[pid];
    if (p && res) {
      const localTeam = resolverTeam(p.local, standings, resultados, tercerosPorGrupo) ?? p.local;
      const visitanteTeam = resolverTeam(p.visitante, standings, resultados, tercerosPorGrupo) ?? p.visitante;
      if (res.local > res.visitante) return localTeam;
      if (res.visitante > res.local) return visitanteTeam;
    }
    return null;
  }

  if (placeholder.startsWith("Mejor 3°")) return null; // resolto por combinacion

  return null;
}

export async function GET() {
  try {
    const resultados = await getAllResultados();
    const standings = await calcularStandings(resultados);

    // Calcular mejores 3ros
    const terceros: TeamInfo[] = [];
    const tercerosPorGrupo: Record<string, TeamInfo> = {};
    for (const [g, equipos] of Object.entries(standings)) {
      if (equipos.length >= 3 && equipos[2].pj >= 2) {
        terceros.push(equipos[2]);
        tercerosPorGrupo[g] = equipos[2];
      }
    }
    terceros.sort((a,b) => b.pts-a.pts || b.dg-a.dg || b.gf-a.gf || a.grupo.localeCompare(b.grupo));
    const top8 = terceros.slice(0, 8);
    const gruposTerceros = top8.map(t => t.grupo).sort().join("");

    // Resolver asignaciones de mejores 3ros via tabla FIFA
    const asignacionesTerceros: Record<string, string> = {};
    if (gruposTerceros.length === 8 && COMB[gruposTerceros]) {
      const slots = ["1A","1B","1D","1E","1G","1I","1K","1L"];
      const asignaciones = COMB[gruposTerceros];
      slots.forEach((slot, i) => {
        const grupoTercero = asignaciones[i];
        const r32Id = SLOT_TO_R32[slot];
        const equipo = tercerosPorGrupo[grupoTercero]?.equipo;
        if (r32Id && equipo) asignacionesTerceros[r32Id] = equipo;
      });
    }

    const bracket: Record<string, {local:string|null;visitante:string|null}> = {};
    for (const p of TODOS_PARTIDOS) {
      if (p.fase === "Grupos") continue;
      
      let local: string | null = resolverTeam(p.local, standings, resultados, tercerosPorGrupo);
      let visitante: string | null = resolverTeam(p.visitante, standings, resultados, tercerosPorGrupo);

      // Si es un slot de Mejor 3°, usar la asignación FIFA
      if (p.local.startsWith("Mejor 3°")) local = asignacionesTerceros[p.id] ?? null;
      if (p.visitante.startsWith("Mejor 3°")) visitante = asignacionesTerceros[p.id] ?? null;

      bracket[p.id] = { local, visitante };
    }

    return NextResponse.json({ ok: true, bracket, gruposTerceros, top8terceros: top8.map(t=>({equipo:t.equipo,grupo:t.grupo,pts:t.pts})) }, 
      { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
