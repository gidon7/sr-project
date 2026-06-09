import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { RecordSummary, Student } from "../types";

export default function StudentPage() {
  const { id } = useParams();
  const studentId = Number(id);
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<RecordSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const d = await api.listRecords(studentId);
      setStudent(d.student);
      setRecords(d.records);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  async function addRecord(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      const d = await api.createRecord(studentId, { title: title || "새 생기부", content: "" });
      navigate(`/app/records/${d.record.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setAdding(false);
    }
  }

  async function removeRecord(rid: number, rTitle: string) {
    if (!confirm(`'${rTitle}' 생기부를 삭제할까요?`)) return;
    await api.deleteRecord(rid);
    await load();
  }

  return (
    <main className="app-page">
      <div className="app-inner">
        <Link to="/app" className="back-link">
          ← 학생 목록
        </Link>

        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : (
          <>
            <div className="page-head">
              <h1>{student?.name}</h1>
              <p>
                {student?.grade || "학년 미지정"}
                {student?.target_major ? ` · 희망 ${student.target_major}` : ""}
              </p>
            </div>

            {error && <div className="error-banner">⚠️ {error}</div>}

            <form className="panel add-form" onSubmit={addRecord}>
              <div className="add-row">
                <input
                  placeholder="새 생기부 제목 (예: 2025 1학기)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <button className="btn btn-primary" disabled={adding}>
                  {adding ? "생성 중…" : "생기부 추가"}
                </button>
              </div>
            </form>

            {records.length === 0 ? (
              <div className="empty">아직 생기부가 없습니다. 추가해서 내용을 입력하고 분석하세요.</div>
            ) : (
              <div className="record-list">
                {records.map((r) => (
                  <div className="record-row" key={r.id}>
                    <Link to={`/app/records/${r.id}`} className="record-link">
                      <span className="record-title">{r.title}</span>
                      <span className="record-meta">
                        {r.analysis_count > 0 ? `분석 ${r.analysis_count}회` : "분석 전"} ·{" "}
                        {r.updated_at?.slice(0, 10)}
                      </span>
                    </Link>
                    <button className="icon-del" title="삭제" onClick={() => removeRecord(r.id, r.title)}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
