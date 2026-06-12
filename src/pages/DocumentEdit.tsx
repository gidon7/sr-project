import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, crud } from "../lib/api";
import type { DocumentItem, TemplateItem } from "../types";
import RichEditor from "../components/RichEditor";
import MicButton from "../components/MicButton";
import { downloadWord } from "../lib/wordExport";

export default function DocumentEdit() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAi, setShowAi] = useState(false);
  const [docType, setDocType] = useState("가정통신문");
  const [aiContent, setAiContent] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

  async function aiDraft() {
    setAiBusy(true);
    setError(null);
    try {
      const d = await api.draftDoc(docType, aiContent);
      setContent(d.html);
      if (!title.trim() || title === "새 문서") setTitle(docType);
      setShowAi(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAiBusy(false);
    }
  }

  useEffect(() => {
    crud
      .get<DocumentItem>(`/api/documents/${id}`)
      .then((d) => {
        setTitle(d.item.title);
        setContent(d.item.content);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
    crud.list<TemplateItem>("/api/templates").then((d) => setTemplates(d.items)).catch(() => {});
  }, [id]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await crud.update(`/api/documents/${id}`, { title, content });
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <Link to="/app/documents" className="back-link">
        ← 문서 작성
      </Link>

      <div className="panel record-editor">
        <input
          className="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="문서 제목"
        />

        {templates.length > 0 && (
          <select
            className="tpl-select"
            defaultValue=""
            onChange={(e) => {
              const t = templates.find((x) => String(x.id) === e.target.value);
              if (t) setContent(t.content);
              e.target.value = "";
            }}
          >
            <option value="">템플릿 적용…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        )}

        <div className="ai-draft-bar">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAi((v) => !v)}>
            ✨ AI로 초안 생성
          </button>
        </div>
        {showAi && (
          <div className="ai-draft-form">
            <div className="add-row">
              <input
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                placeholder="문서 종류 (예: 가정통신문, 안내문, 회의록)"
              />
              <MicButton onText={(t) => setAiContent((p) => (p ? p + " " + t : t))} />
            </div>
            <textarea
              rows={3}
              value={aiContent}
              onChange={(e) => setAiContent(e.target.value)}
              placeholder="핵심 내용을 적어주세요. 예: 5월 20일 국립과학관 현장체험학습, 도시락·필기구 준비, 우천 시 연기"
            />
            <div className="editor-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={aiDraft}
                disabled={aiBusy || aiContent.trim().length < 4}
              >
                {aiBusy ? "생성 중…" : "초안 만들기"}
              </button>
            </div>
          </div>
        )}

        <RichEditor value={content} onChange={setContent} />

        {error && <div className="error-banner">⚠️ {error}</div>}

        <div className="editor-actions">
          {savedAt && <span className="saved-hint">저장됨 {savedAt}</span>}
          <button
            className="btn btn-ghost"
            onClick={() => downloadWord(title || "문서", content, title)}
          >
            ⬇ Word
          </button>
          <button className="btn btn-ghost" onClick={() => window.print()}>
            🖨 PDF
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>
    </>
  );
}
