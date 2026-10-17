/**
 * Production environment checks.
 * Avoid throwing at module load during `next build` unless explicitly forced.
 */
export function assertAuthSecretConfigured(): void {
  // Skip during build phase
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.SKIP_ENV_VALIDATION === "1") return;

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const isProd =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.CF_PAGES === "1";

  if (isProd && (!secret || secret.length < 16)) {
    // Log loudly but do not crash the whole import graph during CI without secrets
    console.error(
      "[security] AUTH_SECRET must be set in production (min 16 characters). Generate: openssl rand -base64 32"
    );
  }
}
