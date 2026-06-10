import { useEffect, useState } from "react";
import { crud } from "../lib/api";

const SOURCES = [
  { key: "students", label: "학생", endpoint: "/api/students", icon: "👥" },
  { key: "materials", label: "수업 자료", endpoint: "/api/materials", icon: "💡" },
  { key: "documents", label: "문서", endpoint: "/api/documents", icon: "📝" },
  { key: "teachers", label: "교사", endpoint: "/api/teachers", icon: "🧑‍🏫" },
  { key: "classes", label: "학급", endpoint: "/api/classes", icon: "🏫" },
];

export default function SystemStatus() {
  const [counts, setCounts] = useState<Record<string, number | null>>({});

  useEffect(() => {
    SOURCES.forEach((s) => {
      crud
        .list(s.endpoint)
        .then((d) => setCounts((c) => ({ ...c, [s.key]: (d.items as unknown[]).length })))
        .catch(() => setCounts((c) => ({ ...c, [s.key]: null })));
    });
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">시스템 현황</h1>
          <p className="page-desc">데이터 등록 현황을 한눈에 봅니다.</p>
        </div>
      </div>

      <div className="stat-cards" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {SOURCES.map((s) => (
          <div className="stat-card" key={s.key}>
            <span className="stat-ic blue">{s.icon}</span>
            <div>
              <div className="stat-num">{counts[s.key] ?? "—"}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-head">
          <h2>데이터 분포</h2>
        </div>
        <div className="bar-chart">
          {(() => {
            const vals = SOURCES.map((s) => counts[s.key] ?? 0);
            const max = Math.max(1, ...vals);
            return SOURCES.map((s) => {
              const v = counts[s.key] ?? 0;
              return (
                <div className="bc-row" key={s.key}>
                  <span className="bc-label">
                    {s.icon} {s.label}
                  </span>
                  <div className="bc-track">
                    <div className="bc-fill" style={{ width: `${(v / max) * 100}%` }} />
                  </div>
                  <span className="bc-val">{v}</span>
                </div>
              );
            });
          })()}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>서비스 상태</h2>
        </div>
        <table className="data-table">
          <tbody>
            <tr>
              <td className="cell-muted" style={{ width: "30%" }}>
                플랫폼
              </td>
              <td>Cloudflare Pages + Functions + D1</td>
            </tr>
            <tr>
              <td className="cell-muted">AI 엔진</td>
              <td>Anthropic Claude</td>
            </tr>
            <tr>
              <td className="cell-muted">상태</td>
              <td>
                <span className="badge badge-green">정상</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
