// app/api/usuarios/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllUsernames, getUsuario, countPrediccionesUsuario } from "@/lib/kv";

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin)
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const usernames = await getAllUsernames();
  const usuarios = await Promise.all(
    usernames.map(async (u) => {
      const user = await getUsuario(u);
      const picks = await countPrediccionesUsuario(u);
      return { username: u, nombre: user?.nombre ?? u, picks, creadoEn: user?.creadoEn };
    })
  );

  return NextResponse.json({ usuarios });
}
