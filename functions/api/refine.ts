import type { Env } from "../_lib/types";
import { getUser } from "../_lib/auth";
import { json, unauthorized, badRequest } from "../_lib/http";
import { hasLLM, chatText } from "../_lib/llm";
import { logAudit } from "../_lib/audit";
import { maskPii } from "../_lib/pii";

const SYSTEM = `당신은 대한민국 학교생활기록부(생기부) 서술형 항목을 다듬는 윤문 전문가입니다.
교사가 작성한 초안을 NEIS 기재 방식에 맞게 다듬으세요.
- 초안에 적힌 사실과 구체적 소재(과목명·실험명·활동명·주제)를 반드시 유지하고, 없는 내용을 추가하거나 일반적인 표현으로 바꾸지 않는다.
- 명사형 어미(~함, ~임, ~을 보임)로 끝맺고, 군더더기를 줄여 구체적이고 자연스럽게 다듬는다.
- 어학시험명·특정 대학명·교외 수상·사교육(학원·과외)·부모 배경 등 기재 금지 표현은 넣지 않는다.
- 초안이 짧아도 거절하거나 설명하지 말고, 다듬은 결과 본문만 출력한다(머리말·따옴표 없이).`;

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();
  if (!hasLLM(env)) {
    return json(
      { error: "AI 키(OPENAI_API_KEY 또는 ANTHROPIC_API_KEY)가 설정되지 않았습니다.", needKey: true },
      503,
    );
  }

  let body: { text?: string; maxBytes?: number };
  try {
    body = await request.json();
  } catch {
    return badRequest("유효한 JSON 본문이 필요합니다.");
  }
  const text = (body.text ?? "").trim();
  if (text.length < 10) return badRequest("다듬을 초안을 입력하세요.");
  if (text.length > 5000) return badRequest("초안이 너무 깁니다. 5000자 이내로 입력하세요.");

  const limit =
    body.maxBytes && body.maxBytes > 0
      ? `\n- 결과는 ${body.maxBytes} byte(UTF-8) 이내로 한다.`
      : "";

  try {
    const refined = await chatText(env, {
      system: SYSTEM + limit,
      user: `초안: ${maskPii(text)}`,
      maxTokens: 2000,
    });
    await logAudit(env, user.id, "generate", "refine");
    return json({ refined: refined.trim() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("refine failed:", msg);
    return json({ error: "다듬기 실패: " + msg }, 502);
  }
};
