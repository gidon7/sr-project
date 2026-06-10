import { useEffect, useRef } from "react";

/** execCommand 기반 경량 위지윅 에디터 (외부 의존성 없음). */
export default function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // 최초 마운트 시에만 초기 HTML 주입 (입력 중 커서 점프 방지)
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 외부에서 value가 통째로 바뀐 경우(예: 템플릿 적용) 반영
  useEffect(() => {
    if (ref.current && value !== ref.current.innerHTML) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  function exec(cmd: string, arg?: string) {
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  }

  return (
    <div className="rt">
      <div className="rt-toolbar">
        <button type="button" onClick={() => exec("bold")}>
          <b>B</b>
        </button>
        <button type="button" onClick={() => exec("italic")}>
          <i>I</i>
        </button>
        <button type="button" onClick={() => exec("underline")}>
          <u>U</u>
        </button>
        <span className="rt-sep" />
        <button type="button" onClick={() => exec("formatBlock", "<h2>")}>
          제목
        </button>
        <button type="button" onClick={() => exec("formatBlock", "<h3>")}>
          소제목
        </button>
        <button type="button" onClick={() => exec("formatBlock", "<p>")}>
          본문
        </button>
        <span className="rt-sep" />
        <button type="button" onClick={() => exec("insertUnorderedList")}>
          • 목록
        </button>
        <button type="button" onClick={() => exec("insertOrderedList")}>
          1. 목록
        </button>
      </div>
      <div
        ref={ref}
        className="rt-area doc-view"
        contentEditable
        suppressContentEditableWarning
        onInput={() => ref.current && onChange(ref.current.innerHTML)}
      />
    </div>
  );
}
