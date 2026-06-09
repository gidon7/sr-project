import type { AnalysisResult } from "../types";

function ScoreBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="bar">
      <div className="bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function Report({ data }: { data: AnalysisResult }) {
  return (
    <div className="report">
      <section className="summary-card">
        <div className="overall">
          <div className="overall-score">{data.overallScore}</div>
          <div className="overall-label">종합 경쟁력</div>
        </div>
        <p className="summary-text">{data.oneLineSummary}</p>
      </section>

      <section className="card">
        <h2>영역별 진단</h2>
        <div className="scores">
          {data.scores.map((s, i) => (
            <div className="score-row" key={i}>
              <div className="score-head">
                <span className="score-dim">{s.dimension}</span>
                <span className="score-num">{s.score}</span>
              </div>
              <ScoreBar value={s.score} />
              <p className="score-comment">{s.comment}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid-2">
        <section className="card">
          <h2>강점</h2>
          <ul className="list">
            {data.strengths.map((s, i) => (
              <li key={i}>
                <strong>{s.title}</strong>
                <p>{s.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>보완점</h2>
          <ul className="list">
            {data.improvements.map((s, i) => (
              <li key={i}>
                <strong>{s.title}</strong>
                <p>{s.detail}</p>
                <p className="action">→ {s.action}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card">
        <h2>추천 전공</h2>
        <div className="majors">
          {data.recommendedMajors.map((m, i) => (
            <div className="major" key={i}>
              <div className="major-head">
                <span className="major-name">{m.major}</span>
                <span className="major-fit">적합도 {m.fitScore}</span>
              </div>
              <ScoreBar value={m.fitScore} />
              <p>{m.reason}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>항목별 분석</h2>
        <div className="sections">
          {data.sectionAnalyses.map((s, i) => (
            <details className="section" key={i} open={i === 0}>
              <summary>{s.section}</summary>
              <p className="section-summary">{s.summary}</p>
              {s.keywords.length > 0 && (
                <div className="keywords">
                  {s.keywords.map((k, j) => (
                    <span className="chip" key={j}>
                      {k}
                    </span>
                  ))}
                </div>
              )}
              {s.strengths.length > 0 && (
                <>
                  <p className="mini-label">강점</p>
                  <ul className="mini-list">
                    {s.strengths.map((x, j) => (
                      <li key={j}>{x}</li>
                    ))}
                  </ul>
                </>
              )}
              {s.improvements.length > 0 && (
                <>
                  <p className="mini-label">보완점</p>
                  <ul className="mini-list">
                    {s.improvements.map((x, j) => (
                      <li key={j}>{x}</li>
                    ))}
                  </ul>
                </>
              )}
            </details>
          ))}
        </div>
      </section>

      <div className="grid-2">
        <section className="card">
          <h2>추천 탐구활동</h2>
          <ul className="list">
            {data.suggestedActivities.map((a, i) => (
              <li key={i}>
                <strong>{a.topic}</strong>
                <p>{a.rationale}</p>
                <p className="related">연계: {a.relatedMajor}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>예상 면접 질문</h2>
          <ol className="list qa">
            {data.interviewQuestions.map((q, i) => (
              <li key={i}>
                <strong>{q.question}</strong>
                <p className="intent">의도: {q.intent}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
