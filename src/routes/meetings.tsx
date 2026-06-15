import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Avatar } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { meetings, getContact } from "@/lib/mock-data";
import { Calendar, MapPin, Sparkles, BookOpen, MessageCircle, TrendingUp, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/meetings")({
  head: () => ({ meta: [{ title: "Meetings · NetworkOS" }] }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const [journalOpen, setJournalOpen] = useState(false);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Meetings</h1>
            <p className="text-muted-foreground text-sm mt-1">Upcoming conversations & AI-prepared briefs.</p>
          </div>
          <Button onClick={() => setJournalOpen(true)}>Log meeting</Button>
        </div>

        <h2 className="text-lg font-semibold tracking-tight">Upcoming Meetings</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {meetings.map(m => {
            const c = getContact(m.contactId)!;
            return (
              <div key={m.id} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                <div className="flex items-start gap-4">
                  <Avatar initials={c.initials} color={c.avatarColor} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-sm text-muted-foreground">{c.role} · {c.company}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{m.date} · {m.time}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{m.location}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-sm font-medium">{m.title}</div>

                <div className="mt-4 rounded-lg border border-border bg-gradient-to-br from-violet-50/60 to-accent/30 p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-violet-700">
                    <Sparkles className="h-3.5 w-3.5" /> Meeting Prep Brief
                  </div>
                  <BriefSection icon={BookOpen} title="About this person">
                    {c.name} leads {c.role.toLowerCase()} at {c.company}. {c.university} alum. Active in {c.industry.toLowerCase()} circles.
                  </BriefSection>
                  <BriefSection icon={MessageCircle} title="Suggested topics">
                    Recent {c.industry.toLowerCase()} deals · career trajectory · mentorship philosophy · {c.location.split(",")[0]} ecosystem.
                  </BriefSection>
                  <BriefSection icon={MessageCircle} title="Questions to ask">
                    "What inflection point shaped your career most?" · "How is your team thinking about the next 12 months?"
                  </BriefSection>
                  <BriefSection icon={TrendingUp} title="Recent company news">
                    {c.company} announced a new partnership last week — worth referencing as a warm opener.
                  </BriefSection>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {journalOpen && <JournalModal onClose={() => setJournalOpen(false)} />}
    </AppShell>
  );
}

function BriefSection({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80"><Icon className="h-3 w-3" />{title}</div>
      <p className="mt-1 text-sm text-foreground/80 leading-relaxed">{children}</p>
    </div>
  );
}

function JournalModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-elevated)] w-full max-w-xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold">Post-Meeting Journal</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {!submitted ? (
            <>
              <label className="text-sm font-medium">How did the conversation go?</label>
              <textarea rows={6} className="w-full rounded-md border border-input p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" placeholder="Jane was thoughtful and engaged. We discussed renewable infra hiring…" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={() => setSubmitted(true)}><Sparkles className="h-4 w-4" /> Generate summary</Button>
              </div>
            </>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-violet-700">
                <Sparkles className="h-3.5 w-3.5" /> AI Summary
              </div>
              <Block title="Summary">Productive 30-min coffee chat. Jane is actively expanding her team and open to making intros within the Brookfield ecosystem.</Block>
              <Block title="Key takeaways">Renewable infra hiring will grow 40% in H2 · Jane prefers candidates with operating + finance hybrid · Mentioned a CPP Investments contact relevant to your search.</Block>
              <Block title="Action items">Send thank-you email · Share updated resume · Intro request to her CPP contact.</Block>
              <Block title="Recommended follow-up">3 weeks (June 29, 2026)</Block>
              <Block title="Relationship score update">+6 → New score: <strong>92</strong></Block>
              <div className="flex justify-end"><Button onClick={onClose}>Save to timeline</Button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
