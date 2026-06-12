import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-mark">생기부</span>
          <span className="brand-rest">AI</span>
        </div>
        <p className="footer-note">
          AI 생활기록부 분석 서비스 · 합격을 보장하지 않으며 진단·방향 제안을 제공합니다.
        </p>
        <p className="footer-links">
          <Link to="/privacy">개인정보 · 보안 안내</Link>
        </p>
        <p className="footer-copy">© 2026 sr-project. React + Cloudflare Workers + Anthropic Claude.</p>
      </div>
    </footer>
  );
}
