import type { Env } from "./types";

const COOKIE = "sess";
const SESSION_DAYS = 30;
const PBKDF2_ITERS = 100000;

export interface User {
  id: number;
  email: string;
  created_at: string;
}

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function fromHex(hex: string): Uint8Array {
  const a = new Uint8Array(hex.length / 2);
  for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.substr(i * 2, 2), 16);
  return a;
}

async function sha256Hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return toHex(d);
}

export async function hashPassword(
  password: string,
  saltHex?: string,
): Promise<{ hash: string; salt: string }> {
  const salt = saltHex ? fromHex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERS, hash: "SHA-256" },
    key,
    256,
  );
  return { hash: toHex(bits), salt: toHex(salt as unknown as ArrayBuffer) };
}

export async function verifyPassword(
  password: string,
  saltHex: string,
  hashHex: string,
): Promise<boolean> {
  const { hash } = await hashPassword(password, saltHex);
  if (hash.length !== hashHex.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= hash.charCodeAt(i) ^ hashHex.charCodeAt(i);
  return diff === 0;
}

export async function createSession(env: Env, userId: number): Promise<string> {
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)).buffer);
  const tokenHash = await sha256Hex(token);
  const expires = Date.now() + SESSION_DAYS * 86400 * 1000;
  await env.DB.prepare(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
  )
    .bind(tokenHash, userId, expires)
    .run();
  return token;
}

export function sessionCookie(token: string): string {
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 86400}`;
}
export function clearCookie(): string {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function readCookie(request: Request, name: string): string | null {
  const c = request.headers.get("Cookie");
  if (!c) return null;
  for (const part of c.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return null;
}

export async function getUser(env: Env, request: Request): Promise<User | null> {
  const token = readCookie(request, COOKIE);
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(
    `SELECT u.id AS id, u.email AS email, u.created_at AS created_at, s.expires_at AS expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?`,
  )
    .bind(tokenHash)
    .first<{ id: number; email: string; created_at: string; expires_at: number }>();
  if (!row) return null;
  if (Number(row.expires_at) < Date.now()) {
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
    return null;
  }
  return { id: row.id, email: row.email, created_at: row.created_at };
}

export async function deleteSession(env: Env, request: Request): Promise<void> {
  const token = readCookie(request, COOKIE);
  if (!token) return;
  const tokenHash = await sha256Hex(token);
  await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
}
