import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getClient } from "@/lib/kv";
import webpush from "web-push";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  const { titulo, cuerpo } = await req.json();
  if (!cuerpo) return NextResponse.json({ error: "Falta el mensaje" }, { status: 400 });

  const kv = getClient();
  const usernames = await kv.smembers("push:all");
  let enviados = 0;

  for (const username of usernames) {
    const raw = await kv.get(`push:${username}`);
    if (!raw) continue;
    try {
      const sub = JSON.parse(raw);
      await webpush.sendNotification(sub, JSON.stringify({
        title: titulo || "⚽ Penca Mundial 2026",
        body: cuerpo,
        url: "/penca"
      }));
      enviados++;
    } catch {
      await kv.del(`push:${username}`);
      await kv.srem("push:all", username);
    }
  }

  return NextResponse.json({ ok: true, enviados });
}
