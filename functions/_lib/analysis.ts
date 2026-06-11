/**
 * 생기부 분석의 단일 원천(source of truth): 시스템 프롬프트 + 출력 스키마 + 호출 로직.
 * 설계 의도: .claude/skills/saenggibu-analysis/ (SKILL.md 및 references/)
 * 프론트 타입은 src/types.ts 의 AnalysisResult 와 동기화한다.
 */
import type { Env } from "./types";
import { chatJson } from "./llm";

const TOOL_NAME = "submit_saenggibu_analysis";

export const SYSTEM_PROMPT = `당신은 대한민국 대입 학생부종합전형의 입학사정관이자 진학지도 전문가입니다.
입력된 학교생활기록부(생기부)를 아래 5개 평가요소 기준으로 진단하고, 반드시 ${TOOL_NAME} 도구를 호출해 결과를 제출하세요.

평가요소: 학업역량 · 전공적합성 · 발전가능성 · 인성·공동체 · 탐구역량

원칙:
- 입력 텍스트에 실제로 드러난 근거로만 판단한다. 생기부에 없는 수상·활동·성적을 절대 만들어내지 않는다.
- 이름·연락처·주소 등 개인 식별정보는 평가와 무관하므로 무시한다(이미 일부 마스킹됨).
- 모든 서술은 한국어. 구체적이고 건설적으로. 보완점은 "다음에 무엇을 하면 좋은지" 실행 제안으로.
- 영역 점수의 코멘트와 추천 전공의 근거에는 생기부 속 구체적 활동을 인용한다. 일반론을 피한다.
- 합격/불합격을 단정하거나 특정 대학 합격을 보장하지 않는다. 경쟁력 진단과 방향 제안까지만 한다.

개수 가이드: scores 5개(위 영역) · strengths 3~5개 · improvements 3~5개 · recommendedMajors 3~5개 ·
sectionAnalyses는 입력에 존재하는 항목만 · suggestedActivities 3~5개 · interviewQuestions 4~6개.`;

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
          comment: { type: "string", description: "생기부 근거를 인용한 코멘트" },
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
          major: { type: "string", description: "추천 전공/계열명" },
          fitScore: { type: "integer", description: "적합도 0~100 정수" },
          reason: { type: "string", description: "생기부 활동 근거에 기반한 추천 이유" },
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
          question: { type: "string", description: "생기부 기반 면접 예상 질문" },
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
    `[지원 희망 계열/전공]: ${targetMajor?.trim() || "미지정"}`,
    `[학년/계열]: ${grade?.trim() || "미지정"}`,
    "",
    "다음은 분석할 생활기록부 내용이다(개인정보는 일부 마스킹됨):",
    '"""',
    recordText,
    '"""',
    "",
    `위 내용을 평가요소 기준으로 분석하고 ${TOOL_NAME} 도구로 결과를 제출하라.`,
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
