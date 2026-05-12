import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getClient } from "@/lib/kv";
import webpush from "web-push";
import { TODOS_PARTIDOS } from "@/lib/mundial";

export const dynamic = "force-dynamic";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const kv = getClient();
  const usernames = await kv.smembers("push:all");

  const ahora = Date.now();
  const en2horas = ahora + 2 * 60 * 60 * 1000;

  const proximosPartidos = TODOS_PARTIDOS.filter(p => {
    const [h, m] = p.hora.split(":").map(Number);
    const ms = new Date(`${p.fecha}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`).getTime() + 3*60*60*1000;
    return ms > ahora && ms <= en2horas;
  });

  if (proximosPartidos.length === 0)
    return NextResponse.json({ ok: true, enviados: 0, motivo: "No hay partidos en las próximas 2 horas" });

  const nombres = proximosPartidos.map(p => `${p.local} vs ${p.visitante}`).join(", ");
  let enviados = 0;

  for (const username of usernames) {
    const raw = await kv.get(`push:${username}`);
    if (!raw) continue;
    try {
      const sub = JSON.parse(raw);
      await webpush.sendNotification(sub, JSON.stringify({
        title: "⚽ Penca Mundial 2026",
        body: `¡Faltan menos de 2hs! ${nombres}`,
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
