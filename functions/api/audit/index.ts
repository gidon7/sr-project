import type { Env } from "../../_lib/types";
import { json, unauthorized } from "../../_lib/http";
import { getUser } from "../../_lib/auth";

// GET /api/audit — 최근 감사 로그 (본인 계정)
export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();
  const { results } = await env.DB.prepare(
    "SELECT id, action, target, detail, created_at FROM audit_log WHERE user_id = ? ORDER BY id DESC LIMIT 100",
  )
    .bind(user.id)
    .all();
  return json({ items: results });
};
