import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getGrupo, setGrupo, getGruposUsuario, getMiembrosGrupo, getUsuario, getGruposByCodigo, setGrupoCodigoIndex, agregarUsuarioAGrupo, GRUPO_GLOBAL, countPrediccionesGrupoUsuario, getAllPrediccionesGrupoUsuario, setPrediccionGrupo, getPrediccionGrupo, getAllUsernames } from "@/lib/kv";
import { TODOS_PARTIDOS, calcularPuntos, PUNTOS_DEFAULT } from "@/lib/mundial";
import { getPuntosConfig, getResultado } from "@/lib/kv";

export const dynamic = "force-dynamic";

function generarCodigo(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const grupoIds = await getGruposUsuario(session.username);
  if (!grupoIds.includes(GRUPO_GLOBAL)) grupoIds.unshift(GRUPO_GLOBAL);

  const config = await getPuntosConfig();

  const grupos = await Promise.all(grupoIds.map(async (gId) => {
    const grupo = gId === GRUPO_GLOBAL
      ? { id: GRUPO_GLOBAL, nombre: "PencaFascioli", codigo: "GLOBAL", ownerUsername: "admin", creadoEn: "" }
      : await getGrupo(gId);
    if (!grupo) return null;

    const miembros = await getMiembrosGrupo(gId);
    const usuariosValidos = await getAllUsernames();
    const miembrosValidos = miembros.filter(u => usuariosValidos.includes(u));
    const resultados: Record<string, { local: number; visitante: number }> = {};
    await Promise.all(TODOS_PARTIDOS.map(async p => {
      const r = await getResultado(p.id);
      if (r) resultados[p.id] = r;
    }));

    const tabla = await Promise.all(miembrosValidos.map(async (u) => {
      const user = await getUsuario(u);
      const preds = await getAllPrediccionesGrupoUsuario(gId, u);
      let pts = 0, exactos = 0, ganadores = 0;
      TODOS_PARTIDOS.forEach(p => {
        const res = resultados[p.id];
        const pred = preds[p.id];
        if (res && pred) {
          const puntos = calcularPuntos(pred, res, config);
          pts += puntos;
          if (puntos === config.resultado_exacto) exactos++;
          else if (puntos > 0) ganadores++;
        }
      });
      return { username: u, nombre: user?.nombre ?? u, pts, exactos, ganadores };
    }));

    tabla.sort((a, b) => b.pts - a.pts);
    const miPos = tabla.findIndex(r => r.username === session.username) + 1;
    const miInfo = tabla.find(r => r.username === session.username);

    return {
      id: grupo.id,
      nombre: grupo.nombre,
      codigo: grupo.codigo,
      miembros: miembrosValidos.length,
      miPos,
      miPts: miInfo?.pts ?? 0,
      miExactos: miInfo?.exactos ?? 0,
      miGanadores: miInfo?.ganadores ?? 0,
      tabla: tabla.slice(0, 5),
    };
  }));

  return NextResponse.json({ grupos: grupos.filter(Boolean) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { nombre } = await req.json();
  if (!nombre?.trim()) return NextResponse.json({ error: "Falta el nombre" }, { status: 400 });

  let codigo = generarCodigo();
  let intentos = 0;
  while (await getGruposByCodigo(codigo) && intentos < 10) {
    codigo = generarCodigo();
    intentos++;
  }

  const grupoId = `g_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
  const grupo = {
    id: grupoId,
    nombre: nombre.trim(),
    codigo,
    ownerUsername: session.username,
    creadoEn: new Date().toISOString(),
  };

  await setGrupo(grupo);
  await setGrupoCodigoIndex(codigo, grupoId);
  await agregarUsuarioAGrupo(session.username, grupoId);

  // Replicar picks de PencaFascioli al nuevo grupo (solo no bloqueados)
  const predsGlobal = await getAllPrediccionesGrupoUsuario(GRUPO_GLOBAL, session.username);
  const { TODOS_PARTIDOS } = await import("@/lib/mundial");
  const ahora = Date.now();
  await Promise.all(
    TODOS_PARTIDOS
      .filter(p => {
        const [h, m] = p.hora.split(":").map(Number);
        const bloqueoMs = new Date(`${p.fecha}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`).getTime() - 3*60*1000;
        return bloqueoMs > ahora && predsGlobal[p.id];
      })
      .map(p => setPrediccionGrupo(grupoId, session.username, p.id, predsGlobal[p.id]))
  );

  return NextResponse.json({ ok: true, grupo });
}
