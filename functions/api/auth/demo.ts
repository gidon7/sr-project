import type { Env } from "../../_lib/types";
import { json, serverError } from "../../_lib/http";
import { hashPassword, createSession, sessionCookie } from "../../_lib/auth";

// POST /api/auth/demo — 테스트용 원클릭 관리자 로그인.
// 고정 데모 계정으로 로그인(없으면 생성). 테스트 사이트 전용.
const DEMO_EMAIL = "admin@demo.local";

export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  try {
    let user = await env.DB.prepare("SELECT id, email FROM users WHERE email = ?")
      .bind(DEMO_EMAIL)
      .first<{ id: number; email: string }>();

    if (!user) {
      const { hash, salt } = await hashPassword(crypto.randomUUID());
      const res = await env.DB.prepare(
        "INSERT INTO users (email, password_hash, salt) VALUES (?, ?, ?)",
      )
        .bind(DEMO_EMAIL, hash, salt)
        .run();
      user = { id: Number(res.meta.last_row_id), email: DEMO_EMAIL };
    }

    const token = await createSession(env, user.id);
    return json({ user }, 200, { "Set-Cookie": sessionCookie(token) });
  } catch (e) {
    console.error("demo login failed:", e instanceof Error ? e.message : String(e));
    return serverError("데모 로그인 처리 중 오류가 발생했습니다.");
  }
};
