import { NextResponse } from "next/server";
import { getAllResultados } from "@/lib/kv";
import { TODOS_PARTIDOS, GRUPOS } from "@/lib/mundial";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const resultados = await getAllResultados();

    // Calcular standings desde nuestros resultados
    const grupos: Record<string, any[]> = {};

    for (const [grupo, equipos] of Object.entries(GRUPOS)) {
      const tabla: Record<string, any> = {};
      for (const eq of equipos) {
        tabla[eq] = { equipo: eq, pj: 0, g: 0, e: 0, p: 0, gf: 0, ga: 0, dg: 0, pts: 0 };
      }

      for (const partido of TODOS_PARTIDOS) {
        if (partido.grupo !== grupo) continue;
        const res = resultados[partido.id];
        if (!res) continue;

        const local = tabla[partido.local];
        const visitante = tabla[partido.visitante];
        if (!local || !visitante) continue;

        local.pj++; visitante.pj++;
        local.gf += res.local; local.ga += res.visitante;
        visitante.gf += res.visitante; visitante.ga += res.local;
        local.dg = local.gf - local.ga;
        visitante.dg = visitante.gf - visitante.ga;

        if (res.local > res.visitante) {
          local.g++; local.pts += 3; visitante.p++;
        } else if (res.local < res.visitante) {
          visitante.g++; visitante.pts += 3; local.p++;
        } else {
          local.e++; local.pts++; visitante.e++; visitante.pts++;
        }
      }

      grupos[grupo] = Object.values(tabla).sort((a, b) =>
        b.pts - a.pts || b.dg - a.dg || b.gf - a.gf
      );
    }

    return NextResponse.json({ ok: true, grupos }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
