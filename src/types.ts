// functions/_lib/analysis.ts 의 ANALYSIS_SCHEMA 와 동기화되는 분석 결과 타입.

export interface ScoreItem {
  dimension: string;
  score: number;
  comment: string;
}
export interface Strength {
  title: string;
  detail: string;
}
export interface Improvement {
  title: string;
  detail: string;
  action: string;
}
export interface RecommendedMajor {
  major: string;
  fitScore: number;
  reason: string;
}
export interface SectionAnalysis {
  section: string;
  summary: string;
  keywords: string[];
  strengths: string[];
  improvements: string[];
}
export interface SuggestedActivity {
  topic: string;
  rationale: string;
  relatedMajor: string;
}
export interface InterviewQuestion {
  question: string;
  intent: string;
}
export interface AnalysisResult {
  oneLineSummary: string;
  overallScore: number;
  scores: ScoreItem[];
  strengths: Strength[];
  improvements: Improvement[];
  recommendedMajors: RecommendedMajor[];
  sectionAnalyses: SectionAnalysis[];
  suggestedActivities: SuggestedActivity[];
  interviewQuestions: InterviewQuestion[];
}

// ---- 관리 도메인 ----
export interface User {
  id: number;
  email: string;
}
export interface Student {
  id: number;
  name: string;
  grade: string | null;
  target_major: string | null;
  created_at?: string;
  record_count?: number;
}
export interface RecordSummary {
  id: number;
  title: string;
  updated_at: string;
  analysis_count: number;
}
export interface RecordDetail {
  id: number;
  student_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}
export interface StoredAnalysis {
  result: AnalysisResult;
  model: string | null;
  created_at: string;
}

// ---- P2~P4 모듈 ----
export interface Material {
  id: number;
  title: string;
  type: string;
  subject: string | null;
  grade: string | null;
  difficulty: string | null;
  topic: string | null;
  content: string;
  created_at: string;
}
export interface DocumentItem {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}
export interface TemplateItem {
  id: number;
  title: string;
  content: string;
  created_at: string;
}
export interface Teacher {
  id: number;
  name: string;
  email: string | null;
  role: string | null;
  subject: string | null;
  created_at: string;
}
export interface ClassItem {
  id: number;
  grade: string | null;
  class_no: string | null;
  homeroom: string | null;
  note: string | null;
  created_at: string;
}
export interface TimetableItem {
  id: number;
  class_name: string | null;
  day: string | null;
  period: string | null;
  subject: string | null;
  teacher: string | null;
  created_at: string;
}

export const MATERIAL_TYPE_LABELS: Record<string, string> = {
  quiz: "퀴즈 문제지",
  fill_blank: "빈칸채우기",
  compare: "개념 비교표",
  summary: "핵심 요약",
};
