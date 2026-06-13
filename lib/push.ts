import webpush from "web-push";
import { getClient } from "./kv";

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_EMAIL = process.env.VAPID_EMAIL ?? "";

if (VAPID_PUBLIC && VAPID_PRIVATE && VAPID_EMAIL) {
  webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC, VAPID_PRIVATE);
}

export async function enviarPushATodos(titulo: string, cuerpo: string, url = "/penca") {
  const kv = getClient();
  const subs = await kv.smembers("push:subs");
  if (!subs?.length) return;

  const payload = JSON.stringify({ title: titulo, body: cuerpo, url });

  await Promise.allSettled(
    subs.map(async (raw) => {
      try {
        const sub = JSON.parse(raw);
        await webpush.sendNotification(sub, payload);
      } catch (e: any) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          await kv.srem("push:subs", raw);
        }
      }
    })
  );
}
