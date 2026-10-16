import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Analytics History Archive",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-background-subtle">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                A
              </span>
              <span className="text-sm font-semibold text-foreground">
                Analytics Archive
              </span>
            </Link>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-foreground-muted">
              Access your analytics archive
            </p>
          </div>

          <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
            <LoginForm
              callbackUrl={params.callbackUrl ?? "/dashboard"}
              initialError={params.error}
            />
          </div>

          <p className="mt-6 text-center text-sm text-foreground-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary-hover"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
