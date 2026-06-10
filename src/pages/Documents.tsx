import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { crud } from "../lib/api";
import type { DocumentItem } from "../types";

export default function Documents() {
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const d = await crud.list<DocumentItem>("/api/documents");
      setItems(d.items);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function create() {
    setCreating(true);
    try {
      const d = await crud.create<DocumentItem>("/api/documents", { title: "새 문서", content: "" });
      navigate(`/app/documents/${d.item.id}`);
    } finally {
      setCreating(false);
    }
  }

  async function remove(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    if (!confirm("이 문서를 삭제할까요?")) return;
    await crud.remove(`/api/documents/${id}`);
    await load();
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">문서 작성</h1>
          <p className="page-desc">문서를 작성하고 PDF로 내보냅니다.</p>
        </div>
        <button className="btn btn-primary" onClick={create} disabled={creating}>
          + 새 문서
        </button>
      </div>

      <div className="panel">
        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : items.length === 0 ? (
          <div className="empty">작성한 문서가 없습니다. ‘새 문서’로 시작하세요.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>수정일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id} className="row-click" onClick={() => navigate(`/app/documents/${d.id}`)}>
                  <td className="cell-strong">{d.title}</td>
                  <td className="cell-muted">{d.updated_at?.slice(0, 10)}</td>
                  <td>
                    <button className="icon-del" title="삭제" onClick={(e) => remove(e, d.id)}>
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
