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
  recordAnalyses: (id: number) =>
    req<{ items: { id: number; score: number | null; created_at: string }[] }>(
      `/api/records/${id}/analyses`,
    ),

  // 생기부 윤문(다듬기)
  refine: (text: string, maxBytes?: number) =>
    req<{ refined: string }>("/api/refine", {
      method: "POST",
      body: JSON.stringify({ text, maxBytes }),
    }),

  // 세특/행특/창체/진로 문구 생성
  generateRemark: (body: { type: string; subject?: string; keywords: string; maxBytes?: number }) =>
    req<{ text: string }>("/api/remark", { method: "POST", body: JSON.stringify(body) }),

  // 행정 문서 AI 초안
  draftDoc: (docType: string, content: string) =>
    req<{ html: string }>("/api/doc-draft", {
      method: "POST",
      body: JSON.stringify({ docType, content }),
    }),

  // 수업 자료 AI 생성 (키 필요)
  generateMaterial: (body: {
    type: string;
    subject?: string;
    grade?: string;
    difficulty?: string;
    topic: string;
  }) => req<{ item: import("../types").Material }>("/api/materials/generate", {
    method: "POST",
    body: JSON.stringify(body),
  }),
};

// 공용 CRUD (materials/documents/templates/teachers/classes/timetable)
export const crud = {
  list: <T,>(path: string) => req<{ items: T[] }>(path),
  get: <T,>(path: string) => req<{ item: T }>(path),
  create: <T,>(path: string, body: unknown) =>
    req<{ item: T }>(path, { method: "POST", body: JSON.stringify(body) }),
  update: <T,>(path: string, body: unknown) =>
    req<{ item: T }>(path, { method: "PUT", body: JSON.stringify(body) }),
  remove: (path: string) => req<{ ok: true }>(path, { method: "DELETE" }),
};
