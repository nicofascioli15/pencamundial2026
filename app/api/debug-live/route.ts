import { NextResponse } from "next/server";
import { getClient } from "@/lib/kv";
export const dynamic = "force-dynamic";

export async function GET() {
  const kv = getClient();
  const brasilKey = await kv.get("bracket:reverse:Brasil");
  const japonKey = await kv.get("bracket:reverse:Japón");
  const r32_02 = await kv.get("bracket:R32_02");
  return NextResponse.json({
    "bracket:reverse:Brasil": brasilKey,
    "bracket:reverse:Japón": japonKey,
    "bracket:R32_02": r32_02,
  });
}
