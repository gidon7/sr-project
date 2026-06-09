# 생기부 AI (sr-project)

학생용 **생활기록부(생기부) 분석 AI**. 생기부를 붙여넣으면 Anthropic Claude가 입학사정관 관점에서
강점·보완점·추천전공·항목별 분석·후속 탐구활동·예상 면접질문·경쟁력 점수를 진단해 줍니다.

React + Vite SPA(프론트) + **Cloudflare Pages Functions**(백엔드)로 **Cloudflare Pages** 에 배포합니다.
→ 배포 주소는 `https://sr-project.pages.dev` 형태.

## 스택

- **프론트:** React 19 + Vite + TypeScript (`src/`) — React Router(랜딩 `/` + 분석기 `/analyze`)
- **백엔드:** Cloudflare **Pages Functions** (`functions/api/*`) — `/api/analyze` 가 Anthropic Messages API 호출
- **AI:** Anthropic Claude (`@anthropic-ai/sdk`), 강제 tool use + `strict` 스키마로 구조화 출력
- **모델:** 기본 `claude-opus-4-8` (env `ANTHROPIC_MODEL` 로 변경, 비용 절감 시 `claude-sonnet-4-6`)

## 구조

```
src/                       React 앱
  pages/Landing.tsx        랜딩(히어로·기능·사용법·FAQ·CTA)
  pages/Analyze.tsx        분석기
  components/              Nav, Footer, Report
  api.ts                   /api/analyze 호출
  types.ts                 분석 결과 타입 (functions/_lib/analysis.ts 와 동기화)
functions/                 Cloudflare Pages Functions (백엔드)
  api/analyze.ts           POST /api/analyze
  api/health.ts            GET  /api/health
  _lib/analysis.ts         시스템 프롬프트 + 출력 스키마 + Anthropic 호출 (단일 원천)
  _lib/pii.ts              개인정보 1차 마스킹
public/_redirects          SPA 라우팅 폴백
.claude/skills/saenggibu-analysis/   생기부 분석 도메인 지식 스킬
wrangler.jsonc             Pages 설정 (pages_build_output_dir, nodejs_compat)
```

## 사전 준비

- Node.js 20+ (이 저장소는 Node 24 LTS로 셋업)
- [Cloudflare 계정](https://dash.cloudflare.com/sign-up)
- [Anthropic API 키](https://console.anthropic.com/)

## 로컬 개발

```bash
npm install
cp .dev.vars.example .dev.vars   # ANTHROPIC_API_KEY 채우기

npm run dev        # 프론트만 빠르게 (http://localhost:5173) — /api 는 동작 안 함
npm run preview    # 빌드 + wrangler pages dev — Functions 포함 풀스택 로컬 실행
```

분석 실제 동작을 보려면 `npm run preview` (Functions가 `.dev.vars` 의 키를 읽음).

## 빌드

```bash
npm run build      # tsc 타입체크 + vite build → dist/ (정적), functions/ 는 Pages가 빌드
```

## Cloudflare Pages 배포

### A. CLI 로 배포

```bash
npx wrangler login                                # 최초 1회 (브라우저 인증)
npx wrangler pages secret put ANTHROPIC_API_KEY   # 운영용 키 등록 (프로젝트 생성 후)
npm run deploy                                    # 빌드 + wrangler pages deploy
```

첫 배포 시 `sr-project` 라는 Pages 프로젝트가 생성되고 `https://sr-project.pages.dev` 로 접속됩니다.

### B. GitHub 연동(대시보드) 으로 배포 — 추천

Cloudflare 대시보드 → **Workers & Pages → Create → Pages → Connect to Git** → 이 저장소 선택 후:

| 항목 | 값 |
|------|-----|
| **Framework preset** | None (또는 Vite) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |

그리고:
- **Settings → Variables and secrets** 에 `ANTHROPIC_API_KEY` 를 **Secret** 으로 추가 (선택: `ANTHROPIC_MODEL`)
- **Settings → Functions → Compatibility flags** 에 `nodejs_compat` 추가 (Production + Preview 모두)

이후 git push 마다 자동 빌드/배포되고, 브랜치별 프리뷰 URL도 생성됩니다.

> ⚠️ `nodejs_compat` 플래그가 없으면 Anthropic SDK가 동작하지 않습니다. CLI 배포는 `wrangler.jsonc`
> 의 `compatibility_flags` 로 적용되지만, 대시보드 빌드는 위 Settings 에서 직접 켜야 합니다.

## 개인정보

이름·연락처·주소·주민번호는 Functions에서 1차 정규식 마스킹 후 분석에 사용되며, 프롬프트에서도
무시하도록 지시합니다. 입력 원문은 서버 로그에 남기지 않습니다. 정책:
`.claude/skills/saenggibu-analysis/references/개인정보-마스킹.md`.

## 도메인 지식 / 유지보수

분석 기준·프롬프트·스키마는 Claude Code 스킬 `.claude/skills/saenggibu-analysis/` 참고.
스키마의 단일 원천은 `functions/_lib/analysis.ts`, 프론트 타입은 `src/types.ts` — 항상 함께 수정합니다.
