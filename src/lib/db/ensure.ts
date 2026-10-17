import { getDb, isProductionDbRuntime } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";

let ready = false;
let preparing: Promise<void> | null = null;

/**
 * Ensure the database client is ready (foreign keys on).
 * In development (and when ALLOW_AUTO_MIGRATE=1), also applies migrations.
 * In production, migrations must be applied via `npm run db:migrate` in deploy.
 */
export async function ensureDbReady(): Promise<void> {
  if (ready) return;
  if (!preparing) {
    preparing = (async () => {
      // Always establish connection + FK pragma
      await getDb();

      const autoMigrate =
        !isProductionDbRuntime() || process.env.ALLOW_AUTO_MIGRATE === "1";

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
