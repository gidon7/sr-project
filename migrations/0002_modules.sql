-- P2~P4 모듈용 테이블 (Cloudflare D1)
-- 적용: wrangler d1 execute sr-project-db --remote --file=./migrations/0002_modules.sql

-- 수업 자료 (AI 학습자료)
CREATE TABLE IF NOT EXISTS materials (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  title      TEXT NOT NULL,
  type       TEXT NOT NULL,          -- quiz | fill_blank | compare | summary
  subject    TEXT,
  grade      TEXT,
  difficulty TEXT,                   -- 쉬움 | 보통 | 어려움
  topic      TEXT,
  content    TEXT NOT NULL DEFAULT '', -- 생성된 HTML
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_materials_user ON materials(user_id);

-- 문서 작성
CREATE TABLE IF NOT EXISTS documents (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL DEFAULT '', -- HTML
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);

-- 문서 템플릿
CREATE TABLE IF NOT EXISTS templates (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_templates_user ON templates(user_id);

-- 교사 관리
CREATE TABLE IF NOT EXISTS teachers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  name       TEXT NOT NULL,
  email      TEXT,
  role       TEXT,                   -- 교과교사 | 담임교사 | 보직교사 | 교무담당 | 관리자
  subject    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_teachers_user ON teachers(user_id);

-- 학급·반 관리
CREATE TABLE IF NOT EXISTS classes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  grade      TEXT,
  class_no   TEXT,
  homeroom   TEXT,
  note       TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_classes_user ON classes(user_id);

-- 시간표
CREATE TABLE IF NOT EXISTS timetable (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  class_name TEXT,
  day        TEXT,                   -- 월~금
  period     TEXT,                   -- 1~7교시
  subject    TEXT,
  teacher    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_timetable_user ON timetable(user_id);
