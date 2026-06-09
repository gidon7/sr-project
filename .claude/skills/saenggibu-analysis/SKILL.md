---
name: saenggibu-analysis
description: 학생 생활기록부(생기부)를 AI로 분석해 강점·보완점·추천전공·탐구활동 제안·면접 예상질문·경쟁력 점수 리포트를 생성하는 도메인 지식과 프롬프트. 생기부 분석 기능을 만들거나 수정할 때, 분석 프롬프트·출력 스키마·개인정보 마스킹 규칙을 다룰 때 사용.
---

# 생기부 분석 (학생용)

이 스킬은 **학생용 생활기록부(생기부) 분석 AI**(sr-project)를 만들고 유지보수하기 위한
도메인 지식·프롬프트·출력 스키마·개인정보 처리 규칙을 담는다. 참고 서비스는
[생기부ON(vibeon.ai)](https://www.vibeon.ai/analysis-info/scr) 스타일 — 생기부를 입력하면
입학사정관 관점의 진단 리포트를 만들어 준다.

## 무엇을 만드는가

학생이 자신의 생기부 텍스트를 붙여넣으면, AI가 다음을 생성한다:

1. **한 줄 총평 + 종합 경쟁력 점수**(0~100)
2. **영역별 점수**(학업역량 / 전공적합성 / 발전가능성 / 인성·공동체 / 탐구역량)
3. **강점**과 **보완점**(실행 제안 포함)
4. **추천 전공/계열**(적합도 + 근거)
5. **생기부 항목별 분석**(교과 세특, 창의적 체험활동, 행동특성 및 종합의견, 독서 등)
6. **후속 탐구활동 제안**(주제 + 이유 + 연계 전공)
7. **면접 예상 질문**(질문 + 출제 의도)

## 아키텍처 (sr-project)

Cloudflare **Pages** + **Pages Functions** 로 배포 (`*.pages.dev`).

```
React SPA (src/)  ──POST /api/analyze──▶  Pages Function (functions/api/analyze.ts)
                                              │
                                              ├─ _lib/pii.ts        개인정보 1차 마스킹
                                              ├─ _lib/analysis.ts   시스템 프롬프트 + 출력 스키마
                                              └─ Anthropic Messages API (forced tool use)
```

- **모델**: 기본 `claude-opus-4-8`. 비용 민감 시 env `ANTHROPIC_MODEL=claude-sonnet-4-6`.
- **구조화 출력**: 단일 도구 `submit_saenggibu_analysis` 를 `tool_choice`로 강제하고
  `strict: true`로 스키마를 보장한다. (extended thinking과 강제 tool_choice는 함께 못 쓰므로
  thinking은 끈다 — 출력이 스키마로 제약되어 품질에 영향 없음.)
- **API 키**: `ANTHROPIC_API_KEY` 시크릿. 로컬은 `.dev.vars`, 운영은
  `npx wrangler pages secret put ANTHROPIC_API_KEY` 또는 Pages 대시보드 환경변수.
- **nodejs_compat** 플래그 필요(Anthropic SDK) — `wrangler.jsonc` 및 대시보드 Functions 설정.

## 작업할 때 읽을 참고 문서

| 무엇을 할 때 | 읽을 파일 |
|---|---|
| 생기부 항목 구조가 헷갈릴 때 | [references/생기부-구조.md](references/생기부-구조.md) |
| 평가 영역·기준을 바꿀 때 | [references/분석-기준.md](references/분석-기준.md) |
| 분석 프롬프트를 수정할 때 | [references/프롬프트.md](references/프롬프트.md) |
| 출력 JSON 스키마를 바꿀 때 | [references/출력-스키마.md](references/출력-스키마.md) |
| 개인정보 처리를 손볼 때 | [references/개인정보-마스킹.md](references/개인정보-마스킹.md) |

스키마/프롬프트의 **단일 원천(source of truth)** 은 `functions/_lib/analysis.ts`,
프론트 타입은 `src/types.ts`. 위 MD는 그 설계 의도를 설명한다. 셋은 항상 함께 수정한다.

## 절대 규칙

- **사실 날조 금지.** 생기부에 없는 수상·활동·성적을 만들어내지 않는다. 근거는 입력 텍스트에서만.
- **개인정보 최소화.** 이름·연락처·주민번호·주소는 분석에 불필요 → 마스킹 후 전송, 프롬프트에서도 무시 지시.
- **건설적·구체적 톤.** 보완점은 비난이 아니라 "다음에 무엇을 하면 좋은지"로.
- **출력은 한국어**, 스키마는 영어 키(코드 일관성). 점수는 0~100 정수.
- 합격/불합격을 단정하지 않는다. "경쟁력 진단"과 "방향 제안"까지만.
