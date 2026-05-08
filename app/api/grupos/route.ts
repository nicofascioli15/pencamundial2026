// app/api/grupos/route.ts
// Calcula la tabla de posiciones de cada grupo basada en resultados cargados
import { NextResponse } from "next/server";
import { getAllResultados } from "@/lib/kv";
import { GRUPOS, TODOS_PARTIDOS } from "@/lib/mundial";

export interface FilaGrupo {
  equipo: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  ga: number;
  dg: number;
  pts: number;
}

export async function GET() {
  const resultados = await getAllResultados();
  const tablaGrupos: Record<string, FilaGrupo[]> = {};

  Object.entries(GRUPOS).forEach(([grupo, equipos]) => {
    // Inicializar tabla del grupo
    const tabla: Record<string, FilaGrupo> = {};
    equipos.forEach(eq => {
      tabla[eq] = { equipo: eq, pj: 0, g: 0, e: 0, p: 0, gf: 0, ga: 0, dg: 0, pts: 0 };
    });

    // Procesar partidos del grupo
    const partidos = TODOS_PARTIDOS.filter(p => p.fase === "Grupos" && p.grupo === grupo);
    partidos.forEach(partido => {
      const res = resultados[partido.id];
      if (!res) return;

      const local = tabla[partido.local];
      const visitante = tabla[partido.visitante];
      if (!local || !visitante) return;

      local.pj++;
      visitante.pj++;
      local.gf += res.local;
      local.ga += res.visitante;
      visitante.gf += res.visitante;
      visitante.ga += res.local;
      local.dg = local.gf - local.ga;
      visitante.dg = visitante.gf - visitante.ga;

      if (res.local > res.visitante) {
        local.g++; local.pts += 3;
        visitante.p++;
      } else if (res.local < res.visitante) {
        visitante.g++; visitante.pts += 3;
        local.p++;
      } else {
        local.e++; local.pts++;
        visitante.e++; visitante.pts++;
      }
    });

    // Ordenar: pts → dg → gf
    tablaGrupos[grupo] = Object.values(tabla).sort(
      (a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf
    );
  });

  return NextResponse.json({ tablaGrupos });
}
