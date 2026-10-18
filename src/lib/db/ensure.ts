import { getDatabaseUrl, getDb, isProductionDbRuntime } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";

let ready = false;
let preparing: Promise<void> | null = null;

/**
 * Ensure the database client is ready (foreign keys on) and schema applied.
 *
 * Auto-migrate when:
 * - not production, or
 * - ALLOW_AUTO_MIGRATE=1, or
 * - a remote DATABASE_URL is set (typical Vercel + Turso setup)
 *
 * Local file DB in production is still refused by getDatabaseUrl().
 */
export async function ensureDbReady(): Promise<void> {
  if (ready) return;
  if (!preparing) {
    preparing = (async () => {
      await getDb();

      let url = "";
      try {
        url = getDatabaseUrl();
      } catch {
        url = "";
      }

      const hasRemoteDb = Boolean(
        process.env.DATABASE_URL?.trim() && !url.startsWith("file:")
      );

      const autoMigrate =
        !isProductionDbRuntime() ||
        process.env.ALLOW_AUTO_MIGRATE === "1" ||
        hasRemoteDb;

      if (autoMigrate) {
        await runMigrations();
      }

      ready = true;
    })().catch((err) => {
      preparing = null;
      throw err;
    });
  }
  await preparing;
}
