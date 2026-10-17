import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjectForUser } from "@/lib/projects/store";
import { listImportBatchesForProject } from "@/lib/analytics/records";
import { listMetricsForProject } from "@/lib/analytics/queries";
import { AppShell } from "@/components/layout/app-shell";
import { DataManagePanel } from "@/components/projects/data-manage-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PageProps = { params: Promise<{ id: string }> };

export default async function ManageDataPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/websites");
  }

  const { id } = await params;
  const project = await getProjectForUser(id, session.user.id);
  if (!project) notFound();

  const batches =
    (await listImportBatchesForProject(id, session.user.id)) ?? [];
  const metrics = (await listMetricsForProject(id, session.user.id)) ?? [];

  return (
    <AppShell
      title={`Data · ${project.name}`}
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
            Export & data management
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Download your archive, review imports, and remove data you no longer
            need.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tools</CardTitle>
            <CardDescription>
              All actions are scoped to this project and your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataManagePanel
              projectId={project.id}
              batches={batches}
              metrics={metrics}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
