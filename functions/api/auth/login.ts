import type { Env } from "../../_lib/types";
import { json, badRequest, unauthorized, serverError } from "../../_lib/http";
import { verifyPassword, createSession, sessionCookie } from "../../_lib/auth";
import { logAudit } from "../../_lib/audit";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest("유효한 JSON 본문이 필요합니다.");
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) return badRequest("이메일과 비밀번호를 입력하세요.");

  try {
    const row = await env.DB.prepare(
      "SELECT id, email, password_hash, salt FROM users WHERE email = ?",
    )
      .bind(email)
      .first<{ id: number; email: string; password_hash: string; salt: string }>();

    if (!row || !(await verifyPassword(password, row.salt, row.password_hash))) {
      return unauthorized("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    const token = await createSession(env, row.id);
    await logAudit(env, row.id, "login", "auth");
    return json({ user: { id: row.id, email: row.email } }, 200, {
      "Set-Cookie": sessionCookie(token),
    });
  } catch (e) {
    console.error("login failed:", e instanceof Error ? e.message : String(e));
    return serverError("로그인 처리 중 오류가 발생했습니다.");
  }
};
