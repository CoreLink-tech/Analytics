import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectForm } from "@/components/projects/project-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewWebsitePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/websites/new");
  }

  return (
    <AppShell
      title="New project"
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="mx-auto max-w-lg space-y-4">
        <div>
          <Link
            href="/dashboard/websites"
            className="text-sm text-foreground-muted hover:text-foreground"
          >
            ← Back to websites
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            Create website project
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Each project stores analytics for one website or client site.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project details</CardTitle>
            <CardDescription>
              Name is required. Domain and description are optional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectForm mode="create" />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
