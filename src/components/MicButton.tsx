import { useRef, useState } from "react";

/* 브라우저 Web Speech API 기반 음성 입력 (한국어). 키 불필요. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = any;

export default function MicButton({ onText }: { onText: (t: string) => void }) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<AnyRec>(null);

  const w = typeof window !== "undefined" ? (window as unknown as Record<string, unknown>) : {};
  const SR = (w.SpeechRecognition || w.webkitSpeechRecognition) as
    | (new () => AnyRec)
    | undefined;
  if (!SR) return null;

  function toggle() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const r: AnyRec = new SR!();
    r.lang = "ko-KR";
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (e: AnyRec) => {
      const t = Array.from(e.results)
        .map((x: AnyRec) => x[0].transcript)
        .join(" ")
        .trim();
      if (t) onText(t);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start();
    recRef.current = r;
    setListening(true);
  }

  return (
    <button
      type="button"
      className={"btn btn-ghost btn-sm" + (listening ? " mic-on" : "")}
      onClick={toggle}
      title="음성으로 입력"
    >
      {listening ? "🎙 듣는 중…" : "🎤 음성"}
    </button>
  );
}
