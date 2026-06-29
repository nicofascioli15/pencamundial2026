import { NextResponse } from "next/server";
import { setPuntosConfig } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  await setPuntosConfig({
    resultado_exacto: 7,
    ganador_diferencia: 5,
    ganador_correcto: 3,
    empate_correcto: 3,
  });
  return NextResponse.json({ ok: true, msg: "Config actualizado: empate_correcto = 3" });
}
