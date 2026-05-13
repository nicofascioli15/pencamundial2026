import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getResultado } from "@/lib/kv";
import { TODOS_PARTIDOS } from "@/lib/mundial";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const tablaGrupos: Record<string, Record<string, any>> = {};

  for (const p of TODOS_PARTIDOS.filter(p => p.fase === "Grupos")) {
    const grupo = p.grupo!;
    if (!tablaGrupos[grupo]) tablaGrupos[grupo] = {} as Record<string, any>;

    const res = await getResultado(p.id);
    if (!res) continue;

    const equipos = tablaGrupos[grupo] as any;
    for (const [equipo, gf, gc] of [[p.local, res.local, res.visitante],[p.visitante, res.visitante, res.local]]) {
      if (!equipos[equipo as string]) equipos[equipo as string] = {equipo, pj:0, g:0, e:0, p:0, gf:0, gc:0, pts:0};
      const e = equipos[equipo as string];
      e.pj++; e.gf += gf as number; e.gc += gc as number;
      if ((gf as number) > (gc as number)) { e.g++; e.pts += 3; }
      else if ((gf as number) === (gc as number)) { e.e++; e.pts += 1; }
      else e.p++;
    }
  }

  const resultado: Record<string, any[]> = {};
  for (const [g, equipos] of Object.entries(tablaGrupos)) {
    resultado[g] = Object.values(equipos as any)
      .sort((a: any, b: any) => b.pts - a.pts || (b.gf-b.gc) - (a.gf-a.gc));
  }

  return NextResponse.json({ tablaGrupos: resultado });
}
