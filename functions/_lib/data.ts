import type { Env } from "./types";

export interface StudentRow {
  id: number;
  user_id: number;
  name: string;
  grade: string | null;
  target_major: string | null;
  created_at: string;
}

export interface RecordRow {
  id: number;
  student_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/** 해당 user가 소유한 학생만 반환(아니면 null). */
export async function getOwnedStudent(env: Env, userId: number, studentId: number) {
  return env.DB.prepare("SELECT * FROM students WHERE id = ? AND user_id = ?")
    .bind(studentId, userId)
    .first<StudentRow>();
}

/** 해당 user가 소유한 학생의 기록만 반환(아니면 null). */
export async function getOwnedRecord(env: Env, userId: number, recordId: number) {
  return env.DB.prepare(
    `SELECT r.* FROM records r
       JOIN students s ON s.id = r.student_id
      WHERE r.id = ? AND s.user_id = ?`,
  )
    .bind(recordId, userId)
    .first<RecordRow>();
}

export function paramId(value: string | string[] | undefined): number {
  const v = Array.isArray(value) ? value[0] : value;
  return Number(v);
}
