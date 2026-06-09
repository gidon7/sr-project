import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

const NAV = [
  { to: "/app", label: "대시보드", icon: "🏠", end: true },
  { to: "/app/students", label: "학생 관리", icon: "👥", end: false },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);

  async function onLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className={"shell" + (sideOpen ? " side-open" : "")}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="cap">🎓</span>
          <span>생기부 AI</span>
        </div>
        <nav className="side-nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setSideOpen(false)}
              className={({ isActive }) => "side-item" + (isActive ? " active" : "")}
            >
              <span className="side-ic">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">교사용 AI 생기부 관리</div>
      </aside>

      <div className="main-col">
        <header className="topbar">
          <button className="hamburger" onClick={() => setSideOpen((o) => !o)} aria-label="메뉴">
            ☰
          </button>
          <div className="topbar-right">
            <button className="bell" title="알림">
              🔔
            </button>
            <div className="user-chip" onClick={() => setMenuOpen((o) => !o)}>
              <span className="avatar">{(user?.email?.[0] ?? "U").toUpperCase()}</span>
              <span className="user-meta">
                <b>{user?.email}</b>
                <small>관리자</small>
              </span>
              <span className="caret">▾</span>
              {menuOpen && (
                <div className="user-menu">
                  <button onClick={onLogout}>로그아웃</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>

      {sideOpen && <div className="side-backdrop" onClick={() => setSideOpen(false)} />}
    </div>
  );
}
