import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjectForUser } from "@/lib/projects/store";
import { AppShell } from "@/components/layout/app-shell";
import { ImportForm } from "@/components/projects/import-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PageProps = { params: Promise<{ id: string }> };

export default async function ImportPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/websites");
  }

  const { id } = await params;
  const project = await getProjectForUser(id, session.user.id);
  if (!project) notFound();

  return (
    <AppShell
      title={`Import · ${project.name}`}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <div>
          <Link
            href={`/dashboard/websites/${project.id}`}
            className="text-sm text-foreground-muted hover:text-foreground"
          >
            ← Back to project
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            Import analytics
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Upload a CSV or JSON export, map columns, and save historical
            metrics to this project.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload file</CardTitle>
            <CardDescription>
              Required columns (or mapped fields): date, metric name, value.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImportForm projectId={project.id} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
