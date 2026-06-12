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
import Materials from "./pages/Materials";
import MaterialsNew from "./pages/MaterialsNew";
import MaterialView from "./pages/MaterialView";
import Documents from "./pages/Documents";
import DocumentEdit from "./pages/DocumentEdit";
import Templates from "./pages/Templates";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Timetable from "./pages/Timetable";
import Accounts from "./pages/Accounts";
import SystemStatus from "./pages/SystemStatus";
import AuditLog from "./pages/AuditLog";
import Help from "./pages/Help";
import Privacy from "./pages/Privacy";
import RefineTool from "./pages/RefineTool";
import RemarkTool from "./pages/RemarkTool";

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
        <Route path="/privacy" element={<Privacy />} />
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
        <Route path="help" element={<Help />} />
        <Route path="refine" element={<RefineTool />} />
        <Route path="remark" element={<RemarkTool />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<StudentPage />} />
        <Route path="records/:id" element={<RecordPage />} />

        {/* 수업 자료 */}
        <Route path="materials" element={<Materials />} />
        <Route path="materials/new" element={<MaterialsNew />} />
        <Route path="materials/:id" element={<MaterialView />} />
        {/* 문서 작성 */}
        <Route path="documents" element={<Documents />} />
        <Route path="documents/:id" element={<DocumentEdit />} />
        <Route path="templates" element={<Templates />} />
        {/* 시스템 관리 */}
        <Route path="teachers" element={<Teachers />} />
        <Route path="classes" element={<Classes />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="audit" element={<AuditLog />} />
        <Route path="system" element={<SystemStatus />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
