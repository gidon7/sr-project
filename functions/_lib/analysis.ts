/**
 * 생기부 분석의 단일 원천(source of truth): 시스템 프롬프트 + 출력 스키마 + 호출 로직.
 * 설계 의도: .claude/skills/saenggibu-analysis/ (SKILL.md 및 references/)
 * 프론트 타입은 src/types.ts 의 AnalysisResult 와 동기화한다.
 */
import type { Env } from "./types";
import { chatJson } from "./llm";

const TOOL_NAME = "submit_saenggibu_analysis";

export const SYSTEM_PROMPT = `당신은 대한민국 대입 학생부종합전형의 입학사정관이자 진학지도 전문가입니다.
입력된 학교생활기록부(생기부)를 평가요소 기준으로 진단하고, 반드시 ${TOOL_NAME} 도구의 스키마에 맞춰 결과를 제출하세요.

[평가요소 — 각 0~100점]
- 학업역량: 교과 성취와 세특에 드러난 개념 이해·지적 성장
- 전공적합성: 희망(또는 생기부에서 추론한) 계열과 활동·세특·독서의 연계 일관성
- 발전가능성: 시간에 따른 성장, 자기주도성, 실패·보완 경험
- 인성·공동체: 협업·배려·책임·봉사의 진정성
- 탐구역량: 호기심→질문→탐구→산출→후속활동으로 이어지는 연결성

[점수 기준]
90~100 근거가 풍부하고 깊이·연결성이 탁월 / 75~89 견고하며 한두 가지 보완 시 상위권 / 60~74 평이하고 차별화 부족 /
40~59 근거 빈약 / 0~39 관련 기록이 거의 없음. 입력에 근거가 적은 영역은 보수적으로(낮게) 평가한다.

[필수 규칙]
1. 근거주의: 모든 영역 점수의 코멘트, 강점, 보완점은 생기부에 실제로 적힌 활동을 직접 인용·지칭한다(예: "화학Ⅰ 세특의 중화반응 실험"). 생기부에 없는 활동·수상·성적·수치를 절대 지어내지 않는다.
2. 추천 전공: 반드시 생기부에 드러난 관심·활동 분야와 직접 연결되는 전공만 추천한다. 활동과 무관한 분야는 추천하지 않는다. 희망 전공이 주어지면 그 전공과의 적합도를 우선 평가하고 인접·연계 전공을 함께 제시한다. 희망 전공이 없으면 활동에서 관심 계열을 추론해 그에 맞춰 추천한다.
3. 보완점: 이 학생의 실제 약한 부분에 맞춘, 다음 학기에 바로 실행할 수 있는 구체적 행동으로 제시한다(일반론 금지).
4. 면접 질문: 생기부의 특정 활동을 깊이 파고드는 형태로 만든다(자기소개서식 일반 질문 금지).
5. 탐구활동 제안: 기존 활동에서 자연스럽게 한 걸음 더 나아가는 실행 가능한 주제로 한다.
6. 합격/불합격을 단정하거나 특정 대학 합격을 보장하지 않는다.
7. 이름·연락처·주소 등 개인 식별정보는 평가와 무관하므로 무시한다.
8. 모든 서술은 한국어로, 추상적 미사여구 없이 구체적으로 쓴다.

[개수] scores 정확히 5개 · strengths 3~5 · improvements 3~5 · recommendedMajors 3~5(근거 강한 순) ·
sectionAnalyses는 입력에 존재하는 항목만 · suggestedActivities 3~5 · interviewQuestions 4~6.`;

