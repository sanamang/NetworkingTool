import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, Avatar, StatusBadge, ScoreRing } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase, avatarColor, initials, daysSince, capitalize } from "@/lib/supabase";
import { ArrowUpRight, TrendingUp, Users, Calendar, GitBranch } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [contactsRes, meetingsRes, interactionsRes] = await Promise.all([
        supabase.from("contacts").select("id, first_name, last_name, role, status, relationship_score, last_contact_at, notes, companies(name, industry)"),
        supabase.from("meetings").select("id", { count: "exact", head: true }).gte("scheduled_start_at", new Date().toISOString()),
        supabase.from("interactions").select("id", { count: "exact", head: true }),
      ]);

      const contacts = contactsRes.data ?? [];
      const totalContacts = contacts.length;
      const needReconnect = contacts.filter(c => {
        const d = daysSince(c.last_contact_at);
        return d === null || d > 50;
      }).length;
      const upcomingMeetings = meetingsRes.count ?? 0;

      const reconnectList = contacts
        .filter(c => { const d = daysSince(c.last_contact_at); return d === null || d > 50; })
        .sort((a, b) => (b.relationship_score ?? 0) - (a.relationship_score ?? 0))
        .slice(0, 4);

      return { totalContacts, needReconnect, upcomingMeetings, reconnectList };
    },
  });
}

function Dashboard() {
  const { data, isLoading } = useDashboardData();

  const kpiCards = [
    { label: "Active Relationships", value: data?.totalContacts ?? "—", delta: "Total contacts in your network", icon: Users, accent: "text-emerald-600" },
    { label: "People To Reconnect", value: data?.needReconnect ?? "—", delta: "Contacts not touched in 50+ days", icon: TrendingUp, accent: "text-amber-600" },
    { label: "Upcoming Meetings", value: data?.upcomingMeetings ?? "—", delta: "Scheduled ahead", icon: Calendar, accent: "text-blue-600" },
    { label: "Network Score", value: "—", delta: "Coming soon", icon: GitBranch, accent: "text-violet-600" },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Relationship Command Center</h1>
          <p className="text-muted-foreground mt-1 text-sm">Here's where your network needs attention today.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{k.label}</div>
                  <Icon className={`h-4 w-4 ${k.accent}`} />
                </div>
                <div className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">
                  {isLoading ? <span className="text-muted-foreground text-lg">…</span> : k.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{k.delta}</div>
              </div>
            );
          })}
        </div>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight">People You Should Reconnect With</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Contacts you haven't touched in over 50 days, ranked by relationship score.</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="rounded-xl border border-border bg-card p-5 h-40 animate-pulse" />
              ))}
            </div>
          ) : data?.reconnectList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <Users className="h-8 w-8 text-muted-foreground mx-auto" />
              <h3 className="mt-3 font-medium">No contacts yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Add your first contact to start tracking relationships.</p>
              <Link to="/contacts" className="mt-4 inline-block">
                <Button size="sm">Go to Contacts</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {(data?.reconnectList ?? []).map((c: any) => {
                const firstName = c.first_name;
                const lastName = c.last_name;
                const fullName = `${firstName} ${lastName}`;
                const color = avatarColor(c.id);
                const ini = initials(firstName, lastName);
                const days = daysSince(c.last_contact_at);
                const statusCap = capitalize(c.status);
                return (
                  <article key={c.id} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-all">
                    <div className="flex items-start gap-4">
                      <Avatar initials={ini} color={color} size={48} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link to="/contacts/$id" params={{ id: c.id }} className="font-semibold hover:underline">{fullName}</Link>
                            <div className="text-sm text-muted-foreground truncate">{c.role}{c.companies?.name ? ` · ${c.companies.name}` : ""}</div>
                          </div>
                          <StatusBadge status={statusCap} />
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {days === null ? "Never contacted" : `Last contact: ${days} days ago`}
                        </div>
                      </div>
                    </div>
                    {c.notes && (
                      <div className="mt-4 rounded-lg border border-border bg-gradient-to-br from-accent/40 to-muted/30 p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-700">Notes</div>
                        <p className="mt-1.5 text-sm leading-relaxed text-foreground/90 line-clamp-2">{c.notes}</p>
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <ScoreRing score={c.relationship_score ?? 0} />
                      <Link to="/outreach">
                        <Button size="sm">Draft Message <ArrowUpRight className="h-3.5 w-3.5" /></Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
