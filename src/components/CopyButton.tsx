import { useState } from "react";

export default function CopyButton({ text, label = "복사" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 폴백: 임시 textarea
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* noop */
      }
      document.body.removeChild(ta);
    }
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }

  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>
      {done ? "✓ 복사됨" : `📋 ${label}`}
    </button>
  );
}
