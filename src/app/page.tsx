import Link from "next/link";
import { Button } from "@/components/ui/button";

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
          <Link href="/dashboard">
            <Button size="lg">View Design System</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              Open App Shell
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
