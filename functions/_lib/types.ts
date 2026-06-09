export interface Env {
  /** Cloudflare D1 데이터베이스 (wrangler.jsonc d1_databases 바인딩) */
  DB: D1Database;
  /** Anthropic API 키. 로컬: .dev.vars / 운영: Pages 환경변수(Secret) */
  ANTHROPIC_API_KEY: string;
  /** 선택: 기본 claude-opus-4-8. 비용 절감 시 claude-sonnet-4-6 */
  ANTHROPIC_MODEL?: string;
}
