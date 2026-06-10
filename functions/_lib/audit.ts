import type { Env } from "./types";

/** 감사 로그 기록. 실패해도 본 동작을 막지 않는다. */
export async function logAudit(
  env: Env,
  userId: number,
  action: string,
  target?: string,
  detail?: string,
): Promise<void> {
  try {
    await env.DB.prepare(
      "INSERT INTO audit_log (user_id, action, target, detail) VALUES (?, ?, ?, ?)",
    )
      .bind(userId, action, target ?? null, detail ?? null)
      .run();
  } catch {
    /* noop */
  }
}
