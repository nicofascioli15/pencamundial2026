import { NextRequest, NextResponse } from "next/server";
import { getUsuario } from "@/lib/kv";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) return NextResponse.json({ existe: false });
  const user = await getUsuario(username.toLowerCase().trim());
  return NextResponse.json({ existe: !!user });
}
