import type { Env } from "../../_lib/types";
import { json, badRequest, unauthorized } from "../../_lib/http";
import { getUser } from "../../_lib/auth";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();

  const { results } = await env.DB.prepare(
    `SELECT s.id, s.name, s.grade, s.target_major, s.created_at,
            (SELECT COUNT(*) FROM records r WHERE r.student_id = s.id) AS record_count
       FROM students s
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC`,
  )
    .bind(user.id)
    .all();

  return json({ students: results });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();

  let body: { name?: string; grade?: string; targetMajor?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest("유효한 JSON 본문이 필요합니다.");
  }

  const name = (body.name ?? "").trim();
  if (!name) return badRequest("학생 이름을 입력하세요.");

  const res = await env.DB.prepare(
    "INSERT INTO students (user_id, name, grade, target_major) VALUES (?, ?, ?, ?)",
  )
    .bind(user.id, name, body.grade?.trim() || null, body.targetMajor?.trim() || null)
    .run();

  const id = Number(res.meta.last_row_id);
  return json({
    student: {
      id,
      name,
      grade: body.grade?.trim() || null,
      target_major: body.targetMajor?.trim() || null,
      record_count: 0,
    },
  });
};
