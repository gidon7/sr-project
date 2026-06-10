-- 감사 로그 (누가 언제 무엇을)
-- 적용: wrangler d1 execute sr-project-db --remote -y --file=./migrations/0003_audit.sql
CREATE TABLE IF NOT EXISTS audit_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  action     TEXT NOT NULL,   -- login | create | update | delete | generate | analyze
  target     TEXT,            -- 리소스/테이블
  detail     TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id, id);
