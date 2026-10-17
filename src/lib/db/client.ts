import { createClient, type Client } from "@libsql/client";
import path from "path";

/**
 * Database client for Analytics History Archive.
 *
 * - Local/dev default: file-based libsql SQLite under ./data/aha.db
 * - Production: DATABASE_URL is required (Turso/libsql or compatible remote)
 * - Foreign keys are enabled on every app connection
 */

let client: Client | null = null;
let foreignKeysEnabled = false;

function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.CF_PAGES === "1"
  );
}

export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim()) {
    return process.env.DATABASE_URL.trim();
  }

  if (isProductionRuntime()) {
    throw new Error(
      "DATABASE_URL is required in production. " +
        "A local file database is not durable on serverless hosts (e.g. Vercel). " +
        "Set DATABASE_URL to a remote libsql/Turso URL (and DATABASE_AUTH_TOKEN if needed)."
    );
  }

  const filePath = path.join(process.cwd(), "data", "aha.db");
  return `file:${filePath}`;
}

/**
 * Returns the shared DB client with foreign keys enabled.
 * Prefer calling ensureDbReady() first so migrations run in development.
 */
export async function getDb(): Promise<Client> {
  if (!client) {
    const url = getDatabaseUrl();
    const authToken = process.env.DATABASE_AUTH_TOKEN;
    client = createClient(authToken ? { url, authToken } : { url });
    foreignKeysEnabled = false;
  }

  if (!foreignKeysEnabled) {
    await client.execute("PRAGMA foreign_keys = ON");
    foreignKeysEnabled = true;
  }

  return client;
}

/** Reset singleton (tests / after migrate in same process). */
export function resetDbClient(): void {
  client = null;
  foreignKeysEnabled = false;
}

export function isProductionDbRuntime(): boolean {
  return isProductionRuntime();
}
