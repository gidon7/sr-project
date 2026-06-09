# 생기부 관리 AI (sr-project)

**교사용 생활기록부(생기부) 관리 + AI 분석** 웹앱. 선생님이 로그인해 학생을 등록하고, 학생별로
생기부를 저장·수정하며, AI(입학사정관 관점)가 강점·보완점·추천전공·항목별 분석·후속 탐구활동·
예상 면접질문·경쟁력 점수를 진단해 보관합니다.

React + Vite SPA + **Cloudflare Pages Functions** + **Cloudflare D1**(DB) 로 **Cloudflare Pages** 에 배포 → `https://sr-project.pages.dev`.

## 스택

- **프론트:** React 19 + Vite + TypeScript, React Router (랜딩/로그인/대시보드/학생/생기부)
- **백엔드:** Cloudflare Pages Functions (`functions/api/*`)
- **DB:** Cloudflare D1 (SQLite) — `users / sessions / students / records / analyses`
- **인증:** 이메일+비밀번호, PBKDF2 해시, 세션 쿠키(HttpOnly)
- **AI:** Anthropic Claude (`@anthropic-ai/sdk`), 강제 tool use + `strict` 스키마
- **모델:** 기본 `claude-opus-4-8` (env `ANTHROPIC_MODEL`, 비용 절감 시 `claude-sonnet-4-6`)

## 구조

```
src/
  pages/  Landing, Login, Register, Dashboard(학생목록), StudentPage(생기부목록), RecordPage(편집+분석)
  components/  Nav, Footer, Report
  auth.tsx     인증 컨텍스트
  lib/api.ts   API 클라이언트
  types.ts     공유 타입
functions/
  api/auth/    register, login, logout, me
  api/students/  index(GET/POST), [id](GET/PUT/DELETE), [id]/records
  api/records/   [id](GET/PUT/DELETE), [id]/analyze
  _lib/        auth, data, http, analysis(프롬프트·스키마), pii, types
migrations/0001_init.sql   D1 스키마
wrangler.jsonc             Pages + D1 + nodejs_compat
```

## 로컬 개발

```bash
npm install
cp .dev.vars.example .dev.vars          # ANTHROPIC_API_KEY 채우기 (분석 기능에 필요)

# 1) 로컬 D1에 스키마 적용 (최초 1회)
npx wrangler d1 execute sr-project-db --local --file=./migrations/0001_init.sql

# 2) 풀스택 실행 (빌드 + Functions + 로컬 D1)
npm run preview                          # http://127.0.0.1:8788
```

> `npm run dev` 는 프론트(UI)만 빠르게 띄웁니다. 로그인/DB/분석까지 보려면 `npm run preview`.

## Cloudflare Pages 배포

### 1. D1 데이터베이스 만들기

```bash
npx wrangler login
npx wrangler d1 create sr-project-db
```

출력된 `database_id` 를 **`wrangler.jsonc` 의 `d1_databases[0].database_id`** 에 붙여넣습니다.
그다음 운영 DB에 스키마 적용:

```bash
npx wrangler d1 execute sr-project-db --remote --file=./migrations/0001_init.sql
```

### 2. 배포

**A. CLI**
```bash
npx wrangler pages secret put ANTHROPIC_API_KEY   # 프로젝트 생성 후
npm run deploy
```

**B. 대시보드 Git 연동 (추천)** — Workers & Pages → Create → **Pages** → Connect to Git → `gidon7/sr-project`
- Build command: `npm run build` / Build output directory: `dist`
- **Settings → Variables and secrets**: `ANTHROPIC_API_KEY` (Secret), 선택 `ANTHROPIC_MODEL`
- **Settings → Functions → Compatibility flags**: `nodejs_compat` (Production + Preview)
- **Settings → Functions → D1 database bindings**: 변수명 `DB` → `sr-project-db` 연결
- 스키마는 위 `wrangler d1 execute ... --remote` 로 1회 적용

## 개인정보

이름·연락처·주소·주민번호는 분석 전 자동 마스킹(정규식)되고 프롬프트에서도 무시하도록 지시합니다.
입력 원문은 서버 로그에 남기지 않습니다. 정책:
`.claude/skills/saenggibu-analysis/references/개인정보-마스킹.md`.

## 유지보수

분석 프롬프트·스키마의 단일 원천은 `functions/_lib/analysis.ts`, 프론트 타입은 `src/types.ts`.
도메인 지식은 Claude Code 스킬 `.claude/skills/saenggibu-analysis/` 참고.
