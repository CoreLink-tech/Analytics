import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listProjectsForUser } from "@/lib/projects/store";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const projects = await listProjectsForUser(session.user.id);
  const projectCount = projects.length;

  return (
    <AppShell
      title="Overview"
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome{session.user.name ? `, ${session.user.name}` : ""}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Preserve analytics history for your websites — import files or push
            data via API.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Website projects</CardTitle>
              <CardDescription>
                {projectCount === 0
                  ? "No projects yet"
                  : `${projectCount} project${projectCount === 1 ? "" : "s"}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/dashboard/websites"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
              >
                {projectCount === 0 ? "Create a project" : "My Websites"}
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">How to add data</CardTitle>
              <CardDescription>
                CSV/JSON import or live API push
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground-muted">
              <p>
                1. Create a website project
              </p>
              <p>
                2. Import a file, or generate an API key and send metrics from
                your site
              </p>
              <p>
                3. Explore charts and export history anytime
              </p>
            </CardContent>
          </Card>
        </div>

        {projectCount > 0 && (
          <section>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Recent projects
            </h3>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {projects.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/dashboard/websites/${p.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-background-subtle"
                  >
                    <span className="font-medium text-foreground">{p.name}</span>
                    <span className="text-foreground-subtle">
                      {p.domain ?? "Open →"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}
