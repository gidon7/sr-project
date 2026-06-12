import type { Env } from "./types";

// 다중 provider 추상화. OpenAI 키가 있으면 OpenAI, 없으면 Anthropic 사용.
// 둘 다 없으면 호출부에서 차단(hasLLM).

const OPENAI_DEFAULT = "gpt-4o-mini";
const ANTHROPIC_DEFAULT = "claude-sonnet-4-6";

export type Provider = "openai" | "anthropic" | null;

export function pickProvider(env: Env): Provider {
  if (env.OPENAI_API_KEY) return "openai";
  if (env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}
export function hasLLM(env: Env): boolean {
  return pickProvider(env) !== null;
}

interface JsonOpts {
  system: string;
  user: string;
  schema: unknown;
  schemaName: string;
  maxTokens?: number;
}
interface TextOpts {
  system: string;
  user: string;
  maxTokens?: number;
}

/** 구조화(JSON) 출력 */
export async function chatJson(env: Env, o: JsonOpts): Promise<unknown> {
  const p = pickProvider(env);
  if (p === "openai") return openaiJson(env, o);
  if (p === "anthropic") return anthropicJson(env, o);
  throw new Error("AI 키가 설정되지 않았습니다.");
}

/** 자유 텍스트 출력 */
export async function chatText(env: Env, o: TextOpts): Promise<string> {
  const p = pickProvider(env);
  if (p === "openai") return openaiText(env, o);
  if (p === "anthropic") return anthropicText(env, o);
  throw new Error("AI 키가 설정되지 않았습니다.");
}

// ===== OpenAI (Chat Completions) =====
interface OpenAIResp {
  error?: { message?: string };
  choices?: { message?: { content?: string } }[];
}
async function openaiChat(env: Env, body: unknown): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as OpenAIResp;
  if (!res.ok) throw new Error(data.error?.message || `OpenAI ${res.status}`);
  return data.choices?.[0]?.message?.content ?? "";
}
async function openaiJson(env: Env, o: JsonOpts): Promise<unknown> {
  const content = await openaiChat(env, {
    model: env.OPENAI_MODEL?.trim() || OPENAI_DEFAULT,
    messages: [
      { role: "system", content: o.system },
      { role: "user", content: o.user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: o.schemaName, strict: true, schema: o.schema },
    },
    temperature: 0.3,
    max_tokens: o.maxTokens ?? 4000,
  });
  return JSON.parse(content);
}
async function openaiText(env: Env, o: TextOpts): Promise<string> {
  return openaiChat(env, {
    model: env.OPENAI_MODEL?.trim() || OPENAI_DEFAULT,
    messages: [
      { role: "system", content: o.system },
      { role: "user", content: o.user },
    ],
    temperature: 0.3,
    max_tokens: o.maxTokens ?? 4000,
  });
}

// ===== Anthropic (Messages) =====
interface AnthropicBlock {
  type: string;
  text?: string;
  input?: unknown;
}
interface AnthropicResp {
  error?: { message?: string };
  content?: AnthropicBlock[];
}
async function anthropicCall(env: Env, body: unknown): Promise<AnthropicResp> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as AnthropicResp;
  if (!res.ok) throw new Error(data.error?.message || `Anthropic ${res.status}`);
  return data;
}
async function anthropicJson(env: Env, o: JsonOpts): Promise<unknown> {
  const data = await anthropicCall(env, {
    model: env.ANTHROPIC_MODEL?.trim() || ANTHROPIC_DEFAULT,
    max_tokens: o.maxTokens ?? 4000,
    system: o.system,
    tools: [{ name: o.schemaName, description: "결과를 제출한다.", input_schema: o.schema }],
    tool_choice: { type: "tool", name: o.schemaName },
    messages: [{ role: "user", content: o.user }],
  });
  const tool = (data.content ?? []).find((b) => b.type === "tool_use");
  if (!tool) throw new Error("모델이 결과를 제출하지 않았습니다.");
  return tool.input;
}
async function anthropicText(env: Env, o: TextOpts): Promise<string> {
  const data = await anthropicCall(env, {
    model: env.ANTHROPIC_MODEL?.trim() || ANTHROPIC_DEFAULT,
    max_tokens: o.maxTokens ?? 4000,
    system: o.system,
    messages: [{ role: "user", content: o.user }],
  });
  return (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("\n")
    .trim();
}
