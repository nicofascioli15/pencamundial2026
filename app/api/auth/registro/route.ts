// app/api/auth/registro/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsuario, setUsuario } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const { username, password, nombre, inviteCode } = await req.json();

  // Validar código de invitación
  const codeOk = inviteCode?.toUpperCase() === (process.env.INVITE_CODE ?? "MUNDIAL2026").toUpperCase();
  if (!codeOk)
    return NextResponse.json({ error: "Código de invitación incorrecto" }, { status: 403 });

  // Validaciones básicas
  if (!username || !password || !nombre)
    return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });

  const user = username.toLowerCase().trim();
  if (user.length < 3)
    return NextResponse.json({ error: "El usuario debe tener al menos 3 caracteres" }, { status: 400 });
  if (password.length < 6)
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });

  // Verificar que no exista
  const existente = await getUsuario(user);
  if (existente)
    return NextResponse.json({ error: "Ese nombre de usuario ya está en uso" }, { status: 409 });

  // Guardar con contraseña hasheada
  const passwordHash = await bcrypt.hash(password, 12);
  await setUsuario({
    username: user,
    passwordHash,
    nombre: nombre.trim(),
    creadoEn: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
