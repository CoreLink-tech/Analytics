import { randomUUID } from "crypto";
import { getDb } from "@/lib/db/client";
import { ensureDbReady } from "@/lib/db/ensure";

export type Project = {
  id: string;
  userId: string;
  name: string;
  domain: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectInput = {
  name: string;
  domain?: string | null;
  description?: string | null;
};

function normalizeDomain(domain: string | null | undefined): string | null {
  if (!domain) return null;
  const trimmed = domain.trim();
  if (!trimmed) return null;
  return trimmed.replace(/^https?:\/\//i, "").replace(/\/$/, "") || null;
}

export function validateProjectInput(
  input: ProjectInput
): { data: ProjectInput } | { error: string } {
  const name = input.name?.trim() ?? "";
  if (name.length < 1) {
    return { error: "Project name is required." };
  }
  if (name.length > 100) {
    return { error: "Project name must be at most 100 characters." };
  }

  const domain = normalizeDomain(input.domain);
  if (domain && domain.length > 253) {
    return { error: "Domain is too long." };
  }

  const description = input.description?.trim() || null;
  if (description && description.length > 500) {
    return { error: "Description must be at most 500 characters." };
  }

  return { data: { name, domain, description } };
}

function rowToProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    domain: row.domain == null ? null : String(row.domain),
    description: row.description == null ? null : String(row.description),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function listProjectsForUser(userId: string): Promise<Project[]> {
  await ensureDbReady();
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT id, user_id, name, domain, description, created_at, updated_at
          FROM projects WHERE user_id = ? ORDER BY updated_at DESC`,
    args: [userId],
  });
  return result.rows.map((r) => rowToProject(r as Record<string, unknown>));
}

export async function getProjectForUser(
  projectId: string,
  userId: string
): Promise<Project | null> {
  await ensureDbReady();
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT id, user_id, name, domain, description, created_at, updated_at
          FROM projects WHERE id = ? AND user_id = ?`,
    args: [projectId, userId],
  });
  if (result.rows.length === 0) return null;
  return rowToProject(result.rows[0] as Record<string, unknown>);
}

export async function createProject(
  userId: string,
  input: ProjectInput
): Promise<{ project: Project } | { error: string }> {
  await ensureDbReady();
  const validated = validateProjectInput(input);
  if ("error" in validated) return { error: validated.error };

  const now = new Date().toISOString();
  const project: Project = {
    id: randomUUID(),
    userId,
    name: validated.data.name!,
    domain: validated.data.domain ?? null,
    description: validated.data.description ?? null,
    createdAt: now,
    updatedAt: now,
  };

  const db = getDb();
  await db.execute({
    sql: `INSERT INTO projects (id, user_id, name, domain, description, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      project.id,
      project.userId,
      project.name,
      project.domain,
      project.description,
      project.createdAt,
      project.updatedAt,
    ],
  });

  return { project };
}

export async function updateProject(
  projectId: string,
  userId: string,
  input: ProjectInput
): Promise<{ project: Project } | { error: string }> {
  await ensureDbReady();
  const existing = await getProjectForUser(projectId, userId);
  if (!existing) return { error: "Project not found." };

  const validated = validateProjectInput(input);
  if ("error" in validated) return { error: validated.error };

  const updated: Project = {
    ...existing,
    name: validated.data.name!,
    domain: validated.data.domain ?? null,
    description: validated.data.description ?? null,
    updatedAt: new Date().toISOString(),
  };

  const db = getDb();
  await db.execute({
    sql: `UPDATE projects
          SET name = ?, domain = ?, description = ?, updated_at = ?
          WHERE id = ? AND user_id = ?`,
    args: [
      updated.name,
      updated.domain,
      updated.description,
      updated.updatedAt,
      projectId,
      userId,
    ],
  });

  return { project: updated };
}

/**
 * Deletion policy:
 * - Only the owning user can delete (enforced by WHERE user_id).
 * - CASCADE removes import_batches and analytics_records for the project.
 */
export async function deleteProject(
  projectId: string,
  userId: string
): Promise<{ ok: true } | { error: string }> {
  await ensureDbReady();
  const existing = await getProjectForUser(projectId, userId);
  if (!existing) return { error: "Project not found." };

  const db = getDb();
  await db.execute({
    sql: "DELETE FROM projects WHERE id = ? AND user_id = ?",
    args: [projectId, userId],
  });

  return { ok: true };
}
