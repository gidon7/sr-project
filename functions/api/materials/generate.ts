import type { Env } from "../../_lib/types";
import { getUser } from "../../_lib/auth";
import { json, unauthorized, badRequest } from "../../_lib/http";
import { generateMaterial, type MaterialInput } from "../../_lib/materials";

// POST /api/materials/generate — AI로 수업 자료 생성 후 저장 (키 필요)
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const user = await getUser(env, request);
  if (!user) return unauthorized();

  if (!env.ANTHROPIC_API_KEY) {
    return json(
      {
        error: "AI 키(ANTHROPIC_API_KEY)가 아직 설정되지 않았습니다. 키를 등록하면 바로 생성됩니다.",
        needKey: true,
      },
      503,
    );
  }

  let body: MaterialInput;
  try {
    body = (await request.json()) as MaterialInput;
  } catch {
    return badRequest("유효한 JSON 본문이 필요합니다.");
  }
  if (!body.type) return badRequest("유형을 선택하세요.");
  if (!body.topic?.trim()) return badRequest("주제/단원을 입력하세요.");

  try {
    const content = await generateMaterial(env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL, body);
    const title = body.topic.trim();
    const res = await env.DB.prepare(
      "INSERT INTO materials (user_id, title, type, subject, grade, difficulty, topic, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(
        user.id,
        title,
        body.type,
        body.subject ?? null,
        body.grade ?? null,
        body.difficulty ?? null,
        body.topic,
        content,
      )
      .run();
    const item = await env.DB.prepare("SELECT * FROM materials WHERE id = ?")
      .bind(Number(res.meta.last_row_id))
      .first();
    return json({ item });
  } catch (e) {
    console.error("material gen failed:", e instanceof Error ? e.message : String(e));
    return json({ error: "자료 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }, 502);
  }
};
