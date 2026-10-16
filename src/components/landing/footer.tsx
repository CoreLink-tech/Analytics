import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background-subtle">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                A
              </span>
              <span className="text-sm font-semibold text-foreground">
                Analytics Archive
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-foreground-muted">
              Preserve your website analytics history and explore long-term
              trends in one place.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
              <li>
                <a href="#features" className="hover:text-foreground">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-foreground">
                  How it works
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground">
                  App (signed in)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Account</h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
              <li>
                <Link href="/login" className="hover:text-foreground">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground">
                  Get started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
              <li>
                <a href="#privacy" className="hover:text-foreground">
                  Privacy
                </a>
              </li>
              <li>
                <span className="text-foreground-subtle">
                  Terms (coming soon)
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-foreground-subtle sm:text-left">
          <p>
            Analytics History Archive is under active development. Data you
            import remains under your control.
          </p>
        </div>
      </div>
    </footer>
  );
}
