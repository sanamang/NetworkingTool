import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · NetworkOS" }] }),
  component: SettingsPage,
});

const integrations = [
  { name: "Google", desc: "Sign in & sync Gmail / Google Calendar", connected: true },
  { name: "Microsoft", desc: "Sign in & sync Outlook / Microsoft Calendar", connected: false },
  { name: "LinkedIn", desc: "Enrich profiles automatically", connected: false },
];

function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Account, integrations, and preferences.</p>
        </div>

        <Section title="Profile">
          <Row label="Name" value="Alex Yang" />
          <Row label="Email" value="alex@networkos.app" />
          <Row label="Role" value="Founder" />
        </Section>

        <Section title="Connected accounts">
          <div className="divide-y divide-border">
            {integrations.map((i) => (
              <div key={i.name} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-sm">{i.name}</div>
                  <div className="text-xs text-muted-foreground">{i.desc}</div>
                </div>
                {i.connected ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <Check className="h-3 w-3" /> Connected
                  </span>
                ) : (
                  <Button size="sm" variant="outline">Connect</Button>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section title="AI preferences">
          <Row label="Tone" value="Warm & professional" />
          <Row label="Default outreach length" value="Concise (under 120 words)" />
          <Row label="Follow-up cadence" value="Adaptive based on relationship strength" />
        </Section>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
