import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMiembrosGrupo, getUsuario, getAllPrediccionesGrupoUsuario, getResultado, getPuntosConfig, GRUPO_GLOBAL, getAllUsernames } from "@/lib/kv";
import { TODOS_PARTIDOS, calcularPuntos } from "@/lib/mundial";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const grupoId = req.nextUrl.searchParams.get("grupoId") ?? GRUPO_GLOBAL;
  const [miembros, config] = await Promise.all([
    getMiembrosGrupo(grupoId),
    getPuntosConfig(),
  ]);

  const resultados: Record<string, { local: number; visitante: number }> = {};
  await Promise.all(TODOS_PARTIDOS.map(async p => {
    const r = await getResultado(p.id);
    if (r) resultados[p.id] = r;
  }));

  // Filtrar solo usuarios que existen
  const usuariosValidos = await getAllUsernames();
  const miembrosValidos = miembros.filter(u => usuariosValidos.includes(u));

  const tabla = await Promise.all(miembrosValidos.map(async (username) => {
    const [user, predicciones] = await Promise.all([
      getUsuario(username),
      getAllPrediccionesGrupoUsuario(grupoId, username),
    ]);
    let pts = 0, exactos = 0, ganadores = 0, jugados = 0;
    TODOS_PARTIDOS.forEach(p => {
      const res = resultados[p.id];
      const pred = predicciones[p.id];
      if (res && pred) {
        jugados++;
        const puntos = calcularPuntos(pred, res, config);
        pts += puntos;
        if (puntos === config.resultado_exacto) exactos++;
        else if (puntos > 0) ganadores++;
      }
    });
    return { username, nombre: user?.nombre ?? username, pts, exactos, ganadores, jugados };
  }));

  tabla.sort((a, b) => b.pts - a.pts || b.exactos - a.exactos);
  return NextResponse.json({ tabla, config });
}
