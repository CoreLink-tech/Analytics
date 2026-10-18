import { createHash, randomBytes } from "crypto";
import { getDb } from "@/lib/db/client";
import { ensureDbReady } from "@/lib/db/ensure";
import { getProjectForUser } from "@/lib/projects/store";

export type ApiKeyMeta = {
  id: string;
  projectId: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Generate a new key. Full secret returned once only. */
export async function createApiKey(
  projectId: string,
  userId: string,
  name = "Default"
): Promise<{ meta: ApiKeyMeta; secret: string } | { error: string }> {
  await ensureDbReady();
  const project = await getProjectForUser(projectId, userId);
  if (!project) return { error: "Project not found." };

  const secret = `aha_${randomBytes(24).toString("base64url")}`;
  const keyPrefix = secret.slice(0, 12);
  const keyHash = hashKey(secret);
  const id = randomBytes(16).toString("hex");
  const createdAt = new Date().toISOString();

  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO project_api_keys
          (id, project_id, user_id, name, key_prefix, key_hash, created_at, last_used_at, revoked_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
    args: [id, projectId, userId, name.trim().slice(0, 80) || "Default", keyPrefix, keyHash, createdAt],
  });

  return {
    secret,
    meta: {
      id,
      projectId,
      name: name.trim().slice(0, 80) || "Default",
      keyPrefix,
      createdAt,
      lastUsedAt: null,
      revokedAt: null,
    },
  };
}

export async function listApiKeysForProject(
  projectId: string,
  userId: string
): Promise<ApiKeyMeta[] | null> {
  await ensureDbReady();
  const project = await getProjectForUser(projectId, userId);
  if (!project) return null;

  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT id, project_id, name, key_prefix, created_at, last_used_at, revoked_at
          FROM project_api_keys
          WHERE project_id = ? AND user_id = ?
          ORDER BY created_at DESC`,
    args: [projectId, userId],
  });

  return result.rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      id: String(row.id),
      projectId: String(row.project_id),
      name: String(row.name),
      keyPrefix: String(row.key_prefix),
      createdAt: String(row.created_at),
      lastUsedAt: row.last_used_at == null ? null : String(row.last_used_at),
      revokedAt: row.revoked_at == null ? null : String(row.revoked_at),
    };
  });
}

export async function revokeApiKey(
  keyId: string,
  projectId: string,
  userId: string
): Promise<{ ok: true } | { error: string }> {
  await ensureDbReady();
  const project = await getProjectForUser(projectId, userId);
  if (!project) return { error: "Project not found." };

  const db = await getDb();
  const result = await db.execute({
    sql: `UPDATE project_api_keys SET revoked_at = ?
          WHERE id = ? AND project_id = ? AND user_id = ? AND revoked_at IS NULL`,
    args: [new Date().toISOString(), keyId, projectId, userId],
  });

  if (result.rowsAffected === 0) {
    return { error: "Key not found or already revoked." };
  }
  return { ok: true };
}

export type ResolvedApiKey = {
  keyId: string;
  projectId: string;
  userId: string;
};

/** Resolve a Bearer token to project + user. */
export async function resolveApiKey(
  bearerToken: string
): Promise<ResolvedApiKey | null> {
  await ensureDbReady();
  const token = bearerToken.trim();
  if (!token.startsWith("aha_") || token.length < 20) return null;

  const keyPrefix = token.slice(0, 12);
  const keyHash = hashKey(token);
  const db = await getDb();

  const result = await db.execute({
    sql: `SELECT id, project_id, user_id, key_hash, revoked_at
          FROM project_api_keys
          WHERE key_prefix = ? AND revoked_at IS NULL
          LIMIT 20`,
    args: [keyPrefix],
  });

  for (const r of result.rows) {
    const row = r as Record<string, unknown>;
    if (String(row.key_hash) === keyHash) {
      await db.execute({
        sql: `UPDATE project_api_keys SET last_used_at = ? WHERE id = ?`,
        args: [new Date().toISOString(), String(row.id)],
      });
      return {
        keyId: String(row.id),
        projectId: String(row.project_id),
        userId: String(row.user_id),
      };
    }
  }
  return null;
}
