import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function Login() {
  const { user, login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      navigate("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function onDemo() {
    setError(null);
    setBusy(true);
    try {
      await demoLogin();
      navigate("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>로그인</h1>
        <p className="auth-sub">교사용 생기부 관리 대시보드</p>

        <button type="button" className="btn btn-demo" onClick={onDemo} disabled={busy}>
          🧪 관리자 테스트 로그인 (바로 체험)
        </button>
        <div className="divider"><span>또는 이메일로 로그인</span></div>

        {error && <div className="error-banner">⚠️ {error}</div>}
        <label>
          이메일
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          비밀번호
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "처리 중…" : "로그인"}
        </button>
        <p className="auth-foot">
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </p>
      </form>
    </main>
  );
}
