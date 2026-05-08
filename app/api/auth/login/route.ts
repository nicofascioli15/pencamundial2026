// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken, isAdminCredentials } from "@/lib/auth";
import { getUsuario } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password)
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });

  // ── Superadmin ───────────────────────────────────────────────────
  if (isAdminCredentials(username, password)) {
    const token = await signToken({ username, isAdmin: true });
    const res = NextResponse.json({ ok: true, isAdmin: true, nombre: "Administrador" });
    res.cookies.set("penca_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  }

  // ── Usuario normal ───────────────────────────────────────────────
  const user = await getUsuario(username.toLowerCase());
  if (!user)
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok)
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });

  const token = await signToken({ username: user.username, isAdmin: false });
  const response = NextResponse.json({ ok: true, isAdmin: false, nombre: user.nombre });
  response.cookies.set("penca_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
