// lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev_secret_change_in_production"
);

export interface SessionPayload {
  username: string;
  isAdmin: boolean;
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("penca_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function isAdminCredentials(username: string, password: string): boolean {
  return (
    username === (process.env.ADMIN_USERNAME ?? "admin") &&
    password === (process.env.ADMIN_PASSWORD ?? "admin123")
  );
}
