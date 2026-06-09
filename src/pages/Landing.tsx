import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

const FEATURES = [
  { icon: "👥", title: "학생별 관리", desc: "학생을 등록하고 학기별·버전별 생기부를 한곳에서 정리합니다." },
  { icon: "📊", title: "경쟁력 점수", desc: "학업역량·전공적합성·발전가능성·인성·탐구역량 5개 영역을 점수로 진단합니다." },
  { icon: "💪", title: "강점 · 보완점", desc: "생기부 근거에 기반한 강점과 다음 행동 제안을 제시합니다." },
  { icon: "🎓", title: "추천 전공", desc: "활동 기록에서 도출한 적합 전공과 이유를 적합도와 함께 알려줍니다." },
  { icon: "🔍", title: "항목별 분석", desc: "교과 세특·창의적 체험활동·행동특성·독서 등 항목별로 깊이 있게 분석합니다." },
  { icon: "🗣️", title: "면접 · 탐구 제안", desc: "예상 면접 질문과 후속 탐구활동 주제를 함께 제안합니다." },
];

const STEPS = [
  { n: "1", title: "학생 등록", desc: "학생을 추가하고 학년·희망 전공을 입력합니다." },
  { n: "2", title: "생기부 입력", desc: "세특·창체·행동특성 등을 붙여넣습니다. (이름·연락처 자동 마스킹)" },
  { n: "3", title: "AI 분석·보관", desc: "버튼 한 번으로 진단 리포트를 만들고, 학생별로 저장해 다시 봅니다." },
];

const FAQS = [
  { q: "여러 학생을 관리할 수 있나요?", a: "네. 학생을 등록하고 학생별로 여러 개의 생기부와 분석 결과를 저장·관리할 수 있습니다." },
  { q: "데이터는 어디에 저장되나요?", a: "로그인 계정에 묶여 클라우드(Cloudflare D1)에 안전하게 저장되며, 본인 계정만 접근할 수 있습니다." },
  { q: "개인정보는 안전한가요?", a: "이름·연락처·주소·주민번호는 분석 전에 자동 마스킹되며, 입력 원문은 서버 로그에 남기지 않습니다." },
  { q: "합격 여부를 알려주나요?", a: "합격/불합격을 단정하지 않습니다. 경쟁력 진단과 보완 방향, 탐구·면접 준비 제안을 제공합니다." },
];

export default function Landing() {
  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();
  const startTo = user ? "/app" : "/register";

  async function onDemo() {
    try {
      await demoLogin();
      navigate("/app");
    } catch {
      navigate("/login");
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">교사용 AI 생기부 관리</span>
            <h1>
              학생 생기부를 한곳에서
              <br />
              <span className="hl">관리하고 진단</span>합니다
            </h1>
            <p className="lead">
              학생별로 생기부를 정리하고, AI가 입학사정관 관점으로 강점·보완점·추천전공·면접질문까지
              리포트로 만들어 보관합니다.
            </p>
            <div className="hero-cta">
              <Link to={startTo} className="btn btn-primary btn-lg">
                {user ? "대시보드로 이동 →" : "무료로 시작하기 →"}
              </Link>
              {!user && (
                <button type="button" className="btn btn-demo btn-lg" onClick={onDemo}>
                  🧪 관리자 테스트 로그인
                </button>
              )}
            </div>
            <p className="hero-trust">🔒 개인정보 자동 마스킹 · 계정별 안전 보관</p>
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

      <section className="stats">
        <div className="stats-inner">
          <div className="stat">
            <strong>학생별</strong>
            <span>생기부 관리</span>
          </div>
          <div className="stat">
            <strong>5개</strong>
            <span>평가 영역 진단</span>
          </div>
          <div className="stat">
            <strong>~30초</strong>
            <span>리포트 생성</span>
          </div>
          <div className="stat">
            <strong>자동</strong>
            <span>개인정보 마스킹</span>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="section-inner">
          <h2 className="section-title">무엇을 할 수 있나요?</h2>
          <p className="section-sub">학생부종합전형 평가요소를 기준으로 생기부를 관리·진단합니다.</p>
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

      <section className="section section-soft" id="how">
        <div className="section-inner">
          <h2 className="section-title">사용법은 간단합니다</h2>
          <p className="section-sub">등록하고, 붙여넣고, 분석하세요.</p>
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

      <section className="cta-band">
        <div className="cta-inner">
          <h2>지금 학생 생기부 관리, AI와 함께 시작하세요</h2>
          <Link to={startTo} className="btn btn-primary btn-lg">
            {user ? "대시보드로 이동 →" : "무료로 시작하기 →"}
          </Link>
        </div>
      </section>
    </main>
  );
}
