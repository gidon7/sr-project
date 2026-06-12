import type { Env } from "../_lib/types";
import { getUser } from "../_lib/auth";
import { json, unauthorized, badRequest } from "../_lib/http";
import { hasLLM, chatText } from "../_lib/llm";
import { logAudit } from "../_lib/audit";

const TYPE_GUIDE: Record<string, string> = {
  세특: "교과 세부능력 및 특기사항 — 수업 중 학습·탐구 활동과 그로 드러난 역량 중심",
  행특: "행동특성 및 종합의견 — 인성·태도·성장·공동체 기여 중심의 총평",
  창체: "창의적 체험활동(자율·동아리·봉사·진로) 기록 — 활동 내용과 배운 점 중심",
  진로: "진로활동 — 진로 탐색 과정과 구체화된 관심·계획 중심",
};

const SYSTEM = `당신은 학교생활기록부 서술형 문구를 작성하는 전문가입니다.
교사가 입력한 키워드·관찰 내용을 바탕으로 요청한 항목에 맞는 생기부 문장을 작성하세요.
- 입력 내용에 근거해 작성하고, 없는 사실을 과장하거나 지어내지 않는다.
- 학생의 구체적 행동·역량이 드러나게 쓰고, 추상적 미사여구를 피한다.
- 명사형 어미(~함, ~임, ~을 보임)로 끝맺는다.
- 어학시험명·특정 대학명·교외 수상·사교육(학원·과외)·부모 배경 등 기재 금지 표현은 넣지 않는다.
- 머리말·설명 없이 완성된 문구 본문만 출력한다.`;

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();
  if (!hasLLM(env)) {
    return json({ error: "AI 키가 설정되지 않았습니다.", needKey: true }, 503);
  }

  let body: { type?: string; subject?: string; keywords?: string; maxBytes?: number };
  try {
    body = await request.json();
  } catch {
    return badRequest("유효한 JSON 본문이 필요합니다.");
  }
  const type = (body.type ?? "세특").trim();
  const keywords = (body.keywords ?? "").trim();
  if (keywords.length < 4) return badRequest("키워드/관찰 내용을 입력하세요.");

  const guide = TYPE_GUIDE[type] ?? TYPE_GUIDE["세특"];
  const limit =
    body.maxBytes && body.maxBytes > 0 ? `\n결과는 ${body.maxBytes} byte(UTF-8) 이내로 한다.` : "";
  const userMsg = [
    `[항목]: ${type} (${guide})`,
    `[과목]: ${body.subject?.trim() || "미지정"}`,
    `[키워드/관찰내용]: ${keywords}`,
    `위 내용으로 ${type} 문구를 2~3문장으로 작성하라.`,
  ].join("\n");

  try {
    const text = await chatText(env, { system: SYSTEM + limit, user: userMsg, maxTokens: 1500 });
    await logAudit(env, user.id, "generate", "remark", type);
    return json({ text: text.trim() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("remark failed:", msg);
    return json({ error: "문구 생성 실패: " + msg }, 502);
  }
};
