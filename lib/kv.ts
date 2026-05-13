// lib/kv.ts
import Redis from "ioredis";
import type { Resultado, PuntosConfig } from "./mundial";
import { PUNTOS_DEFAULT } from "./mundial";

let _client: Redis | null = null;

export function getClient(): Redis {
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
export async function deleteUsuario(username: string): Promise<void> {
  const kv = getClient();
  // Borrar picks viejos
  const ids = await smembers(`pred:user:${username}`);
  await Promise.all(ids.map(id => kv.del(`pred:${username}:${id}`)));
  if (ids.length) await kv.del(`pred:user:${username}`);
  // Sacar de todos los grupos
  const misGrupos = await smembers(`usuario:grupos:${username}`);
  for (const gId of misGrupos) {
    await kv.srem(`grupo:usuarios:${gId}`, username);
    // Borrar picks del grupo
    const predIds = await smembers(`pred:grupo:${gId}:${username}`);
    for (const id of predIds) await kv.del(`pred:${gId}:${username}:${id}`);
    if (predIds.length) await kv.del(`pred:grupo:${gId}:${username}`);
  }
  await kv.del(`usuario:grupos:${username}`);
  await kv.del(`user:${username}`);
  await kv.srem("users:all", username);
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
  if (!cfg) return PUNTOS_DEFAULT;
  return { ...PUNTOS_DEFAULT, ...cfg };
}
export async function setPuntosConfig(cfg: PuntosConfig): Promise<void> {
  await set("config:puntos", cfg);
}

export interface Grupo {
  id: string;
  nombre: string;
  codigo: string;
  ownerUsername: string;
  creadoEn: string;
}

export const GRUPO_GLOBAL = "fascioli";

export async function getGrupo(grupoId: string): Promise<Grupo | null> {
  return get<Grupo>(`grupo:${grupoId}`);
}

export async function setGrupo(g: Grupo): Promise<void> {
  await set(`grupo:${g.id}`, g);
  await sadd("grupos:all", g.id);
}

export async function getGruposByCodigo(codigo: string): Promise<string | null> {
  return get<string>(`grupo:codigo:${codigo.toUpperCase()}`);
}

export async function setGrupoCodigoIndex(codigo: string, grupoId: string): Promise<void> {
  await set(`grupo:codigo:${codigo.toUpperCase()}`, grupoId);
}

export async function getGruposUsuario(username: string): Promise<string[]> {
  return smembers(`usuario:grupos:${username}`);
}

export async function agregarUsuarioAGrupo(username: string, grupoId: string): Promise<void> {
  await sadd(`usuario:grupos:${username}`, grupoId);
  await sadd(`grupo:usuarios:${grupoId}`, username);
}

export async function getMiembrosGrupo(grupoId: string): Promise<string[]> {
  return smembers(`grupo:usuarios:${grupoId}`);
}

export async function getPrediccionGrupo(grupoId: string, username: string, partidoId: string): Promise<Resultado | null> {
  return get<Resultado>(`pred:${grupoId}:${username}:${partidoId}`);
}

export async function setPrediccionGrupo(grupoId: string, username: string, partidoId: string, res: Resultado): Promise<void> {
  await set(`pred:${grupoId}:${username}:${partidoId}`, res);
  await sadd(`pred:grupo:${grupoId}:${username}`, partidoId);
}

export async function getAllPrediccionesGrupoUsuario(grupoId: string, username: string): Promise<Record<string, Resultado>> {
  const ids = await smembers(`pred:grupo:${grupoId}:${username}`);
  if (!ids?.length) return {};
  const result: Record<string, Resultado> = {};
  await Promise.all(ids.map(async (id) => {
    const p = await getPrediccionGrupo(grupoId, username, id);
    if (p) result[id] = p;
  }));
  return result;
}

export async function borrarGrupo(grupoId: string): Promise<void> {
  const kv = getClient();
  const miembros = await getMiembrosGrupo(grupoId);
  // Borrar picks de todos los miembros en este grupo
  for (const u of miembros) {
    const ids = await smembers(`pred:grupo:${grupoId}:${u}`);
    for (const id of ids) await kv.del(`pred:${grupoId}:${u}:${id}`);
    await kv.del(`pred:grupo:${grupoId}:${u}`);
    await kv.srem(`usuario:grupos:${u}`, grupoId);
  }
  await kv.del(`grupo:usuarios:${grupoId}`);
  // Borrar índice de código
  const grupo = await getGrupo(grupoId);
  if (grupo) await kv.del(`grupo:codigo:${grupo.codigo.toUpperCase()}`);
  await kv.del(`grupo:${grupoId}`);
  await kv.srem("grupos:all", grupoId);
}

export async function countPrediccionesGrupoUsuario(grupoId: string, username: string): Promise<number> {
  const ids = await smembers(`pred:grupo:${grupoId}:${username}`);
  return ids?.length ?? 0;
}
