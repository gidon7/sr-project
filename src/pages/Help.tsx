import { Link } from "react-router-dom";

const STEPS = [
  { n: "1", t: "로그인", d: "이메일로 가입·로그인하거나, 체험용 ‘관리자 테스트 로그인’으로 바로 입장합니다." },
  { n: "2", t: "학생 등록", d: "‘생기부 분석 → 학생 관리’에서 학생을 추가합니다 (이름·학년·희망 전공)." },
  { n: "3", t: "생기부 입력", d: "학생을 열고 ‘생기부 추가’ 후 내용을 붙여넣거나 txt·PDF 파일을 불러옵니다." },
  { n: "4", t: "AI 분석", d: "‘AI 분석’을 누르면 강점·보완점·추천전공·면접질문 리포트가 생성됩니다." },
];

const SECTIONS: { icon: string; title: string; items: string[] }[] = [
  {
    icon: "📊",
    title: "생기부 분석",
    items: [
      "학생 관리에서 학생을 추가/수정/삭제하고, 명단을 CSV로 내보내거나 한 번에 가져올 수 있습니다.",
      "학생을 열고 생기부를 추가한 뒤 내용을 입력합니다. 📎 ‘파일 불러오기’로 txt·PDF에서 자동 추출됩니다.",
      "입력하면 실시간으로 글자수·byte와 ‘기재 주의 표현’(어학시험·대학명·교외수상 등)이 표시됩니다.",
      "‘AI 분석’ → 종합 경쟁력 점수·영역별 진단·강점·보완점·추천 전공·탐구활동·면접 질문 리포트가 나옵니다.",
      "리포트는 🖨 ‘리포트 PDF’로 저장하고, 같은 생기부를 여러 번 분석하면 점수 추이 그래프가 표시됩니다.",
    ],
  },
  {
    icon: "💡",
    title: "수업 자료",
    items: [
      "‘학습자료 생성’에서 유형(퀴즈·빈칸채우기·개념 비교표·요약)·과목·학년·난이도·주제를 입력합니다.",
      "‘AI로 생성하기’를 누르면 자료가 만들어지고 ‘내 자료함’에 저장됩니다.",
      "내 자료함에서 유형·과목으로 필터링하고, 자료를 열어 내용 확인·인쇄·PDF 저장할 수 있습니다.",
    ],
  },
  {
    icon: "📝",
    title: "문서 작성",
    items: [
      "‘새 문서’로 가정통신문·안내문 등을 작성합니다. 굵게·제목·목록 서식을 지원합니다.",
      "‘문서 템플릿’에 자주 쓰는 양식을 저장해 두고, 문서 작성 시 ‘템플릿 적용’으로 불러옵니다.",
      "🖨 ‘PDF 내보내기’로 완성된 문서를 PDF로 저장합니다.",
    ],
  },
  {
    icon: "⚙️",
    title: "시스템 관리",
    items: [
      "교사·학급·시간표를 등록·관리합니다.",
      "‘계정·권한 관리’에서 역할(교과교사·담임교사·보직교사·교무담당·관리자) 체계를 확인합니다.",
      "‘감사 로그’에서 로그인·생성·수정·삭제·AI 사용 기록을 추적합니다.",
      "‘시스템 현황’에서 데이터 등록 현황을 통계·그래프로 봅니다.",
    ],
  },
];

export default function Help() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">사용 안내</h1>
          <p className="page-desc">처음 오셨다면 4단계만 따라 하시면 됩니다.</p>
        </div>
      </div>

      <div className="steps" style={{ marginBottom: "1.2rem" }}>
        {STEPS.map((s) => (
          <div className="step" key={s.n}>
            <div className="step-n">{s.n}</div>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-head">
          <h2>기능별 사용법</h2>
        </div>
        <div className="faq">
          {SECTIONS.map((sec) => (
            <details className="faq-item" key={sec.title} open>
              <summary>
                {sec.icon} {sec.title}
              </summary>
              <ul className="mini-list" style={{ marginTop: "0.6rem" }}>
                {sec.items.map((it, i) => (
                  <li key={i} style={{ marginBottom: "0.3rem" }}>
                    {it}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>개인정보 · 안전</h2>
        </div>
        <ul className="mini-list">
          <li>이름·연락처·주소·주민번호는 AI 분석 전에 자동으로 가려집니다(마스킹).</li>
          <li>입력 원문은 서버 로그에 남기지 않습니다.</li>
          <li>모든 주요 활동은 감사 로그에 기록되어 추적할 수 있습니다.</li>
          <li>그래도 이름·연락처는 가급적 지우고 입력하시길 권장합니다.</li>
        </ul>
        <p className="page-desc" style={{ marginTop: "1rem" }}>
          바로 시작하려면 <Link to="/app/students" className="link-more">학생 관리</Link> 로 이동하세요.
        </p>
      </div>
    </>
  );
}
