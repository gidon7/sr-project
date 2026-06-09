export interface Env {
  /** Anthropic API 키. 로컬: .dev.vars / 운영: Pages 대시보드 환경변수(Secret) */
  ANTHROPIC_API_KEY: string;
  /** 선택: 기본 claude-opus-4-8. 비용 절감 시 claude-sonnet-4-6 */
  ANTHROPIC_MODEL?: string;
}
