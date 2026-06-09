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
  const [showAdd, setShowAdd] = useState(false);
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

  async function removeRecord(e: React.MouseEvent, rid: number, rTitle: string) {
    e.stopPropagation();
    if (!confirm(`'${rTitle}' 생기부를 삭제할까요?`)) return;
    await api.deleteRecord(rid);
    await load();
  }

  return (
    <>
      <Link to="/app/students" className="back-link">
        ← 학생 관리
      </Link>

      <div className="page-header">
        <div>
          <h1 className="page-title">{loading ? "…" : student?.name}</h1>
          <p className="page-desc">
            {student?.grade || "학년 미지정"}
            {student?.target_major ? ` · 희망 ${student.target_major}` : ""}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd((v) => !v)}>
          + 생기부 추가
        </button>
      </div>

      {showAdd && (
        <form className="panel add-form" onSubmit={addRecord}>
          <div className="add-row">
            <input
              placeholder="생기부 제목 (예: 2025 1학기)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <button className="btn btn-primary" disabled={adding}>
              {adding ? "생성 중…" : "만들기"}
            </button>
          </div>
        </form>
      )}

      {error && <div className="error-banner">⚠️ {error}</div>}

      <div className="panel">
        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : records.length === 0 ? (
          <div className="empty">아직 생기부가 없습니다. ‘생기부 추가’로 만든 뒤 내용을 입력하고 분석하세요.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>분석</th>
                <th>수정일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="row-click" onClick={() => navigate(`/app/records/${r.id}`)}>
                  <td className="cell-strong">{r.title}</td>
                  <td>
                    {r.analysis_count > 0 ? (
                      <span className="badge badge-green">분석 {r.analysis_count}회</span>
                    ) : (
                      <span className="badge badge-gray">분석 전</span>
                    )}
                  </td>
                  <td className="cell-muted">{r.updated_at?.slice(0, 10)}</td>
                  <td>
                    <button className="icon-del" title="삭제" onClick={(e) => removeRecord(e, r.id, r.title)}>
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
