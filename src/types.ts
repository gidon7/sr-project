// worker/analysis.ts 의 ANALYSIS_SCHEMA 와 동기화되는 프론트엔드 타입.

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

export interface AnalyzeRequest {
  recordText: string;
  targetMajor?: string;
  grade?: string;
}
