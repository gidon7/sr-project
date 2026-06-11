import type { Env } from "../../../_lib/types";
import { json, badRequest, unauthorized, notFound } from "../../../_lib/http";
import { getUser } from "../../../_lib/auth";
import { getOwnedRecord, paramId } from "../../../_lib/data";
import { maskPii } from "../../../_lib/pii";
import { runAnalysis } from "../../../_lib/analysis";
import { logAudit } from "../../../_lib/audit";
import { hasLLM } from "../../../_lib/llm";

const MAX_RECORD_CHARS = 30000;

// POST /api/records/:id/analyze — 생기부 분석 실행 + 결과 저장
export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();
  if (!hasLLM(env)) {
    return json(
      { error: "AI 키(OPENAI_API_KEY 또는 ANTHROPIC_API_KEY)가 설정되지 않았습니다.", needKey: true },
      503,
    );
  }

  const id = paramId(params.id);
  const record = await getOwnedRecord(env, user.id, id);
  if (!record) return notFound("생기부를 찾을 수 없습니다.");

  const raw = (record.content ?? "").trim();
  if (raw.length < 30) return badRequest("분석할 생기부 내용이 너무 짧습니다.");
  if (raw.length > MAX_RECORD_CHARS) {
    return badRequest(`생기부 내용이 너무 깁니다. ${MAX_RECORD_CHARS}자 이내로 입력해 주세요.`);
  }

  const student = await env.DB.prepare(
    "SELECT name, grade, target_major FROM students WHERE id = ?",
  )
    .bind(record.student_id)
    .first<{ name: string; grade: string | null; target_major: string | null }>();

  const modelLabel = env.OPENAI_API_KEY
    ? env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
    : env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6";

  try {
    const result = await runAnalysis(env, {
      recordText: maskPii(raw),
      targetMajor: student?.target_major ?? undefined,
      grade: student?.grade ?? undefined,
    });

    await env.DB.prepare(
      "INSERT INTO analyses (record_id, model, result_json) VALUES (?, ?, ?)",
    )
      .bind(id, modelLabel, JSON.stringify(result))
      .run();

    await logAudit(env, user.id, "analyze", "records", record.title);
    return json({ result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("analyze failed:", msg);
    return json({ error: "분석 실패: " + msg }, 502);
  }
};
