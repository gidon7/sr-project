import type { Env } from "../../../_lib/types";
import { json, unauthorized, notFound } from "../../../_lib/http";
import { getUser } from "../../../_lib/auth";
import { getOwnedRecord, paramId } from "../../../_lib/data";

// GET /api/records/:id/analyses — 분석 점수 이력(추이)
export const onRequestGet: PagesFunction<Env> = async ({ env, request, params }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();
  const id = paramId(params.id);
  const rec = await getOwnedRecord(env, user.id, id);
  if (!rec) return notFound("생기부를 찾을 수 없습니다.");

  const { results } = await env.DB.prepare(
    "SELECT id, result_json, created_at FROM analyses WHERE record_id = ? ORDER BY id ASC",
  )
    .bind(id)
    .all();

  const items = (results as { id: number; result_json: string; created_at: string }[]).map((r) => {
    let score: number | null = null;
    try {
      const parsed = JSON.parse(r.result_json) as { overallScore?: number };
      score = typeof parsed.overallScore === "number" ? parsed.overallScore : null;
    } catch {
      /* noop */
    }
    return { id: r.id, score, created_at: r.created_at };
  });

  return json({ items });
};
