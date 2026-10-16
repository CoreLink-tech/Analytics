import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <AppShell
      title="Overview"
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Intro */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome{session.user.name ? `, ${session.user.name}` : ""}
          </h2>
          <p className="mt-1 text-foreground-muted">
            You are signed in. Project management and data import arrive in
            later stages. Below is the design-system reference used across the app.
          </p>
        </div>

        {/* Buttons */}
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">
            Buttons
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button loading>Loading</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        {/* Inputs */}
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">
            Form Controls
          </h3>
          <div className="grid max-w-md gap-4">
            <div className="space-y-2">
              <Label htmlFor="demo-name">Website name</Label>
              <Input id="demo-name" placeholder="my-site.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-error">With error</Label>
              <Input id="demo-error" error placeholder="Invalid value" />
              <p className="text-xs text-error">This field is required.</p>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">
            Badges
          </h3>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        {/* Alerts */}
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">
            Alerts
          </h3>
          <div className="space-y-3 max-w-xl">
            <Alert variant="info">
              Informational message — useful for tips and neutral feedback.
            </Alert>
            <Alert variant="success">
              Import completed successfully. 1,240 records stored.
            </Alert>
            <Alert variant="warning">
              Some rows were skipped because of missing date values.
            </Alert>
            <Alert variant="error">
              File validation failed. Please check the format and try again.
            </Alert>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">
            Cards
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Visitors</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums">—</p>
                <p className="mt-1 text-xs text-foreground-subtle">
                  No data imported yet
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Page Views</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums">—</p>
                <p className="mt-1 text-xs text-foreground-subtle">
                  No data imported yet
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Import Status</CardTitle>
                <CardDescription>Most recent</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">No imports</Badge>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline">
                  Import data
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Loading & Empty */}
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">
            Loading & Empty States
          </h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-background p-10">
              <Spinner size="lg" />
              <p className="mt-3 text-sm text-foreground-muted">Loading…</p>
            </div>
            <EmptyState
              title="No websites yet"
              description="Create your first website project to start preserving analytics history."
              action={<Button size="sm">Create project</Button>}
            />
          </div>
        </section>

        {/* Color tokens */}
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">
            Color Tokens
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {[
              { name: "Primary", class: "bg-primary" },
              { name: "Success", class: "bg-success" },
              { name: "Warning", class: "bg-warning" },
              { name: "Error", class: "bg-error" },
              { name: "Info", class: "bg-info" },
              { name: "Muted", class: "bg-background-muted border border-border" },
            ].map((c) => (
              <div key={c.name} className="space-y-1.5">
                <div className={`h-12 rounded-md ${c.class}`} />
                <p className="text-xs text-foreground-muted">{c.name}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
