# 생기부 AI (sr-project)

학생용 **생활기록부(생기부) 분석 AI**. 생기부를 붙여넣으면 Anthropic Claude가 입학사정관 관점에서
강점·보완점·추천전공·항목별 분석·후속 탐구활동·예상 면접질문·경쟁력 점수를 진단해 줍니다.
참고: [생기부ON(vibeon.ai)](https://www.vibeon.ai/analysis-info/scr) 스타일.

React + Vite SPA(프론트) + Cloudflare **Worker**(백엔드)를 한 배포 단위로 묶어
Cloudflare Workers(정적 자산 포함)에 올립니다 — "Pages + Workers"의 통합 모델.

## 스택

- **프론트:** React 19 + Vite + TypeScript (`src/`)
- **백엔드:** Cloudflare Worker (`worker/`) — `/api/analyze` 가 Anthropic Messages API 호출
- **AI:** Anthropic Claude (`@anthropic-ai/sdk`), 강제 tool use + `strict` 스키마로 구조화 출력
- **모델:** 기본 `claude-opus-4-8` (env `ANTHROPIC_MODEL` 로 변경, 비용 절감 시 `claude-sonnet-4-6`)
- **글루:** `@cloudflare/vite-plugin`, 배포는 Wrangler

## 구조

```
src/                 React 앱 (입력 폼 + 리포트 UI)
  components/Report.tsx
  api.ts             /api/analyze 호출
  types.ts           분석 결과 타입 (worker/analysis.ts 와 동기화)
worker/
  index.ts           /api/* 라우팅
  analysis.ts        시스템 프롬프트 + 출력 스키마 + Anthropic 호출 (단일 원천)
  pii.ts             개인정보 1차 마스킹
.claude/skills/saenggibu-analysis/   생기부 분석 도메인 지식 스킬 (Claude Code용)
docs/                제품 개요
wrangler.jsonc       Cloudflare 배포 설정
```

## 사전 준비

- Node.js 20+ (이 저장소는 Node 24 LTS로 셋업)
- [Cloudflare 계정](https://dash.cloudflare.com/sign-up)
- [Anthropic API 키](https://console.anthropic.com/)

## 로컬 개발

```bash
npm install
cp .dev.vars.example .dev.vars   # 그리고 ANTHROPIC_API_KEY 채우기
npm run dev
```

출력된 주소(기본 http://localhost:5173)를 엽니다. 프론트의 "예시 넣기"로 바로 체험할 수 있어요.

## 빌드

```bash
npm run build      # tsc 타입체크 + vite build → dist/
npm run preview
```

## Cloudflare 배포

### A. CLI 로 배포

```bash
npx wrangler login                          # 최초 1회 (브라우저 인증)
npx wrangler secret put ANTHROPIC_API_KEY   # 운영용 API 키 등록
npm run deploy                              # 빌드 + 배포
```

배포 후 `https://sr-project.<subdomain>.workers.dev` 로 접속됩니다.

### B. GitHub 연동(Workers Builds) 으로 배포

Cloudflare 대시보드 → Workers & Pages → 이 저장소 연결 후:

| 항목 | 값 |
|------|-----|
| **Build command** | `npm run build` |
| **Deploy command** | `npx wrangler deploy` |

그리고 **Settings → Variables and Secrets** 에 `ANTHROPIC_API_KEY` 를 **Secret** 으로 추가합니다.
(선택) `ANTHROPIC_MODEL` 을 추가해 모델을 바꿀 수 있습니다.

> ⚠️ Build command 를 비워두면 `vite build` 가 실행되지 않아 `assets.directory` 누락 에러가 납니다.
> `@cloudflare/vite-plugin` 은 빌드 시점에 배포 설정을 생성하므로 **빌드가 반드시 선행**되어야 합니다.

## 개인정보

이름·연락처·주소·주민번호는 Worker에서 1차 정규식 마스킹 후 분석에 사용되며, 프롬프트에서도
무시하도록 지시합니다. 입력 원문은 서버 로그에 남기지 않습니다. 자세한 정책은
`.claude/skills/saenggibu-analysis/references/개인정보-마스킹.md` 참고.

## 도메인 지식 / 유지보수

분석 기준·프롬프트·스키마를 바꿀 때는 Claude Code 스킬
`.claude/skills/saenggibu-analysis/` 의 문서를 참고하세요. 스키마의 단일 원천은
`worker/analysis.ts`, 프론트 타입은 `src/types.ts` — 항상 함께 수정합니다.
