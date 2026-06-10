import { useEffect, useState } from "react";
import { crud } from "../lib/api";

export interface Column {
  key: string;
  label: string;
}
export interface Field {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "select";
  options?: string[];
}

type Row = Record<string, unknown> & { id: number };

export default function ResourcePage({
  title,
  desc,
  endpoint,
  columns,
  fields,
  addLabel = "추가",
}: {
  title: string;
  desc?: string;
  endpoint: string;
  columns: Column[];
  fields: Field[];
  addLabel?: string;
}) {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const d = await crud.list<Row>(endpoint);
      setItems(d.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      await crud.create(endpoint, form);
      setForm({});
      setShowAdd(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAdding(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("삭제할까요?")) return;
    await crud.remove(`${endpoint}/${id}`);
    await load();
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          {desc && <p className="page-desc">{desc}</p>}
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd((v) => !v)}>
          + {addLabel}
        </button>
      </div>

      {showAdd && (
        <form className="panel add-form" onSubmit={add}>
          <div className="add-row">
            {fields.map((f) =>
              f.type === "select" ? (
                <select
                  key={f.key}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                >
                  <option value="">{f.label}</option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  key={f.key}
                  placeholder={f.placeholder ?? f.label}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                />
              ),
            )}
            <button className="btn btn-primary" disabled={adding}>
              {adding ? "추가 중…" : "추가"}
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
        ) : items.length === 0 ? (
          <div className="empty">아직 등록된 항목이 없습니다.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  {columns.map((c) => (
                    <td key={c.key} className={c.key === columns[0].key ? "cell-strong" : ""}>
                      {String(row[c.key] ?? "—") || "—"}
                    </td>
                  ))}
                  <td>
                    <button className="icon-del" title="삭제" onClick={() => remove(row.id)}>
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
