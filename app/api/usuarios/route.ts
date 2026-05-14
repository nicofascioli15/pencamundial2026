// app/api/usuarios/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllUsernames, getUsuario, countPrediccionesUsuario, getGruposUsuario, getGrupo } from "@/lib/kv";

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin)
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const usernames = await getAllUsernames();
  const usuarios = await Promise.all(
    usernames.map(async (u) => {
      const user = await getUsuario(u);
      const picks = await countPrediccionesUsuario(u);
      const grupoIds = await getGruposUsuario(u);
      const gruposNombres = await Promise.all(grupoIds.map(async gId => {
        const g = await getGrupo(gId);
        return g ? g.nombre : null;
      }));
      return { username: u, nombre: user?.nombre ?? u, picks, creadoEn: user?.creadoEn, grupos: gruposNombres.filter(Boolean) };
    })
  );

  return NextResponse.json({ usuarios });
}

import { deleteUsuario, setUsuario } from "@/lib/kv";
import { hash } from "bcryptjs";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { username, nombre, password } = await req.json();
  if (!username) return NextResponse.json({ error: "Falta username" }, { status: 400 });
  const user = await getUsuario(username);
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  if (nombre) user.nombre = nombre.trim();
  if (password) user.passwordHash = await hash(password, 10);
  await setUsuario(user);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { username } = await req.json();
  if (!username) return NextResponse.json({ error: "Falta username" }, { status: 400 });
  await deleteUsuario(username);
  return NextResponse.json({ ok: true });
}
