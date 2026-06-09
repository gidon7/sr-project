import { useState } from "react";
import "./App.css";
import { analyze } from "./api";
import type { AnalysisResult } from "./types";
import Report from "./components/Report";

const SAMPLE = `[교과세특] 화학Ⅰ: 산-염기 중화반응 실험에서 지시약에 따른 변색 차이에 의문을 갖고, 추가 자료를 조사해 보고서를 작성함. 일상 속 완충용액 사례를 발표함.
[동아리활동] 과학탐구반: 미세먼지 측정 키트를 제작하고 등하굣길 농도를 2주간 기록해 그래프로 시각화함.
[진로활동] 환경공학 진로 특강 후 '도시 대기질 개선'을 주제로 후속 탐구 계획서를 작성함.
[행동특성 및 종합의견] 호기심이 많고 끈기 있게 탐구하며, 조원의 의견을 경청하고 역할을 조율하는 모습이 돋보임.`;

export default function App() {
  const [recordText, setRecordText] = useState("");
  const [targetMajor, setTargetMajor] = useState("");
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await analyze({ recordText, targetMajor, grade });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>생기부 AI</h1>
        <p className="tagline">생활기록부를 붙여넣으면 AI가 강점·보완점·추천전공·면접질문을 진단합니다.</p>
      </header>

      <form className="input-card" onSubmit={onSubmit}>
        <div className="meta-row">
          <label>
            지원 희망 전공/계열 <span className="opt">(선택)</span>
            <input
              type="text"
              value={targetMajor}
              onChange={(e) => setTargetMajor(e.target.value)}
              placeholder="예: 환경공학과"
            />
          </label>
          <label>
            학년/계열 <span className="opt">(선택)</span>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="예: 고2 자연계"
            />
          </label>
        </div>

        <label className="textarea-label">
          생활기록부 내용
          <textarea
            value={recordText}
            onChange={(e) => setRecordText(e.target.value)}
            placeholder="세특·창의적 체험활동·행동특성 등을 붙여넣어 주세요. 이름·연락처는 지우고 입력하세요."
            rows={12}
          />
        </label>

        <p className="privacy-note">
          🔒 이름·연락처·주소·주민번호는 서버에서 자동 마스킹되며 분석에 사용되지 않습니다.
        </p>

        <div className="actions">
          <button
            type="button"
            className="ghost"
            onClick={() => setRecordText(SAMPLE)}
            disabled={loading}
          >
            예시 넣기
          </button>
          <button type="submit" className="primary" disabled={loading || recordText.trim().length < 30}>
            {loading ? "분석 중…" : "분석하기"}
          </button>
        </div>
      </form>

      {error && <div className="error-banner">⚠️ {error}</div>}

      {loading && (
        <div className="loading">
          <div className="spinner" />
          <p>AI가 생기부를 읽고 있어요. 20~40초 정도 걸릴 수 있어요.</p>
        </div>
      )}

      {result && <Report data={result} />}

      <footer className="app-footer">
        sr-project · React + Cloudflare Worker · Anthropic Claude
      </footer>
    </div>
  );
}
