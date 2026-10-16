import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db/client";
import { ensureDbReady } from "@/lib/db/ensure";

export type StoredUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function rowToUser(row: Record<string, unknown>): StoredUser {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    passwordHash: String(row.password_hash),
    createdAt: String(row.created_at),
  };
}

export async function findUserByEmail(
  email: string
): Promise<StoredUser | null> {
  await ensureDbReady();
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, email, name, password_hash, created_at FROM users WHERE email = ?",
    args: [normalizeEmail(email)],
  });
  if (result.rows.length === 0) return null;
  return rowToUser(result.rows[0] as Record<string, unknown>);
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  await ensureDbReady();
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, email, name, password_hash, created_at FROM users WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToUser(result.rows[0] as Record<string, unknown>);
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
}): Promise<{ user: StoredUser } | { error: string }> {
  await ensureDbReady();

  const email = normalizeEmail(input.email);
  const name = input.name.trim();

  if (!email || !email.includes("@") || email.length > 255) {
    return { error: "Enter a valid email address." };
  }
  if (name.length < 1 || name.length > 100) {
    return { error: "Name is required." };
  }
  if (input.password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (input.password.length > 128) {
    return { error: "Password is too long." };
  }

  const existing = await findUserByEmail(email);
  if (existing) {
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

  const db = getDb();
  try {
    await db.execute({
      sql: `INSERT INTO users (id, email, name, password_hash, created_at)
            VALUES (?, ?, ?, ?, ?)`,
      args: [user.id, user.email, user.name, user.passwordHash, user.createdAt],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("unique")) {
      return { error: "An account with this email already exists." };
    }
    throw err;
  }

  return { user };
}

export async function verifyPassword(
  user: StoredUser,
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

export function toPublicUser(user: StoredUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}
