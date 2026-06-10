import type { Env } from "../../../_lib/types";
import { json, badRequest, unauthorized, notFound } from "../../../_lib/http";
import { getUser } from "../../../_lib/auth";
import { getOwnedStudent, paramId } from "../../../_lib/data";
import { logAudit } from "../../../_lib/audit";

// GET /api/students/:id/records — 학생의 생기부 목록
export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();
  const studentId = paramId(params.id);
  const student = await getOwnedStudent(env, user.id, studentId);
  if (!student) return notFound("학생을 찾을 수 없습니다.");

  const { results } = await env.DB.prepare(
    `SELECT r.id, r.title, r.updated_at,
            (SELECT COUNT(*) FROM analyses a WHERE a.record_id = r.id) AS analysis_count
       FROM records r
      WHERE r.student_id = ?
      ORDER BY r.updated_at DESC`,
  )
    .bind(studentId)
    .all();

  return json({ student, records: results });
};

// POST /api/students/:id/records — 생기부 생성
export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();
  const studentId = paramId(params.id);
  const student = await getOwnedStudent(env, user.id, studentId);
  if (!student) return notFound("학생을 찾을 수 없습니다.");

  let body: { title?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest("유효한 JSON 본문이 필요합니다.");
  }
  const title = (body.title ?? "").trim() || "제목 없는 생기부";

  const res = await env.DB.prepare(
    "INSERT INTO records (student_id, title, content) VALUES (?, ?, ?)",
  )
    .bind(studentId, title, body.content ?? "")
    .run();

  await logAudit(env, user.id, "create", "records", title);
  return json({ record: { id: Number(res.meta.last_row_id), title, content: body.content ?? "" } });
};
