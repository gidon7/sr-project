import { Link } from "react-router-dom";

const FEATURES = [
  { icon: "📊", title: "경쟁력 점수", desc: "학업역량·전공적합성·발전가능성·인성·탐구역량 5개 영역을 점수로 진단합니다." },
  { icon: "💪", title: "강점 · 보완점", desc: "생기부 근거에 기반한 강점과, 다음에 무엇을 하면 좋을지 실행 제안을 제시합니다." },
  { icon: "🎓", title: "추천 전공", desc: "활동 기록에서 도출한 적합 전공과 그 이유를 적합도와 함께 알려줍니다." },
  { icon: "🔍", title: "항목별 분석", desc: "교과 세특·창의적 체험활동·행동특성·독서 등 항목별로 깊이 있게 분석합니다." },
  { icon: "🧪", title: "후속 탐구활동", desc: "지금 활동에서 한 걸음 더 나아갈 수 있는 탐구 주제를 제안합니다." },
  { icon: "🗣️", title: "예상 면접질문", desc: "생기부 기반 면접 질문과 출제 의도를 미리 준비할 수 있습니다." },
];

const STEPS = [
  { n: "1", title: "붙여넣기", desc: "세특·창체·행동특성 등 생기부 내용을 입력합니다. (이름·연락처는 자동 마스킹)" },
  { n: "2", title: "AI 분석", desc: "입학사정관 관점으로 학습된 AI가 평가요소 기준으로 진단합니다." },
  { n: "3", title: "리포트 확인", desc: "강점·보완점·추천전공·면접질문까지 한눈에 보는 리포트를 받습니다." },
];

const FAQS = [
  { q: "분석에 얼마나 걸리나요?", a: "보통 20~40초 내에 리포트가 생성됩니다. 입력 분량에 따라 조금 달라질 수 있어요." },
  { q: "개인정보는 안전한가요?", a: "이름·연락처·주소·주민번호는 분석 전에 자동 마스킹되며, 입력 원문은 서버 로그에 남기지 않습니다." },
  { q: "합격 여부를 알려주나요?", a: "합격/불합격을 단정하지 않습니다. 경쟁력 진단과 보완 방향, 탐구·면접 준비 제안까지 제공합니다." },
  { q: "어떤 내용을 넣어야 하나요?", a: "교과 세부능력 및 특기사항(세특), 창의적 체험활동, 행동특성 및 종합의견, 독서 등 가지고 있는 항목을 붙여넣으면 됩니다." },
];

export default function Landing() {
  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">AI 생활기록부 분석</span>
            <h1>
              AI가 당신의 생기부를
              <br />
              <span className="hl">입학사정관처럼</span> 진단합니다
            </h1>
            <p className="lead">
              생기부를 붙여넣으면 강점·보완점·추천전공·항목별 분석·후속 탐구활동·예상 면접질문을
              30초 만에 리포트로 받아보세요.
            </p>
            <div className="hero-cta">
              <Link to="/analyze" className="btn btn-primary btn-lg">
                생기부 분석 시작 →
              </Link>
              <a href="#how" className="btn btn-ghost btn-lg">
                사용법 보기
              </a>
            </div>
            <p className="hero-trust">🔒 개인정보 자동 마스킹 · 원문 미저장</p>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="mock-card">
              <div className="mock-row">
                <span className="mock-score">87</span>
                <span className="mock-label">종합 경쟁력</span>
              </div>
              {[
                ["학업역량", 88],
                ["전공적합성", 91],
                ["발전가능성", 82],
                ["탐구역량", 90],
              ].map(([k, v]) => (
                <div className="mock-bar-row" key={k as string}>
                  <span>{k}</span>
                  <div className="mock-bar">
                    <div className="mock-bar-fill" style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
              <div className="mock-chips">
                <span>환경공학과</span>
                <span>화학공학과</span>
                <span>탐구 주제 제안</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="stats-inner">
          <div className="stat">
            <strong>5개</strong>
            <span>평가 영역 진단</span>
          </div>
          <div className="stat">
            <strong>~30초</strong>
            <span>리포트 생성</span>
          </div>
          <div className="stat">
            <strong>7가지</strong>
            <span>분석 리포트 항목</span>
          </div>
          <div className="stat">
            <strong>자동</strong>
            <span>개인정보 마스킹</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="section-inner">
          <h2 className="section-title">무엇을 분석하나요?</h2>
          <p className="section-sub">학생부종합전형 평가요소를 기준으로 생기부를 다각도로 진단합니다.</p>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section section-soft" id="how">
        <div className="section-inner">
          <h2 className="section-title">사용법은 간단합니다</h2>
          <p className="section-sub">붙여넣고 버튼만 누르면 끝.</p>
          <div className="steps">
            {STEPS.map((s) => (
              <div className="step" key={s.n}>
                <div className="step-n">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="section-inner narrow">
          <h2 className="section-title">자주 묻는 질문</h2>
          <div className="faq">
            {FAQS.map((f, i) => (
              <details className="faq-item" key={i}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="cta-band">
        <div className="cta-inner">
          <h2>지금 내 생기부, 어디까지 왔는지 확인해 보세요</h2>
          <Link to="/analyze" className="btn btn-primary btn-lg">
            무료로 분석 시작 →
          </Link>
        </div>
      </section>
    </main>
  );
}
