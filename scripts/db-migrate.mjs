/**
 * CLI: node scripts/db-migrate.mjs
 * Applies db/migrations/*.sql via libsql.
 */
import fs from "fs";
import path from "path";
import { createClient } from "@libsql/client";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const dataDir = path.join(root, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const url =
  process.env.DATABASE_URL?.trim() ||
  `file:${path.join(dataDir, "aha.db")}`;
const authToken = process.env.DATABASE_AUTH_TOKEN;

const db = createClient(authToken ? { url, authToken } : { url });
await db.execute("PRAGMA foreign_keys = ON");

await db.execute(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id TEXT PRIMARY KEY NOT NULL,
    applied_at TEXT NOT NULL
  )
`);

const migrationsDir = path.join(root, "db", "migrations");
const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const applied = [];

for (const file of files) {
  const existing = await db.execute({
    sql: "SELECT id FROM schema_migrations WHERE id = ?",
    args: [file],
  });
  if (existing.rows.length > 0) {
    console.log(`skip  ${file}`);
    continue;
  }

  const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    const withoutComments = statement
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .trim();
    if (!withoutComments) continue;
    await db.execute(withoutComments);
  }

  await db.execute({
    sql: "INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)",
    args: [file, new Date().toISOString()],
  });
  applied.push(file);
  console.log(`apply ${file}`);
}

console.log(
  applied.length
    ? `Done. Applied: ${applied.join(", ")}`
    : "Done. No new migrations."
);
