import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <main className="legal-page">
      <div className="legal-inner">
        <h1>개인정보 · 보안 안내</h1>
        <p className="legal-sub">
          학교 현장에서 안심하고 사용할 수 있도록, 데이터 처리와 보안 원칙을 안내합니다.
        </p>

        <section>
          <h2>1. 개인정보 보호</h2>
          <ul>
            <li>이름·연락처·주소·주민등록번호는 AI 분석 전에 <b>자동으로 가려집니다(마스킹)</b>.</li>
            <li>입력한 생기부 <b>원문은 서버 로그에 저장하지 않습니다</b>.</li>
            <li>그럼에도 이름·연락처 등은 가급적 지우고 입력하시길 권장합니다.</li>
          </ul>
        </section>

        <section>
          <h2>2. AI 처리</h2>
          <ul>
            <li>분석·생성에는 외부 AI(OpenAI/Anthropic) API를 사용하며, 처리를 위해 텍스트가 해외 서버로 전송될 수 있습니다.</li>
            <li>AI가 생성한 내용은 <b>참고용 초안</b>이며, <b>최종 검토·수정과 책임은 교사</b>에게 있습니다(교육부 생성형 AI 활용 지침에 부합).</li>
            <li>학생 식별정보는 마스킹 후 전송되며, 프롬프트에서도 무시하도록 지시합니다.</li>
          </ul>
        </section>

        <section>
          <h2>3. 보안 · 접근 통제</h2>
          <ul>
            <li>모든 데이터는 로그인 계정에 묶여 보관되며, 본인만 접근할 수 있습니다.</li>
            <li>로그인·생성·수정·삭제·AI 사용 등 주요 활동은 <b>감사 로그</b>로 기록·추적됩니다.</li>
            <li>비밀번호는 단방향 해시(PBKDF2)로 저장되며, 세션은 보안 쿠키로 관리됩니다.</li>
          </ul>
        </section>

        <section>
          <h2>4. 보관 · 파기</h2>
          <ul>
            <li>학생·생기부·자료·문서는 사용자가 삭제하면 즉시 제거됩니다.</li>
            <li>분석에 사용된 입력 원문은 별도로 보관하지 않습니다.</li>
          </ul>
        </section>

        <section>
          <h2>5. 문의</h2>
          <p>개인정보·보안 관련 문의는 운영 담당자에게 연락해 주세요.</p>
        </section>

        <p className="legal-foot">
          <Link to="/" className="link-more">← 홈으로</Link>
        </p>
      </div>
    </main>
  );
}
