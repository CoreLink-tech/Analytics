import { createClient, type Client } from "@libsql/client";
import path from "path";

/**
 * Database client for Analytics History Archive.
 *
 * - Local/default: file-based libsql SQLite under ./data/aha.db
 * - Production: set DATABASE_URL to a Turso/libsql URL (or compatible)
 * - Cloudflare D1 uses the same SQL dialect; a D1 binding adapter can
 *   replace this client in a later deployment without changing schema.
 */

let client: Client | null = null;

export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim()) {
    return process.env.DATABASE_URL.trim();
  }
  // Default local file database (Node runtime)
  const filePath = path.join(process.cwd(), "data", "aha.db");
  return `file:${filePath}`;
}

export function getDb(): Client {
  if (!client) {
    const url = getDatabaseUrl();
    const authToken = process.env.DATABASE_AUTH_TOKEN;
    client = createClient(
      authToken ? { url, authToken } : { url }
    );
  }
  return client;
}

/** Reset singleton (tests / after migrate in same process). */
export function resetDbClient(): void {
  client = null;
}
