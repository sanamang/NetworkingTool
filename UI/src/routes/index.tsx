import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Avatar, StatusBadge, ScoreRing } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { contacts, kpis, intelligenceFeed } from "@/lib/mock-data";
import { ArrowUpRight, TrendingUp, Users, Calendar, GitBranch } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Relationship Command Center · NetworkOS" }] }),
  component: Dashboard,
});

const kpiCards = [
  { label: "Active Relationships", value: kpis.active, delta: "+12 this month", icon: Users, accent: "text-emerald-600" },
  { label: "People To Reconnect With", value: kpis.reconnect, delta: "5 going cold", icon: TrendingUp, accent: "text-amber-600" },
  { label: "Meetings This Month", value: kpis.meetings, delta: "3 upcoming this week", icon: Calendar, accent: "text-blue-600" },
  { label: "Warm Introductions Available", value: kpis.warmIntros, delta: "via 8 contacts", icon: GitBranch, accent: "text-violet-600" },
];

function Dashboard() {
  const reconnect = contacts.filter(c => c.lastContactDays > 50).slice(0, 4);

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Relationship Command Center</h1>
            <p className="text-muted-foreground mt-1 text-sm">Good morning, Alex — here's where your network needs attention today.</p>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{k.label}</div>
                  <Icon className={`h-4 w-4 ${k.accent}`} />
                </div>
                <div className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">{k.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{k.delta}</div>
              </div>
            );
          })}
        </div>

        {/* Reconnect section */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight">People You Should Reconnect With</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Ranked by relationship value, recency, and detected signals.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reconnect.map((c) => (
              <article key={c.id} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-all">
                <div className="flex items-start gap-4">
                  <Avatar initials={c.initials} color={c.avatarColor} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to="/contacts/$id" params={{ id: c.id }} className="font-semibold hover:underline">{c.name}</Link>
                        <div className="text-sm text-muted-foreground truncate">{c.role} · {c.company}</div>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Last contact: {c.lastContactDays} days ago</div>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-border bg-gradient-to-br from-accent/40 to-muted/30 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-700">
                    Recommendation
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{c.aiRecommendation}</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <ScoreRing score={c.score} />
                  <Link to="/outreach">
                    <Button size="sm">Generate Message <ArrowUpRight className="h-3.5 w-3.5" /></Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Side intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <IntelCard title="Recently promoted" items={intelligenceFeed.recentlyPromoted.map(c => ({ id: c.id, primary: c.name, secondary: `Now ${c.role} at ${c.company}` }))} />
          <IntelCard title="New opportunities" items={intelligenceFeed.newOpportunities.map(c => ({ id: c.id, primary: c.name, secondary: `${c.company} · ${c.industry}` }))} />
          <IntelCard title="Warm intros available" items={intelligenceFeed.warmIntros.map(w => ({ id: w.id, primary: w.target, secondary: `Through ${w.through.join(", ")}` }))} />
        </div>
      </div>
    </AppShell>
  );
}

function IntelCard({ title, items }: { title: string; items: { id: string; primary: string; secondary: string }[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <ul className="space-y-3">
        {items.map(i => (
          <li key={i.id} className="text-sm">
            <div className="font-medium">{i.primary}</div>
            <div className="text-xs text-muted-foreground">{i.secondary}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
