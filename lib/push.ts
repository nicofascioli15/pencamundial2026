import webpush from "web-push";
import { getClient } from "./kv";

export async function enviarPushATodos(titulo: string, cuerpo: string, url = "/penca") {
  const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY ?? "";
  const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
  const VAPID_EMAIL = process.env.VAPID_EMAIL ?? "";

  if (!VAPID_PUBLIC || !VAPID_PRIVATE || !VAPID_EMAIL) {
    await getClient().set("push:last_error", "VAPID no configurado");
    return;
  }

  webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC, VAPID_PRIVATE);

  const kv = getClient();
  const usernames = await kv.smembers("push:all");

  if (!usernames?.length) {
    await kv.set("push:last_error", "Sin suscriptores");
    return;
  }

  let enviados = 0;
  const errores: string[] = [];

  await Promise.allSettled(
    usernames.map(async (username) => {
      try {
        const raw = await kv.get(`push:${username}`);
        if (!raw) return;
        const sub = typeof raw === "string" ? JSON.parse(raw) : raw;
        await webpush.sendNotification(sub, JSON.stringify({ title: titulo, body: cuerpo, url }));
        enviados++;
      } catch (e: any) {
        errores.push(`${username}:${e.statusCode}:${e.message}`);
        if (e.statusCode === 410 || e.statusCode === 404 || e.statusCode === 403) {
          await kv.del(`push:${username}`);
          await kv.srem("push:all", username);
        }
      }
    })
  );

  await kv.set("push:last_result", JSON.stringify({
    ts: new Date().toISOString(),
    titulo,
    enviados,
    total: usernames.length,
    errores,
  }));
}
