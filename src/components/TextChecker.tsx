import { byteLength, checkForbidden } from "../lib/saenggibuRules";

export default function TextChecker({ text, limit }: { text: string; limit?: number }) {
  const bytes = byteLength(text);
  const chars = [...text].length;
  const charsNoSpace = [...text.replace(/\s/g, "")].length;
  const hits = checkForbidden(text);
  const over = !!limit && limit > 0 && bytes > limit;

  return (
    <div className="checker">
      <div className="checker-stats">
        <span>{chars.toLocaleString()}자</span>
        <span>공백 제외 {charsNoSpace.toLocaleString()}자</span>
        <span className={over ? "byte over" : "byte"}>
          {bytes.toLocaleString()} byte{limit && limit > 0 ? ` / ${limit.toLocaleString()}` : ""}
          {over ? " 초과" : ""}
        </span>
      </div>
      {hits.length > 0 && (
        <div className="checker-warn">
          <div className="checker-warn-head">⚠️ 기재 주의 표현 {hits.length}건 (검토 필요)</div>
          <div className="checker-chips">
            {hits.map((h, i) => (
              <span className="warn-chip" key={i}>
                {h.word} <em>{h.label}</em>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
