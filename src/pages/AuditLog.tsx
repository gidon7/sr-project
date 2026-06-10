import { useEffect, useState } from "react";
import { crud } from "../lib/api";

interface AuditRow {
  id: number;
  action: string;
  target: string | null;
  detail: string | null;
  created_at: string;
}

const ACTION_LABEL: Record<string, string> = {
  login: "로그인",
  create: "생성",
  update: "수정",
  delete: "삭제",
  generate: "AI 생성",
  analyze: "AI 분석",
};
const TARGET_LABEL: Record<string, string> = {
  auth: "인증",
  students: "학생",
  records: "생기부",
  materials: "수업자료",
  documents: "문서",
  templates: "템플릿",
  teachers: "교사",
  classes: "학급",
  timetable: "시간표",
};
const ACTION_CLASS: Record<string, string> = {
  delete: "badge-gray",
  generate: "badge-green",
  analyze: "badge-green",
};

export default function AuditLog() {
  const [items, setItems] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    crud
      .list<AuditRow>("/api/audit")
      .then((d) => setItems(d.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">감사 로그</h1>
          <p className="page-desc">계정의 주요 활동 기록(최근 100건)입니다.</p>
        </div>
      </div>

      <div className="panel">
        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : items.length === 0 ? (
          <div className="empty">기록이 없습니다.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>시각</th>
                <th>작업</th>
                <th>대상</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td className="cell-muted">{a.created_at}</td>
                  <td>
                    <span className={"badge " + (ACTION_CLASS[a.action] ?? "badge-blue")}>
                      {ACTION_LABEL[a.action] ?? a.action}
                    </span>
                  </td>
                  <td>{a.target ? (TARGET_LABEL[a.target] ?? a.target) : "—"}</td>
                  <td className="cell-muted">{a.detail || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
