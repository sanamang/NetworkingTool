import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });
}

function SettingsPage() {
  const { data: user, isLoading } = useProfile();
  const qc = useQueryClient();
  const meta = user?.user_metadata ?? {};

  const [fullName, setFullName] = useState<string | null>(null);
  const displayedName = fullName ?? meta.username ?? meta.full_name ?? "";

  const updateProfile = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.auth.updateUser({
        data: { ...meta, full_name: name, username: name },
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profile"] }); toast.success("Profile updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const integrations = [
    { name: "Google", desc: "Sign in & sync Gmail / Google Calendar", connected: false },
    { name: "Microsoft", desc: "Sign in & sync Outlook / Microsoft Calendar", connected: false },
    { name: "LinkedIn", desc: "Enrich profiles automatically", connected: false },
  ];

  const inputClass = "h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition";

  return (
    <AppShell>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Account, integrations, and preferences.</p>
        </div>

        <Section title="Profile">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-8 bg-muted/40 rounded" />
              <div className="h-8 bg-muted/40 rounded" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2.5 border-b border-border">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground min-w-[80px]">Name</span>
                <input
                  className={inputClass + " flex-1"}
                  value={displayedName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your name"
                />
                <Button
                  size="sm"
                  disabled={updateProfile.isPending || displayedName === (meta.username ?? meta.full_name ?? "")}
                  onClick={() => updateProfile.mutate(displayedName)}
                >
                  {updateProfile.isPending ? "Saving…" : "Save"}
                </Button>
              </div>
              {meta.school && <InfoRow label="School" value={meta.school} />}
              {meta.program && <InfoRow label="Program" value={meta.program} />}
              {meta.year_of_study && <InfoRow label="Year" value={meta.year_of_study} />}
              {meta.job_interest && <InfoRow label="Career interest" value={meta.job_interest} />}
            </div>
          )}
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
                  <Button size="sm" variant="outline" onClick={() => toast.info("OAuth integration coming soon")}>Connect</Button>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Follow-up defaults">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Default follow-up cadence: <span className="text-foreground font-medium">5 days → 12 days</span></p>
            <p className="text-xs">Per-contact overrides can be set from the contact's profile page. Full configuration coming soon.</p>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
