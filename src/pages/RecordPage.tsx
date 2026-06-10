import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { AnalysisResult, Student } from "../types";
import Report from "../components/Report";
import TextChecker from "../components/TextChecker";
import { LIMIT_PRESETS } from "../lib/saenggibuRules";
import { extractTextFromFile } from "../lib/fileText";

interface ScorePoint {
  id: number;
  score: number | null;
  created_at: string;
}

export default function RecordPage() {
  const { id } = useParams();
  const recordId = Number(id);

  const [student, setStudent] = useState<Student | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(1500);
  const [history, setHistory] = useState<ScorePoint[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function loadHistory() {
    api
      .recordAnalyses(recordId)
      .then((d) => setHistory(d.items))
      .catch(() => {});
  }

  useEffect(() => {
    api
      .getRecord(recordId)
      .then((d) => {
        setStudent(d.student);
        setTitle(d.record.title);
        setContent(d.record.content);
        setResult(d.analysis?.result ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    setError(null);
    try {
      const t = await extractTextFromFile(f);
      setContent((prev) => (prev.trim() ? prev + "\n" + t : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await api.updateRecord(recordId, { title, content });
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function analyze() {
    setAnalyzing(true);
    setError(null);
    try {
      await api.updateRecord(recordId, { title, content });
      const d = await api.analyzeRecord(recordId);
      setResult(d.result);
      loadHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <Link to={student ? `/app/students/${student.id}` : "/app/students"} className="back-link">
        ← {student?.name ?? "학생"}
      </Link>

      <div className="record-editor panel no-print">
        <div className="editor-top">
          <input
            className="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="생기부 제목"
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "불러오는 중…" : "📎 파일 불러오기"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.pdf"
            style={{ display: "none" }}
            onChange={onUpload}
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          placeholder="세특·창의적 체험활동·행동특성 등 생기부 내용을 입력하세요. 이름·연락처는 자동 마스킹됩니다."
        />
        <div className="checker-bar">
          <label>
            기재 기준
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              {LIMIT_PRESETS.map((p) => (
                <option key={p.label} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <span className="checker-note">※ byte는 UTF-8(한글 3byte) 기준 · NEIS 학년도별 기준은 확인하세요</span>
        </div>
        <TextChecker text={content} limit={limit} />

        <p className="privacy-note">🔒 이름·연락처·주소·주민번호는 분석 시 자동 마스킹됩니다.</p>
        <div className="editor-actions">
          {savedAt && <span className="saved-hint">저장됨 {savedAt}</span>}
          <button className="btn btn-ghost" onClick={save} disabled={saving}>
            {saving ? "저장 중…" : "저장"}
          </button>
          <button className="btn btn-primary" onClick={analyze} disabled={analyzing || content.trim().length < 30}>
            {analyzing ? "분석 중…" : result ? "다시 분석" : "AI 분석"}
          </button>
        </div>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      {analyzing && (
        <div className="loading">
          <div className="spinner" />
          <p>AI가 생기부를 읽고 있어요. 20~40초 정도 걸릴 수 있어요.</p>
        </div>
      )}

      {result && !analyzing && (
        <>
          <div className="report-toolbar no-print">
            <button className="btn btn-ghost" onClick={() => window.print()}>
              🖨 리포트 PDF
            </button>
          </div>
          <Report data={result} />
        </>
      )}

      {history.length >= 2 && (
        <div className="panel no-print">
          <div className="panel-head">
            <h2>분석 점수 추이</h2>
          </div>
          <div className="bar-chart">
            {history.map((h, i) => (
              <div className="bc-row" key={h.id}>
                <span className="bc-label">
                  {i + 1}회 · {h.created_at?.slice(5, 10)}
                </span>
                <div className="bc-track">
                  <div className="bc-fill" style={{ width: (h.score ?? 0) + "%" }} />
                </div>
                <span className="bc-val">{h.score ?? "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
