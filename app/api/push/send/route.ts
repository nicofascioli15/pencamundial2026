import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getClient } from "@/lib/kv";
import webpush from "web-push";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const email = process.env.VAPID_EMAIL;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!email || !publicKey || !privateKey) {
    return NextResponse.json({
      ok: false,
      error: "Faltan variables VAPID en Vercel",
      env: {
        VAPID_EMAIL: !!email,
        VAPID_PUBLIC_KEY: !!publicKey,
        VAPID_PRIVATE_KEY: !!privateKey,
      }
    }, { status: 500 });
  }

  webpush.setVapidDetails(email, publicKey, privateKey);

  const { titulo, cuerpo } = await req.json();
  if (!cuerpo) {
    return NextResponse.json({ error: "Falta el mensaje" }, { status: 400 });
  }

  const kv = getClient();
  const usernames = await kv.smembers("push:all");

  let enviados = 0;
  let fallidos = 0;
  let eliminados = 0;
  const errores: any[] = [];

  for (const username of usernames) {
    const raw = await kv.get(`push:${username}`);
    if (!raw) continue;

    try {
      const sub = typeof raw === "string" ? JSON.parse(raw) : raw;

      await webpush.sendNotification(sub, JSON.stringify({
        title: titulo || "⚽ Penca Mundial 2026",
        body: cuerpo,
        url: "/penca"
      }));

      enviados++;
    } catch (err: any) {
      fallidos++;

      errores.push({
        username,
        statusCode: err?.statusCode ?? null,
        message: err?.message ?? "Error desconocido",
        body: err?.body ?? null
      });

      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await kv.del(`push:${username}`);
        await kv.srem("push:all", username);
        eliminados++;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    registrados: usernames.length,
    enviados,
    fallidos,
    eliminados,
    errores: errores.slice(0, 5)
  });
}
