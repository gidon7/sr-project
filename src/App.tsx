import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { useAuth } from "./auth";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StudentPage from "./pages/StudentPage";
import RecordPage from "./pages/RecordPage";
import type { JSX } from "react";

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
    <div className="site">
      <Nav />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/app/students/:id"
          element={
            <RequireAuth>
              <StudentPage />
            </RequireAuth>
          }
        />
        <Route
          path="/app/records/:id"
          element={
            <RequireAuth>
              <RecordPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}
