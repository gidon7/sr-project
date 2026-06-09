import type { Env } from "../../_lib/types";
import { json, badRequest, unauthorized, notFound } from "../../_lib/http";
import { getUser } from "../../_lib/auth";
import { getOwnedRecord, paramId } from "../../_lib/data";

// GET /api/records/:id — 생기부 + 학생 + 최신 분석
export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();
  const id = paramId(params.id);
  const record = await getOwnedRecord(env, user.id, id);
  if (!record) return notFound("생기부를 찾을 수 없습니다.");

  const student = await env.DB.prepare(
    "SELECT id, name, grade, target_major FROM students WHERE id = ?",
  )
    .bind(record.student_id)
    .first();

  const latest = await env.DB.prepare(
    "SELECT result_json, model, created_at FROM analyses WHERE record_id = ? ORDER BY id DESC LIMIT 1",
  )
    .bind(id)
    .first<{ result_json: string; model: string | null; created_at: string }>();

  let analysis = null;
  if (latest) {
    try {
      analysis = { result: JSON.parse(latest.result_json), model: latest.model, created_at: latest.created_at };
    } catch {
      analysis = null;
    }
  }

  return json({ record, student, analysis });
};

// PUT /api/records/:id — 제목/내용 수정
export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();
  const id = paramId(params.id);
  const record = await getOwnedRecord(env, user.id, id);
  if (!record) return notFound("생기부를 찾을 수 없습니다.");

  let body: { title?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest("유효한 JSON 본문이 필요합니다.");
  }
  const title = (body.title ?? record.title).trim() || "제목 없는 생기부";
  const content = body.content ?? record.content;

  await env.DB.prepare(
    "UPDATE records SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?",
  )
    .bind(title, content, id)
    .run();

  return json({ record: { ...record, title, content } });
};

// DELETE /api/records/:id
export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();
  const id = paramId(params.id);
  const record = await getOwnedRecord(env, user.id, id);
  if (!record) return notFound("생기부를 찾을 수 없습니다.");

  await env.DB.prepare("DELETE FROM analyses WHERE record_id = ?").bind(id).run();
  await env.DB.prepare("DELETE FROM records WHERE id = ?").bind(id).run();
  return json({ ok: true });
};
