import { NextResponse } from "next/server";
import { getAllUsernames, getAllPrediccionesGrupoUsuario, getAllResultados } from "@/lib/kv";
import { TODOS_PARTIDOS } from "@/lib/mundial";
import { GRUPO_GLOBAL } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  const resultados = await getAllResultados();
  const usernames = await getAllUsernames();

  const partidosConResultado = TODOS_PARTIDOS.filter(p => resultados[p.id]);

  const reporte: Record<string, string[]> = {};

  await Promise.all(usernames.slice(0, 5).map(async (username) => {
    const predicciones = await getAllPrediccionesGrupoUsuario(GRUPO_GLOBAL, username);
    const faltantes = partidosConResultado.filter(p => !predicciones[p.id]).map(p => p.id);
    if (faltantes.length > 0) reporte[username] = faltantes;
  }));

  return NextResponse.json({ totalConResultado: partidosConResultado.length, reporte });
}
