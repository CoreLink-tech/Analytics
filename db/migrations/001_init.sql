-- Stage 6: initial schema for Analytics History Archive
-- SQLite / libsql / Cloudflare D1 compatible

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  domain TEXT,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS import_batches (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  source TEXT NOT NULL,
  original_file_name TEXT,
  status TEXT NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  accepted_rows INTEGER NOT NULL DEFAULT 0,
  rejected_rows INTEGER NOT NULL DEFAULT 0,
  duplicate_rows INTEGER NOT NULL DEFAULT 0,
  started_at TEXT,
  completed_at TEXT,
  error_summary TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analytics_records (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL,
  source TEXT NOT NULL,
  source_record_id TEXT,
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL,
  observation_date TEXT NOT NULL,
  period_end TEXT,
  dimension_name TEXT,
  dimension_value TEXT,
  page_path TEXT,
  import_batch_id TEXT,
  source_metadata TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (import_batch_id) REFERENCES import_batches(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);

CREATE INDEX IF NOT EXISTS idx_import_batches_project_id ON import_batches(project_id);
CREATE INDEX IF NOT EXISTS idx_import_batches_user_id ON import_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_import_batches_status ON import_batches(status);

CREATE INDEX IF NOT EXISTS idx_analytics_project_id ON analytics_records(project_id);
CREATE INDEX IF NOT EXISTS idx_analytics_observation_date ON analytics_records(observation_date);
CREATE INDEX IF NOT EXISTS idx_analytics_metric_name ON analytics_records(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_import_batch_id ON analytics_records(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_analytics_project_date_metric
  ON analytics_records(project_id, observation_date, metric_name);

CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY NOT NULL,
  applied_at TEXT NOT NULL
);
