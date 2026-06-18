import { NextResponse } from "next/server";
import { getClient } from "@/lib/kv";
export const dynamic = "force-dynamic";
export async function GET() {
  const kv = getClient();
  const result = await kv.get("push:last_result");
  const error = await kv.get("push:last_error");
  return NextResponse.json({ result: result ? JSON.parse(result) : null, error });
}
