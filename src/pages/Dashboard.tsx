import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { Student } from "../types";

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .listStudents()
      .then((d) => setStudents(d.students))
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = students.length;
  const totalRecords = students.reduce((s, x) => s + (x.record_count ?? 0), 0);
  const recent = students.slice(0, 6);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">대시보드</h1>
          <p className="page-desc">학생 생기부 현황을 한눈에 봅니다.</p>
        </div>
        <Link to="/app/students" className="btn btn-primary">
          학생 관리 →
        </Link>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-ic blue">👥</span>
          <div>
            <div className="stat-num">{loading ? "—" : totalStudents}</div>
            <div className="stat-label">등록 학생</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ic green">📄</span>
          <div>
            <div className="stat-num">{loading ? "—" : totalRecords}</div>
            <div className="stat-label">총 생기부</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-ic violet">🤖</span>
          <div>
            <div className="stat-num">AI</div>
            <div className="stat-label">Claude 분석</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>최근 학생</h2>
          <Link to="/app/students" className="link-more">
            전체 보기
          </Link>
        </div>
        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : recent.length === 0 ? (
          <div className="empty">아직 등록된 학생이 없습니다. ‘학생 관리’에서 추가하세요.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>학년/계열</th>
                <th>희망 전공</th>
                <th>생기부</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((s) => (
                <tr key={s.id} className="row-click" onClick={() => navigate(`/app/students/${s.id}`)}>
                  <td className="cell-strong">{s.name}</td>
                  <td>{s.grade || "—"}</td>
                  <td>{s.target_major || "—"}</td>
                  <td>
                    <span className="badge badge-blue">{s.record_count ?? 0}건</span>
                  </td>
                  <td className="cell-right">›</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
