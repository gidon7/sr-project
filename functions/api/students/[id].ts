import type { Env } from "../../_lib/types";
import { json, badRequest, unauthorized, notFound } from "../../_lib/http";
import { getUser } from "../../_lib/auth";
import { getOwnedStudent, paramId } from "../../_lib/data";

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();
  const student = await getOwnedStudent(env, user.id, paramId(params.id));
  if (!student) return notFound("학생을 찾을 수 없습니다.");
  return json({ student });
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();
  const id = paramId(params.id);
  const student = await getOwnedStudent(env, user.id, id);
  if (!student) return notFound("학생을 찾을 수 없습니다.");

  let body: { name?: string; grade?: string; targetMajor?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest("유효한 JSON 본문이 필요합니다.");
  }
  const name = (body.name ?? student.name).trim();
  if (!name) return badRequest("학생 이름을 입력하세요.");

  await env.DB.prepare("UPDATE students SET name = ?, grade = ?, target_major = ? WHERE id = ?")
    .bind(name, body.grade?.trim() || null, body.targetMajor?.trim() || null, id)
    .run();

  return json({
    student: { ...student, name, grade: body.grade?.trim() || null, target_major: body.targetMajor?.trim() || null },
  });
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();
  const id = paramId(params.id);
  const student = await getOwnedStudent(env, user.id, id);
  if (!student) return notFound("학생을 찾을 수 없습니다.");

  // 수동 카스케이드: analyses → records → student
  await env.DB.prepare(
    "DELETE FROM analyses WHERE record_id IN (SELECT id FROM records WHERE student_id = ?)",
  )
    .bind(id)
    .run();
  await env.DB.prepare("DELETE FROM records WHERE student_id = ?").bind(id).run();
  await env.DB.prepare("DELETE FROM students WHERE id = ?").bind(id).run();

  return json({ ok: true });
};
