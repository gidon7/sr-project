import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { crud } from "../lib/api";
import { MATERIAL_TYPE_LABELS, type Material } from "../types";

export default function Materials() {
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [subjectQuery, setSubjectQuery] = useState("");
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const d = await crud.list<Material>("/api/materials");
      setItems(d.items);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      items.filter(
        (m) =>
          (!typeFilter || m.type === typeFilter) &&
          (!subjectQuery || (m.subject ?? "").includes(subjectQuery)),
      ),
    [items, typeFilter, subjectQuery],
  );

  async function remove(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    if (!confirm("이 자료를 삭제할까요?")) return;
    await crud.remove(`/api/materials/${id}`);
    await load();
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">내 자료함</h1>
          <p className="page-desc">AI로 생성한 수업 자료를 관리합니다.</p>
        </div>
        <Link to="/app/materials/new" className="btn btn-primary">
          + 새 자료 만들기
        </Link>
      </div>

      <div className="panel filter-bar">
        <label>
          자료 유형
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">전체</option>
            {Object.entries(MATERIAL_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label>
          과목
          <input
            value={subjectQuery}
            onChange={(e) => setSubjectQuery(e.target.value)}
            placeholder="과목 검색..."
          />
        </label>
      </div>

      <div className="panel">
        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">자료가 없습니다. ‘새 자료 만들기’로 AI 자료를 생성해 보세요.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>유형</th>
                <th>과목</th>
                <th>학년</th>
                <th>난이도</th>
                <th>생성일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="row-click" onClick={() => navigate(`/app/materials/${m.id}`)}>
                  <td className="cell-strong">{m.title}</td>
                  <td>
                    <span className="badge badge-blue">{MATERIAL_TYPE_LABELS[m.type] ?? m.type}</span>
                  </td>
                  <td>{m.subject || "—"}</td>
                  <td>{m.grade || "—"}</td>
                  <td>{m.difficulty || "—"}</td>
                  <td className="cell-muted">{m.created_at?.slice(0, 10)}</td>
                  <td>
                    <button className="icon-del" title="삭제" onClick={(e) => remove(e, m.id)}>
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
