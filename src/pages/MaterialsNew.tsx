import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const TYPES = [
  { value: "quiz", label: "퀴즈 문제지" },
  { value: "fill_blank", label: "빈칸채우기" },
  { value: "compare", label: "개념 비교표" },
  { value: "summary", label: "핵심 요약" },
];

export default function MaterialsNew() {
  const navigate = useNavigate();
  const [type, setType] = useState("quiz");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [difficulty, setDifficulty] = useState("보통");
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const d = await api.generateMaterial({ type, subject, grade, difficulty, topic });
      navigate(`/app/materials/${d.item.id}`);
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
          <h1 className="page-title">학습자료 생성</h1>
          <p className="page-desc">유형·과목·학년·난이도와 주제를 입력하면 AI가 자료를 만듭니다.</p>
        </div>
      </div>

      <form className="panel gen-form" onSubmit={generate}>
        <label>
          자료 유형
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <div className="gen-row">
          <label>
            과목
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="예: 과학" />
          </label>
          <label>
            학년
            <select value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="">선택</option>
              <option>1학년</option>
              <option>2학년</option>
              <option>3학년</option>
            </select>
          </label>
          <label>
            난이도
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option>쉬움</option>
              <option>보통</option>
              <option>어려움</option>
            </select>
          </label>
        </div>
        <label>
          주제/단원
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="예: 2단원 세포의 구조와 기능"
          />
        </label>

        {error && <div className="error-banner">⚠️ {error}</div>}

        <div className="editor-actions">
          <button className="btn btn-primary" disabled={busy || topic.trim().length < 2}>
            {busy ? "생성 중… (20~40초)" : "✨ AI로 생성하기"}
          </button>
        </div>
      </form>

      {busy && (
        <div className="loading">
          <div className="spinner" />
          <p>AI가 자료를 만들고 있어요…</p>
        </div>
      )}
    </>
  );
}
