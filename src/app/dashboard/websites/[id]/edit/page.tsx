import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjectForUser } from "@/lib/projects/store";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectForm } from "@/components/projects/project-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditWebsitePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/websites");
  }

  const { id } = await params;
  const project = await getProjectForUser(id, session.user.id);
  if (!project) {
    notFound();
  }

  return (
    <AppShell
      title={`Edit · ${project.name}`}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="mx-auto max-w-lg space-y-4">
        <div>
          <Link
            href={`/dashboard/websites/${project.id}`}
            className="text-sm text-foreground-muted hover:text-foreground"
          >
            ← Back to project
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            Edit project
          </h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project details</CardTitle>
            <CardDescription>Update name, domain, or description.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectForm
              mode="edit"
              projectId={project.id}
              initial={{
                name: project.name,
                domain: project.domain ?? "",
                description: project.description ?? "",
              }}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
