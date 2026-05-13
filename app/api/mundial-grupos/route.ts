import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getResultado } from "@/lib/kv";
import { TODOS_PARTIDOS } from "@/lib/mundial";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const tablaGrupos: Record<string, Record<string, any>> = {};

  // Inicializar todos los equipos con 0 en todos los grupos
  for (const p of TODOS_PARTIDOS.filter(p => p.fase === "Grupos")) {
    const g = p.grupo!;
    if (!tablaGrupos[g]) tablaGrupos[g] = {};
    if (!tablaGrupos[g][p.local]) tablaGrupos[g][p.local] = {equipo:p.local, pj:0, g:0, e:0, p:0, gf:0, gc:0, pts:0};
    if (!tablaGrupos[g][p.visitante]) tablaGrupos[g][p.visitante] = {equipo:p.visitante, pj:0, g:0, e:0, p:0, gf:0, gc:0, pts:0};
  }

  // Cargar resultados y actualizar stats
  for (const p of TODOS_PARTIDOS.filter(p => p.fase === "Grupos")) {
    const res = await getResultado(p.id);
    if (!res) continue;
    const g = p.grupo!;
    const local = tablaGrupos[g][p.local];
    const visit = tablaGrupos[g][p.visitante];
    local.pj++; local.gf += res.local; local.gc += res.visitante;
    visit.pj++; visit.gf += res.visitante; visit.gc += res.local;
    if (res.local > res.visitante) { local.g++; local.pts += 3; visit.p++; }
    else if (res.local < res.visitante) { visit.g++; visit.pts += 3; local.p++; }
    else { local.e++; local.pts++; visit.e++; visit.pts++; }
  }

  const resultado: Record<string, any[]> = {};
  for (const [g, equipos] of Object.entries(tablaGrupos)) {
    resultado[g] = Object.values(equipos)
      .sort((a: any, b: any) => b.pts - a.pts || (b.gf-b.gc) - (a.gf-a.gc));
  }

  return NextResponse.json({ tablaGrupos: resultado });
}
