-- Project API keys for remote ingest from customer websites

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS project_api_keys (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default',
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_used_at TEXT,
  revoked_at TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_api_keys_project_id ON project_api_keys(project_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON project_api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON project_api_keys(user_id);
