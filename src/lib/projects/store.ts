import { randomUUID } from "crypto";

export type Project = {
  id: string;
  userId: string;
  name: string;
  domain: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProjectStore = {
  byId: Map<string, Project>;
  byUser: Map<string, Set<string>>;
};

/**
 * In-memory project store for Stage 5.
 * Stage 6 will migrate projects to Cloudflare D1.
 */
function getStore(): ProjectStore {
  const g = globalThis as typeof globalThis & {
    __ahaProjectStore?: ProjectStore;
  };
  if (!g.__ahaProjectStore) {
    g.__ahaProjectStore = {
      byId: new Map(),
      byUser: new Map(),
    };
  }
  return g.__ahaProjectStore;
}

export type ProjectInput = {
  name: string;
  domain?: string | null;
  description?: string | null;
};

function normalizeDomain(domain: string | null | undefined): string | null {
  if (!domain) return null;
  const trimmed = domain.trim();
  if (!trimmed) return null;
  // Strip protocol for cleaner storage
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

  return {
    data: {
      name,
      domain,
      description,
    },
  };
}

export async function listProjectsForUser(userId: string): Promise<Project[]> {
  const store = getStore();
  const ids = store.byUser.get(userId);
  if (!ids) return [];
  const projects: Project[] = [];
  for (const id of ids) {
    const p = store.byId.get(id);
    if (p) projects.push(p);
  }
  return projects.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getProjectForUser(
  projectId: string,
  userId: string
): Promise<Project | null> {
  const store = getStore();
  const project = store.byId.get(projectId);
  if (!project || project.userId !== userId) {
    return null;
  }
  return project;
}

export async function createProject(
  userId: string,
  input: ProjectInput
): Promise<{ project: Project } | { error: string }> {
  const validated = validateProjectInput(input);
  if ("error" in validated) {
    return { error: validated.error };
  }

  const now = new Date().toISOString();
  const project: Project = {
    id: randomUUID(),
    userId,
    name: validated.data.name,
    domain: validated.data.domain ?? null,
    description: validated.data.description ?? null,
    createdAt: now,
    updatedAt: now,
  };

  const store = getStore();
  store.byId.set(project.id, project);
  if (!store.byUser.has(userId)) {
    store.byUser.set(userId, new Set());
  }
  store.byUser.get(userId)!.add(project.id);

  return { project };
}

export async function updateProject(
  projectId: string,
  userId: string,
  input: ProjectInput
): Promise<{ project: Project } | { error: string }> {
  const existing = await getProjectForUser(projectId, userId);
  if (!existing) {
    return { error: "Project not found." };
  }

  const validated = validateProjectInput(input);
  if ("error" in validated) {
    return { error: validated.error };
  }

  const updated: Project = {
    ...existing,
    name: validated.data.name,
    domain: validated.data.domain ?? null,
    description: validated.data.description ?? null,
    updatedAt: new Date().toISOString(),
  };

  getStore().byId.set(projectId, updated);
  return { project: updated };
}

/**
 * Deletion policy (Stage 5):
 * - Only the owning user can delete.
 * - Removes the project record.
 * - Associated analytics records / import history will be removed in later
 *   stages when those entities exist (cascading delete documented then).
 */
export async function deleteProject(
  projectId: string,
  userId: string
): Promise<{ ok: true } | { error: string }> {
  const existing = await getProjectForUser(projectId, userId);
  if (!existing) {
    return { error: "Project not found." };
  }

  const store = getStore();
  store.byId.delete(projectId);
  store.byUser.get(userId)?.delete(projectId);

  return { ok: true };
}
