import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Student } from "../types";

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [targetMajor, setTargetMajor] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const d = await api.listStudents();
      setStudents(d.students);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      await api.createStudent({ name, grade, targetMajor });
      setName("");
      setGrade("");
      setTargetMajor("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAdding(false);
    }
  }

  async function removeStudent(id: number, sName: string) {
    if (!confirm(`'${sName}' 학생과 모든 생기부·분석을 삭제할까요?`)) return;
    await api.deleteStudent(id);
    await load();
  }

  return (
    <main className="app-page">
      <div className="app-inner">
        <div className="page-head">
          <h1>학생 관리</h1>
          <p>학생을 등록하고 생기부를 관리·분석하세요.</p>
        </div>

        <form className="panel add-form" onSubmit={addStudent}>
          <div className="add-row">
            <input placeholder="학생 이름 *" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="학년/계열 (선택)" value={grade} onChange={(e) => setGrade(e.target.value)} />
            <input
              placeholder="희망 전공 (선택)"
              value={targetMajor}
              onChange={(e) => setTargetMajor(e.target.value)}
            />
            <button className="btn btn-primary" disabled={adding || !name.trim()}>
              {adding ? "추가 중…" : "학생 추가"}
            </button>
          </div>
        </form>

        {error && <div className="error-banner">⚠️ {error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : students.length === 0 ? (
          <div className="empty">아직 등록된 학생이 없습니다. 위에서 학생을 추가해 보세요.</div>
        ) : (
          <div className="student-grid">
            {students.map((s) => (
              <div className="student-card" key={s.id}>
                <Link to={`/app/students/${s.id}`} className="student-link">
                  <div className="student-name">{s.name}</div>
                  <div className="student-meta">
                    {s.grade || "학년 미지정"}
                    {s.target_major ? ` · ${s.target_major}` : ""}
                  </div>
                  <div className="student-count">생기부 {s.record_count ?? 0}건</div>
                </Link>
                <button
                  className="icon-del"
                  title="삭제"
                  onClick={() => removeStudent(s.id, s.name)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
