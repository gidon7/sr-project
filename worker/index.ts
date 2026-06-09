/**
 * Cloudflare Worker — sr-project 생기부 분석 백엔드.
 *
 * 정적 자산(React SPA)은 자동으로 서빙되고, 이 핸들러는 /api/* 만 처리한다.
 * 핵심 엔드포인트: POST /api/analyze — 생기부 텍스트를 받아 Anthropic으로 분석.
 */
import { maskPii } from "./pii";
import { runAnalysis, type AnalyzeInput } from "./analysis";

export interface Env {
  /** Anthropic API 키. 로컬: .dev.vars / 운영: `wrangler secret put ANTHROPIC_API_KEY` */
  ANTHROPIC_API_KEY: string;
  /** 선택: 기본 claude-opus-4-8. 비용 절감 시 claude-sonnet-4-6 */
  ANTHROPIC_MODEL?: string;
}

const MAX_RECORD_CHARS = 30000;

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(url, request, env);
    }
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

async function handleApi(url: URL, request: Request, env: Env): Promise<Response> {
  if (url.pathname === "/api/health") {
    return json({ status: "ok" });
  }

  if (url.pathname === "/api/analyze") {
    if (request.method !== "POST") {
      return json({ error: "POST만 허용됩니다." }, 405);
    }
    return handleAnalyze(request, env);
  }

  return json({ error: "Unknown API route" }, 404);
}

async function handleAnalyze(request: Request, env: Env): Promise<Response> {
  if (!env.ANTHROPIC_API_KEY) {
    return json(
      { error: "서버에 ANTHROPIC_API_KEY가 설정되지 않았습니다." },
      500,
    );
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
    // 키/원문은 로그에 남기지 않는다.
    console.error("analyze failed:", messageText);
    return json({ error: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }, 502);
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
