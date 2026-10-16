import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export type StoredUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

type UserStore = {
  byEmail: Map<string, StoredUser>;
  byId: Map<string, StoredUser>;
};

/**
 * In-memory user store for Stage 4.
 *
 * Limitation: data is process-local. On serverless platforms (e.g. Vercel)
 * each instance has its own memory, so accounts will not persist across
 * cold starts or multiple instances. Stage 6 will move users to Cloudflare D1.
 */
function getStore(): UserStore {
  const g = globalThis as typeof globalThis & { __ahaUserStore?: UserStore };
  if (!g.__ahaUserStore) {
    g.__ahaUserStore = {
      byEmail: new Map(),
      byId: new Map(),
    };
  }
  return g.__ahaUserStore;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(
  email: string
): Promise<StoredUser | null> {
  const store = getStore();
  return store.byEmail.get(normalizeEmail(email)) ?? null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const store = getStore();
  return store.byId.get(id) ?? null;
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
}): Promise<{ user: StoredUser } | { error: string }> {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();

  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email address." };
  }
  if (name.length < 1) {
    return { error: "Name is required." };
  }
  if (input.password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const store = getStore();
  if (store.byEmail.has(email)) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user: StoredUser = {
    id: randomUUID(),
    email,
    name,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  store.byEmail.set(email, user);
  store.byId.set(user.id, user);

  return { user };
}

export async function verifyPassword(
  user: StoredUser,
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

/** Safe public shape — never includes passwordHash */
export function toPublicUser(user: StoredUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}
