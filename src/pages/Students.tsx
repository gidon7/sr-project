import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { toCsv, downloadCsv, parseCsv } from "../lib/csv";
import type { Student } from "../types";

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [targetMajor, setTargetMajor] = useState("");
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [query, setQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  function exportCsv() {
    const csv = toCsv(
      ["이름", "학년", "희망전공"],
      students.map((s) => [s.name, s.grade ?? "", s.target_major ?? ""]),
    );
    downloadCsv("students.csv", csv);
  }

  async function importCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      const rows = parseCsv(await file.text());
      let start = 0;
      if (rows[0] && (rows[0][0] === "이름" || rows[0][0]?.trim() === "이름")) start = 1;
      let n = 0;
      for (let i = start; i < rows.length; i++) {
        const [name, grade, targetMajor] = rows[i];
        if (!name?.trim()) continue;
        await api.createStudent({ name: name.trim(), grade, targetMajor });
        n++;
      }
      alert(`${n}명 가져오기 완료`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

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
      setShowAdd(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAdding(false);
    }
  }

  async function removeStudent(e: React.MouseEvent, id: number, sName: string) {
    e.stopPropagation();
    if (!confirm(`'${sName}' 학생과 모든 생기부·분석을 삭제할까요?`)) return;
    await api.deleteStudent(id);
    await load();
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">학생 관리</h1>
          <p className="page-desc">학생을 등록하고 생기부를 관리·분석합니다.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" onClick={exportCsv} disabled={students.length === 0}>
            ⬇ CSV 내보내기
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
          >
            {importing ? "가져오는 중…" : "⬆ CSV 가져오기"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={importCsv}
          />
          <button className="btn btn-primary" onClick={() => setShowAdd((v) => !v)}>
            + 새 학생 만들기
          </button>
        </div>
      </div>

      {showAdd && (
        <form className="panel add-form" onSubmit={addStudent}>
          <div className="add-row">
            <input placeholder="학생 이름 *" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <input placeholder="학년/계열 (선택)" value={grade} onChange={(e) => setGrade(e.target.value)} />
            <input placeholder="희망 전공 (선택)" value={targetMajor} onChange={(e) => setTargetMajor(e.target.value)} />
            <button className="btn btn-primary" disabled={adding || !name.trim()}>
              {adding ? "추가 중…" : "추가"}
            </button>
          </div>
        </form>
      )}

      {error && <div className="error-banner">⚠️ {error}</div>}

      {students.length > 0 && (
        <div className="panel filter-bar">
          <label>
            검색
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이름·희망전공 검색..."
            />
          </label>
        </div>
      )}

      <div className="panel">
        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : students.length === 0 ? (
          <div className="empty">아직 등록된 학생이 없습니다. ‘새 학생 만들기’로 추가하세요.</div>
        ) : (() => {
          const filtered = students.filter(
            (s) => !query || s.name.includes(query) || (s.target_major ?? "").includes(query),
          );
          return filtered.length === 0 ? (
            <div className="empty">검색 결과가 없습니다.</div>
          ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>학년/계열</th>
                <th>희망 전공</th>
                <th>생기부</th>
                <th>생성일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="row-click" onClick={() => navigate(`/app/students/${s.id}`)}>
                  <td className="cell-strong">{s.name}</td>
                  <td>{s.grade || "—"}</td>
                  <td>{s.target_major || "—"}</td>
                  <td>
                    <span className="badge badge-blue">{s.record_count ?? 0}건</span>
                  </td>
                  <td className="cell-muted">{s.created_at?.slice(0, 10) ?? "—"}</td>
                  <td>
                    <button className="icon-del" title="삭제" onClick={(e) => removeStudent(e, s.id, s.name)}>
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          );
        })()}
      </div>
    </>
  );
}
