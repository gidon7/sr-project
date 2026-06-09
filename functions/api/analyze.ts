/**
 * Pages Function — POST /api/analyze
 * 생기부 텍스트를 받아 개인정보 마스킹 후 Anthropic으로 분석한다.
 */
import { maskPii } from "../_lib/pii";
import { runAnalysis, type AnalyzeInput } from "../_lib/analysis";
import type { Env } from "../_lib/types";

const MAX_RECORD_CHARS = 30000;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "서버에 ANTHROPIC_API_KEY가 설정되지 않았습니다." }, 500);
  }

  let body: Partial<AnalyzeInput> & { recordText?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "유효한 JSON 본문이 필요합니다." }, 400);
  }

  const raw = (body.recordText ?? "").trim();
  if (raw.length < 30) {
    return json({ error: "분석할 생기부 내용이 너무 짧습니다." }, 400);
  }
  if (raw.length > MAX_RECORD_CHARS) {
    return json(
      { error: `생기부 내용이 너무 깁니다. ${MAX_RECORD_CHARS}자 이내로 입력해 주세요.` },
      400,
    );
  }

  const recordText = maskPii(raw);

  try {
    const result = await runAnalysis(env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL, {
      recordText,
      targetMajor: body.targetMajor,
      grade: body.grade,
    });
    return json({ result });
  } catch (err) {
    const messageText = err instanceof Error ? err.message : String(err);
    console.error("analyze failed:", messageText); // 키/원문은 로그에 남기지 않는다.
    return json({ error: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }, 502);
  }
};
