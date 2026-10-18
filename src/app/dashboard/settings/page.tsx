import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/settings");
  }

  return (
    <AppShell
      title="Settings"
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Settings</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Account details for your archive.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
            <CardDescription>Signed-in profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-foreground-subtle">Name</p>
              <p className="text-foreground">{session.user.name || "—"}</p>
            </div>
            <div>
              <p className="text-foreground-subtle">Email</p>
              <p className="text-foreground">{session.user.email || "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Where is import / history?</CardTitle>
            <CardDescription>
              Those tools live on each website project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground-muted">
            <p>
              Open <strong className="text-foreground">My Websites</strong>,
              choose a project, then use:
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong className="text-foreground">Import data</strong> — CSV /
                JSON upload
              </li>
              <li>
                <strong className="text-foreground">View analytics</strong> —
                charts & historical records
              </li>
              <li>
                <strong className="text-foreground">Manage data</strong> — export
                & import history
              </li>
              <li>
                <strong className="text-foreground">Connect website (API)</strong>{" "}
                — API keys for your site
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
