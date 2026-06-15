import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell, Avatar, StatusBadge, ScoreRing } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { getContact, timeline } from "@/lib/mock-data";
import { ArrowLeft, Mail, MessageSquare, Calendar, TrendingUp, Phone, Linkedin, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contacts/$id")({
  head: ({ params }) => ({ meta: [{ title: `${getContact(params.id)?.name ?? "Contact"} · NetworkOS` }] }),
  loader: ({ params }) => {
    const c = getContact(params.id);
    if (!c) throw notFound();
    return { contact: c };
  },
  component: ContactProfile,
  notFoundComponent: () => <AppShell><div className="text-center py-20"><p>Contact not found.</p></div></AppShell>,
});

const tabs = ["Overview", "Timeline", "Notes", "Emails", "Meetings", "Stats"] as const;

function ContactProfile() {
  const { contact: c } = Route.useLoaderData();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const events = timeline.filter(t => t.contactId === c.id);

  return (
    <AppShell>
      <div className="space-y-6">
        <Link to="/contacts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to contacts
        </Link>

        <header className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-start gap-6">
            <Avatar initials={c.initials} color={c.avatarColor} size={80} />
            <div className="flex-1 min-w-[200px]">
              <h1 className="text-2xl font-semibold tracking-tight">{c.name}</h1>
              <p className="text-muted-foreground">{c.role} · {c.company}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <StatusBadge status={c.status} />
                <span className="text-xs text-muted-foreground">{c.industry} · {c.university} · {c.location}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Relationship Score</div>
                <div className="mt-1 flex items-center justify-end gap-2">
                  <span className="text-3xl font-semibold tabular-nums">{c.score}</span>
                  <span className="text-xs text-emerald-600 font-medium">/ 100</span>
                </div>
                <ScoreRing score={c.score} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline"><Mail className="h-4 w-4" />Email</Button>
                <Button size="sm" variant="outline"><Linkedin className="h-4 w-4" />Message</Button>
                <Button size="sm"><Calendar className="h-4 w-4" />Schedule</Button>
              </div>
            </div>
          </div>
        </header>

        <div className="border-b border-border flex gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >{t}</button>
          ))}
        </div>

        {tab === "Overview" && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {c.name} is a {c.role} at {c.company}, focused in {c.industry.toLowerCase()}. Met via {c.university} alumni network. Last meaningful interaction was {c.lastContactDays} days ago.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <Field label="Email" value={c.email} icon={Mail} />
              <Field label="Phone" value="+1 (415) 555-0142" icon={Phone} />
              <Field label="LinkedIn" value={`linkedin.com/in/${c.name.toLowerCase().replace(/\s/g, "")}`} icon={Linkedin} />
              <Field label="Industry" value={c.industry} icon={TrendingUp} />
            </div>
          </div>
        )}

        {tab === "Timeline" && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold mb-6">Activity Timeline</h3>
            <ol className="relative border-l border-border ml-3 space-y-6">
              {[
                ...events,
                ...(events.length === 0 ? [{ id: "x", contactId: c.id, date: "Recently", type: "outreach" as const, title: "Initial outreach sent", detail: "LinkedIn message" }] : []),
              ].map((e) => (
                <li key={e.id} className="ml-6">
                  <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                  <div className="text-xs text-muted-foreground tabular-nums">{e.date}</div>
                  <div className="font-medium text-sm mt-0.5">{e.title}</div>
                  {e.detail && <div className="text-sm text-muted-foreground mt-1">{e.detail}</div>}
                </li>
              ))}
            </ol>
          </div>
        )}

        {tab === "Notes" && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-semibold">Notes</h3>
            <textarea
              className="w-full min-h-[180px] rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              defaultValue={`Met at ${c.university} alumni mixer. Interested in ${c.industry.toLowerCase()} career path. Has strong network in ${c.location.split(",")[0]}. Mentioned willingness to make introductions to portfolio companies.`}
            />
            <div className="flex justify-end"><Button size="sm">Save note</Button></div>
          </div>
        )}

        {tab === "Emails" && (
          <EmptyTab icon={Mail} title="Email thread coming soon" desc="Connect Gmail or Outlook to sync your conversations with this contact." />
        )}
        {tab === "Meetings" && (
          <EmptyTab icon={Calendar} title="No meetings yet" desc="Schedule a coffee chat or 1:1 to start tracking interactions." />
        )}
        {tab === "Stats" && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-semibold">Outreach Pipeline</h3>
            <div className="space-y-3">
              <PipelineStage label="Email 1" completed={true} />
              <PipelineStage label="Email 2" completed={c.score >= 50} />
              <PipelineStage label="Email 3" completed={c.score >= 65} />
              <PipelineStage label="Meeting Scheduled" completed={c.score >= 75} />
              <PipelineStage label="Meeting Completed" completed={c.score >= 85} />
            </div>
          </div>
        )}

        <MessageDraftCard contact={c} />
      </div>
    </AppShell>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="mt-1 flex items-center gap-2 text-sm"><Icon className="h-3.5 w-3.5 text-muted-foreground" />{value}</div>
    </div>
  );
}

function EmptyTab({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
      <Icon className="h-8 w-8 text-muted-foreground mx-auto" />
      <h3 className="mt-3 font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Insight({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <p className="mt-1.5 leading-relaxed">{children}</p>
    </div>
  );
}

function MessageDraftCard({ contact }: { contact: ReturnType<typeof getContact> }) {
  if (!contact) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-muted-foreground" /><h3 className="text-sm font-semibold">Quick message draft</h3></div>
        <Button size="sm" variant="outline">Regenerate</Button>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">
        Hi {contact.name.split(" ")[0]}, hope you've been well! Saw the news about {contact.company} — congratulations on the momentum. Would love to catch up over a quick coffee or call in the next two weeks if you have 20 minutes. Always value your perspective.
      </p>
    </div>
  );
}

function PipelineStage({ label, completed }: { label: string; completed: boolean }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {completed ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
      )}
      <span className={completed ? "font-medium text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
