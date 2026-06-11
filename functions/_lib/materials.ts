import type { Env } from "./types";
import { chatText } from "./llm";

export interface MaterialInput {
  type: "quiz" | "fill_blank" | "compare" | "summary";
  subject?: string;
  grade?: string;
  difficulty?: string;
  topic: string;
  count?: number;
}

const TYPE_GUIDE: Record<MaterialInput["type"], string> = {
  quiz: "객관식 4지선다 퀴즈 문제지. 각 문항은 문제, 보기 4개, 정답, 간단한 해설을 포함한다. <ol> 사용. 정답/해설은 각 문항 아래에 표시.",
  fill_blank: "빈칸 채우기 학습지. 핵심 개념을 ____ 로 비운 문장들과, 하단에 정답 목록을 포함한다.",
  compare: "개념 비교표. <table>로 항목 간 특징을 비교한다. 헤더 행과 비교 항목 행을 명확히.",
  summary: "핵심 요약 정리. <h3> 소제목과 <ul> 불릿으로 단원 핵심을 정리한다.",
};

/**
 * 수업 자료(HTML)를 생성한다. provider는 llm.ts가 자동 선택(없으면 호출부에서 차단).
 */
export async function generateMaterial(env: Env, input: MaterialInput): Promise<string> {
  const count = input.count && input.count > 0 ? input.count : 5;

  const system = `당신은 대한민국 학교 교사를 돕는 수업 자료 생성 전문가입니다.
요청한 유형의 수업 자료를 한국어로, 깔끔한 시맨틱 HTML 조각으로만 생성하세요.
- 전체를 <html>/<body>로 감싸지 말고, 본문에 들어갈 HTML 조각만 출력합니다.
- 인라인 style이나 script는 쓰지 않습니다. 제목은 <h3>, 목록은 <ol>/<ul>, 표는 <table>.
- 코드펜스(\`\`\`)나 설명 문장 없이 HTML만 출력하세요.
- 학년·난이도에 맞는 어휘와 깊이로 작성합니다.
- 내용은 한국 교육과정에 부합하고 사실이 정확해야 하며, 오개념을 포함하지 않습니다.
- 퀴즈·빈칸은 정답이 명확하고 유일하도록 출제하고 해설을 정확히 답니다.
- 요청한 주제·과목과 직접 관련된 내용만 다루고, 무관한 내용은 넣지 않습니다.`;

  const user = `다음 조건으로 수업 자료를 만들어 주세요.
유형: ${TYPE_GUIDE[input.type]}
과목: ${input.subject || "미지정"}
학년: ${input.grade || "미지정"}
난이도: ${input.difficulty || "보통"}
주제/단원: ${input.topic}
문항/항목 수: 약 ${count}개`;

  const text = await chatText(env, { system, user, maxTokens: 8000 });

  // 혹시 코드펜스로 감싸면 제거
  return text.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
}
