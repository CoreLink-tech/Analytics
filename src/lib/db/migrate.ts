import fs from "fs";
import path from "path";
import { getDb, resetDbClient } from "@/lib/db/client";

/**
 * Apply SQL migration files from db/migrations in order.
 * Tracks applied migrations in schema_migrations.
 */
export async function runMigrations(): Promise<{ applied: string[] }> {
  // Ensure data directory exists for file: databases
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  resetDbClient();
  const db = getDb();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    )
  `);

  const migrationsDir = path.join(process.cwd(), "db", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const applied: string[] = [];

  for (const file of files) {
    const id = file;
    const existing = await db.execute({
      sql: "SELECT id FROM schema_migrations WHERE id = ?",
      args: [id],
    });
    if (existing.rows.length > 0) {
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    // Split on semicolons carefully — run whole file via batch when possible
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      // Skip pure comment blocks
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
      args: [id, new Date().toISOString()],
    });
    applied.push(id);
  }

  return { applied };
}
