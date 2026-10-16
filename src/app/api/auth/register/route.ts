import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser, toPublicUser } from "@/lib/auth/users";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Invalid registration data.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const result = await createUser(parsed.data);
  if ("error" in result) {
    // 409 for duplicate email; avoid revealing extra account details
    const status = result.error.includes("already exists") ? 409 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json(
    { user: toPublicUser(result.user) },
    { status: 201 }
  );
}
