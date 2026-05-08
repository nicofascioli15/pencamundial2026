// app/api/tabla/route.ts
import { NextResponse } from "next/server";
import { getAllUsernames, getAllPrediccionesUsuario, getResultado, getPuntosConfig, getUsuario, countPrediccionesUsuario } from "@/lib/kv";
import { TODOS_PARTIDOS, calcularPuntos } from "@/lib/mundial";

export async function GET() {
  const [usernames, resultadosCargados, config] = await Promise.all([
    getAllUsernames(),
    (async () => {
      const res: Record<string, { local: number; visitante: number }> = {};
      await Promise.all(
        TODOS_PARTIDOS.map(async (p) => {
          const r = await getResultado(p.id);
          if (r) res[p.id] = r;
        })
      );
      return res;
    })(),
    getPuntosConfig(),
  ]);

  const tabla = await Promise.all(
    usernames.map(async (username) => {
      const [user, predicciones, totalPicks] = await Promise.all([
        getUsuario(username),
        getAllPrediccionesUsuario(username),
        countPrediccionesUsuario(username),
      ]);

      let pts = 0, exactos = 0, ganadores = 0, jugados = 0;

      TODOS_PARTIDOS.forEach((p) => {
        const res = resultadosCargados[p.id];
        const pred = predicciones[p.id];
        if (res && pred) {
          jugados++;
          const puntos = calcularPuntos(pred, res, config);
          pts += puntos;
          if (puntos === config.resultado_exacto) exactos++;
          else if (puntos > 0) ganadores++;
        }
      });

      return {
        username,
        nombre: user?.nombre ?? username,
        pts,
        exactos,
        ganadores,
        jugados,
        totalPicks,
      };
    })
  );

  tabla.sort((a, b) => b.pts - a.pts || b.exactos - a.exactos || b.ganadores - a.ganadores);

  return NextResponse.json({ tabla, config });
}
