import type {
  AnalysisResult,
  RecordDetail,
  RecordSummary,
  StoredAnalysis,
  Student,
  User,
} from "../types";

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "content-type": "application/json" },
    ...options,
  });
  const data = (await res.json().catch(() => null)) as any;
  if (!res.ok) throw new Error(data?.error ?? `요청 실패 (HTTP ${res.status})`);
  return data as T;
}

export const api = {
  // auth
  me: () => req<{ user: User }>("/api/auth/me"),
  login: (email: string, password: string) =>
    req<{ user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string) =>
    req<{ user: User }>("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  demoLogin: () => req<{ user: User }>("/api/auth/demo", { method: "POST" }),
  logout: () => req<{ ok: true }>("/api/auth/logout", { method: "POST" }),

  // students
  listStudents: () => req<{ students: Student[] }>("/api/students"),
  createStudent: (s: { name: string; grade?: string; targetMajor?: string }) =>
    req<{ student: Student }>("/api/students", { method: "POST", body: JSON.stringify(s) }),
  updateStudent: (id: number, s: { name: string; grade?: string; targetMajor?: string }) =>
    req<{ student: Student }>(`/api/students/${id}`, { method: "PUT", body: JSON.stringify(s) }),
  deleteStudent: (id: number) => req<{ ok: true }>(`/api/students/${id}`, { method: "DELETE" }),

  // records
  listRecords: (studentId: number) =>
    req<{ student: Student; records: RecordSummary[] }>(`/api/students/${studentId}/records`),
  createRecord: (studentId: number, r: { title: string; content?: string }) =>
    req<{ record: RecordDetail }>(`/api/students/${studentId}/records`, {
      method: "POST",
      body: JSON.stringify(r),
    }),
  getRecord: (id: number) =>
    req<{ record: RecordDetail; student: Student; analysis: StoredAnalysis | null }>(
      `/api/records/${id}`,
    ),
  updateRecord: (id: number, r: { title: string; content: string }) =>
    req<{ record: RecordDetail }>(`/api/records/${id}`, { method: "PUT", body: JSON.stringify(r) }),
  deleteRecord: (id: number) => req<{ ok: true }>(`/api/records/${id}`, { method: "DELETE" }),
  analyzeRecord: (id: number) =>
    req<{ result: AnalysisResult }>(`/api/records/${id}/analyze`, { method: "POST" }),
};
