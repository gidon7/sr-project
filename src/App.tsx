import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import type { JSX } from "react";
import "./App.css";
import { useAuth } from "./auth";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import AppLayout from "./components/AppLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentPage from "./pages/StudentPage";
import RecordPage from "./pages/RecordPage";
import ComingSoon from "./pages/ComingSoon";

// 공개 페이지용 크롬(상단 내비 + 푸터)
function PublicChrome() {
  return (
    <div className="site">
      <Nav />
      <Outlet />
      <Footer />
    </div>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading" style={{ padding: "5rem 0" }}>
        <div className="spinner" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicChrome />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<StudentPage />} />
        <Route path="records/:id" element={<RecordPage />} />

        {/* 수업 자료 (P2 예정) */}
        <Route
          path="materials/new"
          element={<ComingSoon title="학습자료 생성" desc="AI로 퀴즈·빈칸채우기·개념 비교표·요약을 생성합니다." phase="P2" />}
        />
        <Route
          path="materials"
          element={<ComingSoon title="내 자료함" desc="AI로 생성한 수업 자료를 관리합니다." phase="P2" />}
        />
        {/* 문서 작성 (P3 예정) */}
        <Route
          path="documents"
          element={<ComingSoon title="문서 작성" desc="위지윅 에디터로 문서를 작성하고 PDF·HWPX로 내보냅니다." phase="P3" />}
        />
        <Route
          path="templates"
          element={<ComingSoon title="문서 템플릿" desc="자주 쓰는 문서 템플릿을 관리합니다." phase="P3" />}
        />
        {/* 시스템 관리 (P4 예정) */}
        <Route path="teachers" element={<ComingSoon title="교사 관리" phase="P4" />} />
        <Route path="classes" element={<ComingSoon title="학급·반 관리" phase="P4" />} />
        <Route path="timetable" element={<ComingSoon title="시간표 관리" phase="P4" />} />
        <Route path="accounts" element={<ComingSoon title="계정·권한 관리" phase="P4" />} />
        <Route path="system" element={<ComingSoon title="시스템 현황" phase="P4" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
