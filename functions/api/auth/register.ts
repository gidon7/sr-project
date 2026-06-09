import type { Env } from "../../_lib/types";
import { json, badRequest, serverError } from "../../_lib/http";
import { hashPassword, createSession, sessionCookie } from "../../_lib/auth";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest("유효한 JSON 본문이 필요합니다.");
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return badRequest("이메일 형식이 올바르지 않습니다.");
  if (password.length < 8) return badRequest("비밀번호는 8자 이상이어야 합니다.");

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) return badRequest("이미 가입된 이메일입니다.");

  try {
    const { hash, salt } = await hashPassword(password);
    const res = await env.DB.prepare(
      "INSERT INTO users (email, password_hash, salt) VALUES (?, ?, ?)",
    )
      .bind(email, hash, salt)
      .run();
    const userId = Number(res.meta.last_row_id);
    const token = await createSession(env, userId);
    return json({ user: { id: userId, email } }, 200, { "Set-Cookie": sessionCookie(token) });
  } catch (e) {
    console.error("register failed:", e instanceof Error ? e.message : String(e));
    return serverError("가입 처리 중 오류가 발생했습니다.");
  }
};
