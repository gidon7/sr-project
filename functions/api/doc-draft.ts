import type { Env } from "../_lib/types";
import { getUser } from "../_lib/auth";
import { json, unauthorized, badRequest } from "../_lib/http";
import { hasLLM, chatText } from "../_lib/llm";
import { logAudit } from "../_lib/audit";

const SYSTEM = `당신은 학교 행정 문서를 작성하는 전문가입니다.
요청한 종류의 문서를 정중하고 명확한 한국어로 작성하세요.
- 깔끔한 시맨틱 HTML 조각만 출력합니다. 제목은 <h2>, 문단은 <p>, 목록은 <ul>/<ol>, 표는 <table>.
- 전체를 <html>/<body>로 감싸지 않고, 인라인 style·script·코드펜스 없이 본문 HTML만 출력합니다.
- 입력한 핵심 내용에 근거해 작성하고, 사실이 아닌 구체 정보(날짜·금액 등)는 임의로 지어내지 않습니다(필요하면 빈칸으로 둠).`;

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();
  if (!hasLLM(env)) {
    return json({ error: "AI 키가 설정되지 않았습니다.", needKey: true }, 503);
  }

  let body: { docType?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest("유효한 JSON 본문이 필요합니다.");
  }
  const docType = (body.docType ?? "가정통신문").trim();
  const content = (body.content ?? "").trim();
  if (content.length < 4) return badRequest("핵심 내용을 입력하세요.");

  const userMsg = `[문서 종류]: ${docType}\n[핵심 내용]: ${content}\n위 내용으로 ${docType}을(를) 작성하라.`;

  try {
    let html = await chatText(env, { system: SYSTEM, user: userMsg, maxTokens: 2500 });
    html = html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    await logAudit(env, user.id, "generate", "document", docType);
    return json({ html });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("doc-draft failed:", msg);
    return json({ error: "문서 생성 실패: " + msg }, 502);
  }
};
