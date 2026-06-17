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
  const usernames = await kv.smembers("push:all");
  if (!usernames?.length) return;

  const payload = JSON.stringify({ title: titulo, body: cuerpo, url });

  await Promise.allSettled(
    usernames.map(async (username) => {
      try {
        const raw = await kv.get(`push:${username}`);
        if (!raw) return;
        const sub = typeof raw === "string" ? JSON.parse(raw) : raw;
        await webpush.sendNotification(sub, payload);
      } catch (e: any) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          await kv.del(`push:${username}`);
          await kv.srem("push:all", username);
        }
      }
    })
  );
}
