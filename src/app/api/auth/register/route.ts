import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser, toPublicUser } from "@/lib/auth/users";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`register:${ip}`, 10, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many registration attempts. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((limited.resetAt - Date.now()) / 1000)
          ),
        },
      }
    );
  }

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

  try {
    const result = await createUser(parsed.data);
    if ("error" in result) {
      const status = result.error.includes("already exists") ? 409 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(
      { user: toPublicUser(result.user) },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[register]", message);

    if (/DATABASE_URL is required/i.test(message)) {
      return NextResponse.json(
        {
          error:
            "Database is not configured. Set DATABASE_URL to a Turso/libsql URL (not Postgres) in Vercel env vars.",
        },
        { status: 503 }
      );
    }

    if (/no such table|SQLITE_ERROR|does not exist/i.test(message)) {
      return NextResponse.json(
        {
          error:
            "Database schema is missing. Ensure migrations can run (remote DATABASE_URL) or run npm run db:migrate against your Turso database.",
        },
        { status: 503 }
      );
    }

    if (/libsql|TURSO|HTTP status|fetch failed|ECONNREFUSED/i.test(message)) {
      return NextResponse.json(
        {
          error:
            "Could not connect to the database. Check DATABASE_URL and DATABASE_AUTH_TOKEN (Turso/libsql). Vercel Postgres is not supported by this app.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Registration failed due to a server error. Check Vercel logs." },
      { status: 500 }
    );
  }
}
