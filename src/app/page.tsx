import Link from "next/link";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
          A
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Analytics History Archive
        </h1>
        <p className="mt-4 text-lg text-foreground-muted">
          Your analytics shouldn&apos;t disappear just because your provider
          forgets them.
        </p>
        <p className="mt-2 text-sm text-foreground-subtle">
          Stage 2 — Design System & Application Shell
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className={cn(
              "inline-flex h-11 items-center justify-center rounded-lg px-6 text-base font-medium",
              "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            View Design System
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              "inline-flex h-11 items-center justify-center rounded-lg px-6 text-base font-medium",
              "border border-border-strong bg-background text-foreground hover:bg-background-subtle",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            Open App Shell
          </Link>
        </div>
      </div>
    </div>
  );
}
