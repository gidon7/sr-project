// 생기부 기재 시 주의해야 할 표현(규칙 기반). AI 불필요.
// NEIS 기재요령상 대학명·어학시험·교외 수상·사교육·부모 배경 등은 기재 제한.
export interface Rule {
  label: string;
  pattern: RegExp;
}

export const FORBIDDEN_RULES: Rule[] = [
  { label: "어학시험명", pattern: /TOEIC|TOEFL|TEPS|IELTS|토익|토플|텝스|아이엘츠|HSK|JLPT|OPIc|오픽/gi },
  { label: "교외 대회·수상", pattern: /교외|올림피아드|경시대회|공모전/g },
  {
    label: "특정 대학명",
    pattern: /서울대|연세대|고려대|카이스트|KAIST|포스텍|POSTECH|성균관대|한양대|서강대|중앙대|경희대/g,
  },
  { label: "사교육(학원·과외)", pattern: /학원|과외|인강|사교육/g },
  { label: "부모·가정 배경", pattern: /아버지|어머니|부모님|아빠|엄마|가정형편/g },
  { label: "공인 자격·인증", pattern: /한국사능력검정|컴퓨터활용능력|MOS|정보처리/g },
];

export interface ForbiddenHit {
  label: string;
  word: string;
}

export function checkForbidden(text: string): ForbiddenHit[] {
  const hits: ForbiddenHit[] = [];
  for (const r of FORBIDDEN_RULES) {
    const m = text.match(r.pattern);
    if (m) {
      for (const w of [...new Set(m)]) hits.push({ label: r.label, word: w });
    }
  }
  return hits;
}

/** UTF-8 byte 길이 (한글 1자 = 3byte). NEIS 학년도별 기준은 별도 확인 권장. */
export function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

export const LIMIT_PRESETS: { label: string; value: number }[] = [
  { label: "기준 없음", value: 0 },
  { label: "교과 세특 (≈1500byte)", value: 1500 },
  { label: "창의적 체험활동 (≈3000byte)", value: 3000 },
  { label: "행동특성 종합의견 (≈3000byte)", value: 3000 },
];
