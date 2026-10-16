import { runMigrations } from "@/lib/db/migrate";

let migrated = false;
let migrating: Promise<void> | null = null;

/**
 * Ensure migrations have been applied once per process.
 * Safe to call from API routes and server components.
 */
export async function ensureDbReady(): Promise<void> {
  if (migrated) return;
  if (!migrating) {
    migrating = runMigrations()
      .then(() => {
        migrated = true;
      })
      .catch((err) => {
        migrating = null;
        throw err;
      });
  }
  await migrating;
}
