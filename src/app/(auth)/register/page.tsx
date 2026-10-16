import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create an Analytics History Archive account",
};

export default function RegisterPage() {
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
              Create your account
            </h1>
            <p className="mt-2 text-sm text-foreground-muted">
              Start preserving your website analytics history
            </p>
          </div>

          <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
            <RegisterForm />
          </div>

          <p className="mt-6 text-center text-sm text-foreground-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary-hover"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-foreground-subtle">
            Stage 4 uses an in-memory user store for development. Accounts may
            not persist across server restarts until the database stage.
          </p>
        </div>
      </div>
    </div>
  );
}
