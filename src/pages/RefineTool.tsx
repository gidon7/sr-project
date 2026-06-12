import { useState } from "react";
import { api } from "../lib/api";
import CopyButton from "../components/CopyButton";
import AiDraftNotice from "../components/AiDraftNotice";
import TextChecker from "../components/TextChecker";
import { LIMIT_PRESETS } from "../lib/saenggibuRules";

export default function RefineTool() {
  const [text, setText] = useState("");
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
      const d = await api.refine(text, maxBytes || undefined);
      setResult(d.refined);
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
          <h1 className="page-title">생기부 윤문</h1>
          <p className="page-desc">
            교사가 쓴 초안을 NEIS 기재 방식으로 다듬어 드립니다. 없는 사실은 만들지 않습니다.
          </p>
        </div>
      </div>

      <form className="panel record-editor" onSubmit={run}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="다듬고 싶은 초안을 입력하세요. 예: 화학 시간에 중화반응 실험을 했고 결과를 보고서로 정리함. 친구들 도와줌."
        />
        <div className="checker-bar">
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
          <span className="checker-note">※ 명사형 어미·금칙어 배제·byte 이내로 다듬습니다</span>
        </div>
        {error && <div className="error-banner">⚠️ {error}</div>}
        <div className="editor-actions">
          <button className="btn btn-primary" disabled={busy || text.trim().length < 10}>
            {busy ? "다듬는 중…" : "✨ 다듬기"}
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
            <CopyButton text={result} label="결과 복사" />
          </div>
        </div>
      )}
    </>
  );
}
