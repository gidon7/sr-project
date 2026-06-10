import { useEffect, useState } from "react";
import { crud } from "../lib/api";
import type { TemplateItem } from "../types";

export default function Templates() {
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const d = await crud.list<TemplateItem>("/api/templates");
      setItems(d.items);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function reset() {
    setEditId(null);
    setTitle("");
    setContent("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (editId) await crud.update(`/api/templates/${editId}`, { title, content });
      else await crud.create("/api/templates", { title, content });
      reset();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  function edit(t: TemplateItem) {
    setEditId(t.id);
    setTitle(t.title);
    setContent(t.content);
  }

  async function remove(id: number) {
    if (!confirm("이 템플릿을 삭제할까요?")) return;
    if (editId === id) reset();
    await crud.remove(`/api/templates/${id}`);
    await load();
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">문서 템플릿</h1>
          <p className="page-desc">자주 쓰는 문서 양식을 저장해 문서 작성 시 불러옵니다.</p>
        </div>
      </div>

      <form className="panel tpl-form" onSubmit={save}>
        <input
          className="title-input"
          placeholder="템플릿 제목 *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          rows={8}
          placeholder="템플릿 내용 (HTML 가능). 예: <h2>가정통신문</h2><p>...</p>"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {error && <div className="error-banner">⚠️ {error}</div>}
        <div className="editor-actions">
          {editId && (
            <button type="button" className="btn btn-ghost" onClick={reset}>
              취소
            </button>
          )}
          <button className="btn btn-primary" disabled={saving || !title.trim()}>
            {saving ? "저장 중…" : editId ? "수정 저장" : "템플릿 추가"}
          </button>
        </div>
      </form>

      <div className="panel">
        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : items.length === 0 ? (
          <div className="empty">저장된 템플릿이 없습니다.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>생성일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td className="cell-strong">{t.title}</td>
                  <td className="cell-muted">{t.created_at?.slice(0, 10)}</td>
                  <td className="cell-actions">
                    <button className="mini-btn" onClick={() => edit(t)}>
                      편집
                    </button>
                    <button className="icon-del" title="삭제" onClick={() => remove(t.id)}>
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
