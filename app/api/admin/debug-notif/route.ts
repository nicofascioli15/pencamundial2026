import { NextResponse } from "next/server";
import { getClient } from "@/lib/kv";
import { TODOS_PARTIDOS } from "@/lib/mundial";

export const dynamic = "force-dynamic";

export async function GET() {
  const kv = getClient();
  const ahora = Date.now();
  const subs = await kv.smembers("push:subs");
  
  const proximos = [];
  for (const p of TODOS_PARTIDOS) {
    const [h, m] = p.hora.split(":").map(Number);
    const [y, mo, d] = p.fecha.split("-").map(Number);
    const kickoffUTC = Date.UTC(y, mo-1, d, h+3, m, 0);
    const diff = kickoffUTC - ahora;
    const yaNotificado = await kv.get(`push:prepartido:${p.id}`);
    const diffMin = Math.round(diff / 60000);
    
    if (diff > -60*60*1000 && diff < 2*60*60*1000) {
      proximos.push({
        id: p.id,
        partido: `${p.local} vs ${p.visitante}`,
        fecha: p.fecha,
        hora: p.hora,
        diffMin,
        enVentana: diff > 0 && diff <= 30*60*1000,
        yaNotificado: !!yaNotificado,
      });
    }
  }

  return NextResponse.json({
    ahora: new Date(ahora).toISOString(),
    suscripciones: subs.length,
    proximos,
  });
}
