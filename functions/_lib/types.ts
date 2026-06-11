export interface Env {
  /** Cloudflare D1 데이터베이스 (wrangler.jsonc d1_databases 바인딩) */
  DB: D1Database;
  /** OpenAI API 키 (있으면 우선 사용). 기본 모델 gpt-4o-mini */
  OPENAI_API_KEY?: string;
  /** 선택: 기본 gpt-4o-mini */
  OPENAI_MODEL?: string;
  /** Anthropic API 키 (OpenAI 키가 없을 때 사용) */
  ANTHROPIC_API_KEY?: string;
  /** 선택: 기본 claude-sonnet-4-6 */
  ANTHROPIC_MODEL?: string;
}