/** Anthropic structured output(strict) 제약 준수: additionalProperties:false, 모든 키 required. */
export const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    oneLineSummary: { type: "string", description: "생기부 전체에 대한 한 줄 총평" },
    overallScore: { type: "integer", description: "종합 경쟁력 점수 (0~100 정수)" },
    scores: {
      type: "array",
      description: "5개 평가 영역별 점수",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          dimension: {
            type: "string",
            description: "평가 영역: 학업역량 / 전공적합성 / 발전가능성 / 인성·공동체 / 탐구역량",
          },
          score: { type: "integer", description: "0~100 정수" },
          comment: {
            type: "string",
            description: "이 영역 평가의 근거가 된 생기부 속 구체적 활동을 인용한 코멘트",
          },
        },
        required: ["dimension", "score", "comment"],
      },
    },
    strengths: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string", description: "강점 한 줄 제목" },
          detail: { type: "string", description: "근거와 설명" },
        },
        required: ["title", "detail"],
      },
    },
    improvements: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string", description: "보완점 한 줄 제목" },
          detail: { type: "string", description: "무엇이 부족한지" },
          action: { type: "string", description: "구체적 실행 제안" },
        },
        required: ["title", "detail", "action"],
      },
    },
    recommendedMajors: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          major: {
            type: "string",
            description: "생기부 활동과 직접 연관된 추천 전공/계열명 (활동과 무관한 전공 금지)",
          },
          fitScore: { type: "integer", description: "적합도 0~100 정수" },
          reason: {
            type: "string",
            description: "생기부의 어떤 활동 때문에 이 전공이 적합한지에 대한 구체적 근거",
          },
        },
        required: ["major", "fitScore", "reason"],
      },
    },
    sectionAnalyses: {
      type: "array",
      description: "생기부 항목별 분석 (입력에 존재하는 항목만)",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          section: { type: "string", description: "항목명 (예: 교과세특, 동아리활동, 행동특성및종합의견, 독서)" },
          summary: { type: "string", description: "해당 항목 요약 평가" },
          keywords: { type: "array", items: { type: "string" }, description: "핵심 키워드" },
          strengths: { type: "array", items: { type: "string" }, description: "이 항목의 강점" },
          improvements: { type: "array", items: { type: "string" }, description: "이 항목의 보완점" },
        },
        required: ["section", "summary", "keywords", "strengths", "improvements"],
      },
    },
    suggestedActivities: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          topic: { type: "string", description: "후속 탐구활동 주제" },
          rationale: { type: "string", description: "왜 이 학생에게 적합한지" },
          relatedMajor: { type: "string", description: "연계 전공/계열" },
        },
        required: ["topic", "rationale", "relatedMajor"],
      },
    },
    interviewQuestions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          question: {
            type: "string",
            description: "생기부의 특정 활동을 깊이 파고드는 면접 예상 질문",
          },
          intent: { type: "string", description: "출제 의도" },
        },
        required: ["question", "intent"],
      },
    },
  },
  required: [
    "oneLineSummary",
    "overallScore",
    "scores",
    "strengths",
    "improvements",
    "recommendedMajors",
    "sectionAnalyses",
    "suggestedActivities",
    "interviewQuestions",
  ],
} as const;

export interface AnalyzeInput {
  recordText: string; // 마스킹된 생기부 텍스트
  targetMajor?: string;
  grade?: string;
}

function buildUserMessage({ recordText, targetMajor, grade }: AnalyzeInput): string {
  return [
    `[지원 희망 계열/전공]: ${targetMajor?.trim() || "미지정 — 생기부 활동에서 관심 계열을 추론할 것"}`,
    `[학년/계열]: ${grade?.trim() || "미지정"}`,
    "",
    "다음은 분석할 생활기록부 내용이다(개인정보는 일부 마스킹됨):",
    '"""',
    recordText,
    '"""',
    "",
    "위 생기부에 실제로 적힌 근거만 사용해 평가요소 기준으로 분석하고, 추천 전공은 반드시 위 활동과 직접 연결되는 분야로 정하라. " +
      `결과는 ${TOOL_NAME} 도구 스키마에 맞춰 제출하라.`,
  ].join("\n");
}

/**
 * 구조화된 생기부 분석 결과(JSON)를 돌려준다.
 * provider(OpenAI/Anthropic)는 llm.ts가 환경변수로 자동 선택한다.
 */
export async function runAnalysis(env: Env, input: AnalyzeInput): Promise<unknown> {
  return chatJson(env, {
    system: SYSTEM_PROMPT,
    user: buildUserMessage(input),
    schema: ANALYSIS_SCHEMA,
    schemaName: TOOL_NAME,
    maxTokens: 8000,
  });
}
