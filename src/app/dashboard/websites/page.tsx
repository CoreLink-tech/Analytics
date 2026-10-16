import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listProjectsForUser } from "@/lib/projects/store";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function WebsitesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/websites");
  }

  const projects = await listProjectsForUser(session.user.id);

  return (
    <AppShell
      title="My Websites"
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              My Websites
            </h2>
            <p className="mt-1 text-sm text-foreground-muted">
              Projects hold the analytics history you import for each site.
            </p>
          </div>
          <Link href="/dashboard/websites/new">
            <Button>New project</Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title="No websites yet"
            description="Create your first website project to start preserving analytics history."
            action={
              <Link href="/dashboard/websites/new">
                <Button size="sm">Create project</Button>
              </Link>
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <li key={project.id}>
                <Link href={`/dashboard/websites/${project.id}`} className="block h-full">
                  <Card className="h-full transition-colors hover:border-border-strong hover:bg-background-subtle/50">
                    <CardHeader>
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      {project.domain && (
                        <CardDescription>{project.domain}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {project.description ? (
                        <p className="line-clamp-2 text-sm text-foreground-muted">
                          {project.description}
                        </p>
                      ) : (
                        <p className="text-sm text-foreground-subtle">
                          No description
                        </p>
                      )}
                      <p className="mt-3 text-xs text-foreground-subtle">
                        Updated{" "}
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
