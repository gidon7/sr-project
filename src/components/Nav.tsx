import { Link, useLocation } from "react-router-dom";

export default function Nav() {
  const { pathname } = useLocation();
  const onLanding = pathname === "/";

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">생기부</span>
          <span className="brand-rest">AI</span>
        </Link>

        {onLanding && (
          <nav className="nav-links">
            <a href="#features">기능</a>
            <a href="#how">사용법</a>
            <a href="#faq">FAQ</a>
          </nav>
        )}

        <Link to="/analyze" className="btn btn-primary nav-cta">
          분석 시작
        </Link>
      </div>
    </header>
  );
}
