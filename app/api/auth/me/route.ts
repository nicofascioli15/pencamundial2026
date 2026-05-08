// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUsuario } from "@/lib/kv";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  if (session.isAdmin) {
    return NextResponse.json({
      user: { username: session.username, nombre: "Administrador", isAdmin: true },
    });
  }

  const user = await getUsuario(session.username);
  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: { username: user.username, nombre: user.nombre, isAdmin: false },
  });
}
