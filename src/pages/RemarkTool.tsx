import { useState } from "react";
import { api } from "../lib/api";
import CopyButton from "../components/CopyButton";
import AiDraftNotice from "../components/AiDraftNotice";
import MicButton from "../components/MicButton";
import TextChecker from "../components/TextChecker";
import { LIMIT_PRESETS } from "../lib/saenggibuRules";
import { downloadWord, textToHtml } from "../lib/wordExport";

const TYPES = ["세특", "행특", "창체", "진로"];

export default function RemarkTool() {
  const [type, setType] = useState("세특");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
  const [maxBytes, setMaxBytes] = useState(1500);
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    setResult("");
    try {
      const d = await api.generateRemark({ type, subject, keywords, maxBytes: maxBytes || undefined });
      setResult(d.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">생기부 문구 생성</h1>
          <p className="page-desc">
            관찰한 키워드만 입력하면 세특·행특·창체·진로 문구를 만들어 드립니다.
          </p>
        </div>
      </div>

      <form className="panel record-editor" onSubmit={run}>
        <div className="gen-row">
          <label>
            항목
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            과목 <span className="opt">(선택)</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="예: 과학" />
          </label>
          <label>
            기재 기준
            <select value={maxBytes} onChange={(e) => setMaxBytes(Number(e.target.value))}>
              {LIMIT_PRESETS.map((p) => (
                <option key={p.label} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="editor-top">
          <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>키워드 / 관찰 내용</span>
          <MicButton onText={(t) => setKeywords((p) => (p ? p + " " + t : t))} />
        </div>
        <textarea
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          rows={5}
          placeholder="예: 중화반응 실험 적극 참여, 보고서 꼼꼼히 정리, 친구 도와줌, 추가 자료 조사"
        />
        {error && <div className="error-banner">⚠️ {error}</div>}
        <div className="editor-actions">
          <button className="btn btn-primary" disabled={busy || keywords.trim().length < 4}>
            {busy ? "생성 중…" : "✨ 문구 생성"}
          </button>
        </div>
      </form>

      {busy && (
        <div className="loading">
          <div className="spinner" />
        </div>
      )}

      {result && !busy && (
        <div className="panel" style={{ marginTop: "1rem" }}>
          <AiDraftNotice />
          <div className="refine-result">{result}</div>
          <TextChecker text={result} limit={maxBytes} />
          <div className="editor-actions" style={{ marginTop: "0.6rem" }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => downloadWord(`${type}_문구`, textToHtml(`${type} 문구`, result), `${type} 문구`)}
            >
              ⬇ Word
            </button>
            <CopyButton text={result} label="결과 복사" />
          </div>
        </div>
      )}
    </>
  );
}
