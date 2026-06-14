import { NextRequest, NextResponse } from "next/server";
import { getAllUsernames, getAllPrediccionesGrupoUsuario, getAllPrediccionesUsuario, getResultado, deleteUsuario, GRUPO_GLOBAL } from "@/lib/kv";
import { TODOS_PARTIDOS } from "@/lib/mundial";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Listar usuarios sin ningún pronóstico en partidos finalizados
  const usernames = await getAllUsernames();
  const partidos_finalizados: string[] = [];

  for (const p of TODOS_PARTIDOS) {
    const res = await getResultado(p.id);
    if (res) partidos_finalizados.push(p.id);
  }

  const sin_pronosticos: string[] = [];

  for (const username of usernames) {
    const [predsGrupo, predsLegacy] = await Promise.all([
      getAllPrediccionesGrupoUsuario(GRUPO_GLOBAL, username),
      getAllPrediccionesUsuario(username),
    ]);
    const todasPreds = { ...predsLegacy, ...predsGrupo };
    const tieneAlguno = partidos_finalizados.some(pid => todasPreds[pid]);
    if (!tieneAlguno) sin_pronosticos.push(username);
  }

  return NextResponse.json({
    total_usuarios: usernames.length,
    partidos_finalizados: partidos_finalizados.length,
    sin_pronosticos,
    count: sin_pronosticos.length,
  });
}

export async function DELETE(req: NextRequest) {
  const { usernames } = await req.json();
  if (!usernames || !Array.isArray(usernames)) {
    return NextResponse.json({ error: "Falta lista de usernames" }, { status: 400 });
  }
  let borrados = 0;
  for (const u of usernames) {
    await deleteUsuario(u);
    borrados++;
  }
  return NextResponse.json({ ok: true, borrados });
}
