import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

interface SubItem {
  to: string;
  label: string;
  soon?: boolean;
}
type MenuNode =
  | { type: "item"; to: string; label: string; icon: string; end?: boolean }
  | { type: "group"; label: string; icon: string; items: SubItem[] };

const MENU: MenuNode[] = [
  { type: "item", to: "/app", label: "대시보드", icon: "🏠", end: true },
  {
    type: "group",
    label: "생기부 분석",
    icon: "📊",
    items: [{ to: "/app/students", label: "학생 관리" }],
  },
  {
    type: "group",
    label: "수업 자료",
    icon: "💡",
    items: [
      { to: "/app/materials/new", label: "학습자료 생성" },
      { to: "/app/materials", label: "내 자료함" },
    ],
  },
  {
    type: "group",
    label: "문서 작성",
    icon: "📝",
    items: [
      { to: "/app/documents", label: "문서 작성" },
      { to: "/app/templates", label: "문서 템플릿" },
    ],
  },
  {
    type: "group",
    label: "시스템 관리",
    icon: "⚙️",
    items: [
      { to: "/app/teachers", label: "교사 관리" },
      { to: "/app/classes", label: "학급·반 관리" },
      { to: "/app/timetable", label: "시간표 관리" },
      { to: "/app/accounts", label: "계정·권한 관리" },
      { to: "/app/audit", label: "감사 로그" },
      { to: "/app/system", label: "시스템 현황" },
    ],
  },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);

  // 현재 경로가 포함된 그룹은 기본으로 펼침
  const initialOpen = useMemo(() => {
    const set: Record<string, boolean> = {};
    for (const node of MENU) {
      if (node.type === "group") {
        set[node.label] = node.items.some((i) => pathname.startsWith(i.to));
      }
    }
    // 첫 진입 시 주요 그룹은 열어둠
    set["생기부 분석"] = true;
    return set;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);

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
          {MENU.map((node) =>
            node.type === "item" ? (
              <NavLink
                key={node.to}
                to={node.to}
                end={node.end}
                onClick={() => setSideOpen(false)}
                className={({ isActive }) => "side-item" + (isActive ? " active" : "")}
              >
                <span className="side-ic">{node.icon}</span>
                {node.label}
              </NavLink>
            ) : (
              <div className="side-group" key={node.label}>
                <button
                  className="side-group-head"
                  onClick={() => setOpen((o) => ({ ...o, [node.label]: !o[node.label] }))}
                >
                  <span className="side-ic">{node.icon}</span>
                  <span className="side-group-label">{node.label}</span>
                  <span className={"side-caret" + (open[node.label] ? " up" : "")}>▾</span>
                </button>
                {open[node.label] && (
                  <div className="side-sub">
                    {node.items.map((it) => (
                      <NavLink
                        key={it.to}
                        to={it.to}
                        onClick={() => setSideOpen(false)}
                        className={({ isActive }) => "side-sub-item" + (isActive ? " active" : "")}
                      >
                        {it.label}
                        {it.soon && <span className="soon-badge">준비</span>}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}
        </nav>

        <div className="side-foot">교사용 AI 업무 지원</div>
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
