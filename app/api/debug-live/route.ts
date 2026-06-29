import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  const key = process.env.LIVESCORE_KEY ?? "";
  const secret = process.env.LIVESCORE_SECRET ?? "";
  const res = await fetch(`https://livescore-api.com/api-client/matches/live.json?key=${key}&secret=${secret}&competition_id=362`, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data);
}
