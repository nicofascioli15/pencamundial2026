// lib/kv.ts
import Redis from "ioredis";
import type { Resultado, PuntosConfig } from "./mundial";
import { PUNTOS_DEFAULT } from "./mundial";

let _client: Redis | null = null;

function getClient(): Redis {
  if (!_client) {
    const url = process.env.REDIS_URL ?? process.env.KV_URL;
    if (!url) throw new Error("Falta variable REDIS_URL o KV_URL");
    _client = new Redis(url, { tls: url.startsWith("rediss://") ? {} : undefined, maxRetriesPerRequest: 3 });
  }
  return _client;
}

async function get<T>(key: string): Promise<T | null> {
  const val = await getClient().get(key);
  if (!val) return null;
  return JSON.parse(val) as T;
}
async function set(key: string, val: unknown): Promise<void> {
  await getClient().set(key, JSON.stringify(val));
}
async function sadd(key: string, ...members: string[]): Promise<void> {
  await getClient().sadd(key, ...members);
}
async function smembers(key: string): Promise<string[]> {
  return getClient().smembers(key);
}

export interface Usuario {
  username: string;
  passwordHash: string;
  nombre: string;
  creadoEn: string;
}

export async function getUsuario(username: string): Promise<Usuario | null> {
  return get<Usuario>(`user:${username}`);
}
export async function setUsuario(u: Usuario): Promise<void> {
  await set(`user:${u.username}`, u);
  await sadd("users:all", u.username);
}
export async function getAllUsernames(): Promise<string[]> {
  return smembers("users:all");
}

export async function getPrediccion(username: string, partidoId: string): Promise<Resultado | null> {
  return get<Resultado>(`pred:${username}:${partidoId}`);
}
export async function setPrediccion(username: string, partidoId: string, res: Resultado): Promise<void> {
  await set(`pred:${username}:${partidoId}`, res);
  await sadd(`pred:user:${username}`, partidoId);
}
export async function getAllPrediccionesUsuario(username: string): Promise<Record<string, Resultado>> {
  const ids = await smembers(`pred:user:${username}`);
  if (!ids?.length) return {};
  const result: Record<string, Resultado> = {};
  await Promise.all(ids.map(async (id) => {
    const p = await getPrediccion(username, id);
    if (p) result[id] = p;
  }));
  return result;
}
export async function countPrediccionesUsuario(username: string): Promise<number> {
  const ids = await smembers(`pred:user:${username}`);
  return ids?.length ?? 0;
}

export async function getResultado(partidoId: string): Promise<Resultado | null> {
  return get<Resultado>(`result:${partidoId}`);
}
export async function setResultado(partidoId: string, res: Resultado): Promise<void> {
  await set(`result:${partidoId}`, res);
  await sadd("results:all", partidoId);
}
export async function getAllResultados(): Promise<Record<string, Resultado>> {
  const ids = await smembers("results:all");
  if (!ids?.length) return {};
  const result: Record<string, Resultado> = {};
  await Promise.all(ids.map(async (id) => {
    const r = await getResultado(id);
    if (r) result[id] = r;
  }));
  return result;
}

export async function getPuntosConfig(): Promise<PuntosConfig> {
  const cfg = await get<PuntosConfig>("config:puntos");
  return cfg ?? PUNTOS_DEFAULT;
}
export async function setPuntosConfig(cfg: PuntosConfig): Promise<void> {
  await set("config:puntos", cfg);
}
