import Link from "next/link";
import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/footer";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-medium text-primary">
                Long-term analytics archive
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
                Your analytics shouldn&apos;t disappear just because your
                provider forgets them.
              </h1>
              <p className="mt-6 text-lg text-foreground-muted sm:text-xl">
                Preserve your website analytics, explore historical trends, and
                keep your data organized in one place — beyond your provider&apos;s
                retention window.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className={cn(
                    "inline-flex h-11 w-full items-center justify-center rounded-lg px-6 text-base font-medium sm:w-auto",
                    "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                  title="Opens the design-system preview until authentication ships"
                >
                  Start your archive
                </Link>
                <a
                  href="#how-it-works"
                  className={cn(
                    "inline-flex h-11 w-full items-center justify-center rounded-lg px-6 text-base font-medium sm:w-auto",
                    "border border-border-strong bg-background text-foreground hover:bg-background-subtle",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                >
                  See how it works
                </a>
              </div>
              <p className="mt-4 text-xs text-foreground-subtle">
                &quot;Start your archive&quot; opens the app preview for now. Account
                sign-up arrives in the next development stage.
              </p>
            </div>

            {/* Honest product preview (illustrative, not a live dashboard) */}
            <div className="mx-auto mt-16 max-w-4xl">
              <div className="overflow-hidden rounded-xl border border-border bg-background shadow-md">
                <div className="flex items-center gap-2 border-b border-border bg-background-subtle px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                    <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                    <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                  </div>
                  <p className="text-xs text-foreground-subtle">
                    Illustrative preview — not live data
                  </p>
                </div>
                <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-6">
                  {[
                    { label: "Preserved records", value: "Your imports" },
                    { label: "Date range", value: "Your history" },
                    { label: "Projects", value: "Your websites" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-border bg-background-subtle p-4"
                    >
                      <p className="text-xs font-medium text-foreground-muted">
                        {item.label}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-foreground">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border px-4 py-8 sm:px-6">
                  <div className="flex h-32 items-end justify-between gap-1 sm:gap-2">
                    {[40, 55, 35, 70, 48, 82, 60, 75, 50, 90, 65, 78].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="w-full rounded-t bg-primary/20"
                          style={{ height: `${h}%` }}
                          aria-hidden="true"
                        />
                      )
                    )}
                  </div>
                  <p className="mt-3 text-center text-xs text-foreground-subtle">
                    Charts will reflect your imported historical records
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem / Solution */}
        <section className="border-b border-border bg-background-subtle">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  The problem with short retention
                </h2>
                <p className="mt-4 text-foreground-muted">
                  Many analytics tools limit how far back you can look or export.
                  When you need year-over-year trends, you end up copying numbers
                  into spreadsheets — repeatedly.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-foreground-muted">
                  {[
                    "Manual exports that are easy to lose or misfile",
                    "Inconsistent column names across files",
                    "Hard comparisons across months or years",
                    "No single place for multiple websites",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-error"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  A dedicated archive helps
                </h2>
                <p className="mt-4 text-foreground-muted">
                  Import the data you still have access to. We store it in a
                  structured way so you can chart trends, filter by date, and
                  export again whenever you need.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-foreground-muted">
                  {[
                    "CSV and JSON imports with validation",
                    "Projects for each website you manage",
                    "Historical charts from your real records",
                    "Export your data on your terms",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                How it works
              </h2>
              <p className="mt-3 text-foreground-muted">
                Three simple steps to start preserving your history.
              </p>
            </div>
            <ol className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Import your analytics",
                  body: "Upload CSV or JSON exports from your current provider. Preview and map fields before anything is saved.",
                },
                {
                  step: "2",
                  title: "Organize and preserve",
                  body: "Records are stored under website projects you control, with import history and duplicate handling.",
                },
                {
                  step: "3",
                  title: "Explore your history",
                  body: "Use charts, date filters, and tables built from the data you actually imported — not placeholders.",
                },
              ].map((item) => (
                <li key={item.step} className="relative text-center sm:text-left">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary-muted text-sm font-semibold text-primary sm:mx-0">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-foreground-muted">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 border-b border-border bg-background-subtle">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Built for long-term clarity
              </h2>
              <p className="mt-3 text-foreground-muted">
                Core capabilities focused on preservation and analysis — not
                another live tracker.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Historical storage",
                  body: "Keep records past your provider’s usual retention so year-over-year views remain possible.",
                },
                {
                  title: "CSV & JSON import",
                  body: "Upload supported files, preview rows, map columns, and review validation before confirming.",
                },
                {
                  title: "Charts & tables",
                  body: "See trends and metrics calculated from the data you imported, with clear empty states when nothing is stored yet.",
                },
                {
                  title: "Multiple websites",
                  body: "Separate projects for each site so freelancers and indie builders can keep client data organized.",
                },
                {
                  title: "Export anytime",
                  body: "Download your stored records as CSV with the filters you choose. Your data stays portable.",
                },
                {
                  title: "Future integrations",
                  body: "Automated connections (e.g. Vercel Analytics) and AI screenshot import are planned after the core archive works.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-lg border border-border bg-background p-6 shadow-sm"
                >
                  <h3 className="text-base font-semibold text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-foreground-muted">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy & control */}
        <section id="privacy" className="scroll-mt-20 border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Privacy and control
              </h2>
              <p className="mt-3 text-foreground-muted">
                Your imported analytics belong to you. Private projects are not
                publicly accessible.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-3xl space-y-4 text-sm text-foreground-muted">
              <p>
                We only store data that you import or that we retrieve through
                integrations you explicitly connect in later stages. We do not
                claim to recover data that a provider has already deleted.
              </p>
              <p>
                Authentication, project ownership checks, and secure file
                handling are part of the product roadmap. We will not invent
                security certifications or compliance claims that have not been
                assessed.
              </p>
              <p>
                You will be able to export and delete your data according to
                documented policies as those features ship.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-background-subtle">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Start preserving your history
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-foreground-muted">
              Create an account, add a website project, and import the analytics
              files you already have. The archive grows with every import you
              confirm.
            </p>
            <div className="mt-8">
              <Link
                href="/dashboard"
                className={cn(
                  "inline-flex h-11 items-center justify-center rounded-lg px-8 text-base font-medium",
                  "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
              >
                Get started
              </Link>
            </div>
            <p className="mt-4 text-xs text-foreground-subtle">
              Authentication arrives in Stage 4. The current “Get started” link
              opens the design-system preview.
            </p>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
