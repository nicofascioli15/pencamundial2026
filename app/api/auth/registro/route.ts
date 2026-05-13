// app/api/auth/registro/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsuario, setUsuario, agregarUsuarioAGrupo, GRUPO_GLOBAL } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const { username, password, nombre } = await req.json();

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

  // Agregar al grupo global automáticamente
  await agregarUsuarioAGrupo(user, GRUPO_GLOBAL);

  return NextResponse.json({ ok: true });
}
