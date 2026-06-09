/**
 * 개인정보 1차 마스킹 — Anthropic API로 보내기 전에 정규식으로 식별정보를 지운다.
 * 자세한 정책: .claude/skills/saenggibu-analysis/references/개인정보-마스킹.md
 *
 * 원칙: 무손실 우선. 평가에 필요한 활동/세특 텍스트는 절대 깎지 않는다.
 * 이름은 정규식으로 안전 제거가 어려워 프롬프트의 "무시" 지시로 보완한다.
 */
export function maskPii(input: string): string {
  let text = input;

  // 주민등록번호: 6자리-7자리
  text = text.replace(/\b\d{6}\s*-\s*\d{7}\b/g, "[주민번호]");

  // 휴대전화/전화번호: 010-1234-5678, 02-123-4567 등 (하이픈/공백/점 구분 허용)
  text = text.replace(/\b0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}\b/g, "[전화번호]");

  // 이메일
  text = text.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    "[이메일]",
  );

  // 주소(시/도 + 구/군 + 동/읍/면/로/길 패턴) — best-effort
  text = text.replace(
    /([가-힣]+(?:특별시|광역시|특별자치시|도|특별자치도))\s*[가-힣]+(?:시|군|구)\s*[가-힣0-9]+(?:읍|면|동|로|길)[^\n,]*/g,
    "[주소]",
  );

  return text;
}
