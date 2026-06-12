import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { crud } from "../lib/api";
import { MATERIAL_TYPE_LABELS, type Material } from "../types";
import CopyButton from "../components/CopyButton";
import AiDraftNotice from "../components/AiDraftNotice";

export default function MaterialView() {
  const { id } = useParams();
  const [item, setItem] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    crud
      .get<Material>(`/api/materials/${id}`)
      .then((d) => setItem(d.item))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }
  if (error || !item) {
    return (
      <>
        <Link to="/app/materials" className="back-link">
          ← 내 자료함
        </Link>
        <div className="error-banner">⚠️ {error ?? "자료를 찾을 수 없습니다."}</div>
      </>
    );
  }

  return (
    <>
      <Link to="/app/materials" className="back-link">
        ← 내 자료함
      </Link>
      <div className="page-header">
        <div>
          <h1 className="page-title">{item.title}</h1>
          <p className="page-desc">
            <span className="badge badge-blue">{MATERIAL_TYPE_LABELS[item.type] ?? item.type}</span>{" "}
            {item.subject || ""} {item.grade || ""} {item.difficulty || ""}
          </p>
        </div>
        <div className="header-actions">
          <CopyButton text={item.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()} label="내용 복사" />
          <button className="btn btn-ghost" onClick={() => window.print()}>
            🖨 인쇄/PDF
          </button>
        </div>
      </div>

      <AiDraftNotice />
      <div className="panel doc-view" dangerouslySetInnerHTML={{ __html: item.content }} />
    </>
  );
}
