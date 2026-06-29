import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  const key = process.env.LIVESCORE_KEY ?? "";
  const secret = process.env.LIVESCORE_SECRET ?? "";
  return NextResponse.json({
    hasKey: !!key,
    hasSecret: !!secret,
    keyLength: key.length,
    secretLength: secret.length,
  });
}
