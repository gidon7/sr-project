import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function Nav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const onLanding = pathname === "/";

  async function onLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to={user ? "/app" : "/"} className="brand">
          <span className="brand-mark">생기부</span>
          <span className="brand-rest">관리 AI</span>
        </Link>

        {onLanding && !user && (
          <nav className="nav-links">
            <a href="#features">기능</a>
            <a href="#how">사용법</a>
            <a href="#faq">FAQ</a>
          </nav>
        )}

        <div className="nav-right">
          {user ? (
            <>
              <Link to="/app" className="nav-link-plain">
                대시보드
              </Link>
              <span className="nav-email">{user.email}</span>
              <button className="btn btn-ghost btn-sm" onClick={onLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link-plain">
                로그인
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                시작하기
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
