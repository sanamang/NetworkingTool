import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, Pencil, Send, Mail, Linkedin } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/outreach")({
  head: () => ({ meta: [{ title: "Outreach · NetworkOS" }] }),
  component: OutreachPage,
});

const goals = ["Coffee Chat", "Mentorship", "Career Advice", "Recruiting", "Warm Introduction"];

function OutreachPage() {
  const [name, setName] = useState("Jane Smith");
  const [company, setCompany] = useState("Brookfield Infrastructure");
  const [goal, setGoal] = useState("Coffee Chat");
  const [generated, setGenerated] = useState(true);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Outreach</h1>
          <p className="text-muted-foreground text-sm mt-1">Generate personalized networking messages with AI.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: form */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 space-y-4 h-fit">
            <h2 className="font-semibold">Create Outreach</h2>
            <Field label="Target Name"><input value={name} onChange={(e) => setName(e.target.value)} className="input" /></Field>
            <Field label="Company"><input value={company} onChange={(e) => setCompany(e.target.value)} className="input" /></Field>
            <Field label="Goal">
              <select value={goal} onChange={(e) => setGoal(e.target.value)} className="input">
                {goals.map(g => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Context (optional)">
              <textarea rows={4} placeholder="Anything specific you want to mention…" className="input resize-none" />
            </Field>
            <Button className="w-full" onClick={() => setGenerated(true)}>
              <Sparkles className="h-4 w-4" /> Generate Personalized Outreach
            </Button>
            <style>{`.input { width:100%; height:38px; padding:0 10px; border-radius:8px; border:1px solid var(--color-input); background: var(--color-background); font-size: 14px; outline:none; }
              .input:focus { box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-ring) 30%, transparent); }
              textarea.input { height:auto; padding:10px; }`}</style>
          </div>

          {/* Right: output */}
          <div className="lg:col-span-3 space-y-4">
            {generated ? (
              <>
                <OutputCard icon={Mail} title="Email Draft" badge="Subject: Quick coffee — Brookfield infrastructure career path">
                  <p>Hi {name.split(" ")[0]},</p>
                  <p>Hope you've been well. I've been following {company}'s work in renewable infrastructure with a lot of interest, and your team's recent expansion caught my attention.</p>
                  <p>I'd love to learn more about your career path and how you think about long-duration capital deployment in the energy transition. Would you be open to a 25-minute coffee chat in the next two weeks? Happy to come to your office or hop on Zoom — whichever is easier.</p>
                  <p>Thanks for considering, and either way I really appreciate the work you and the team are putting out.</p>
                  <p>Best,<br/>Alex</p>
                </OutputCard>

                <OutputCard icon={Linkedin} title="LinkedIn Message" badge="< 300 chars">
                  <p>Hi {name.split(" ")[0]} — really impressed by what {company} is doing in renewable infra. Would love your perspective on career paths in the space. Open to a quick 20-min chat over the next two weeks? Either way, thanks for the great content you've been sharing.</p>
                </OutputCard>

                <OutputCard icon={Sparkles} title="Follow-Up Sequence" badge="3 messages over 14 days">
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Day 5:</strong> Light bump referencing a recent {company} announcement.</li>
                    <li><strong>Day 10:</strong> Share a relevant article on energy transition financing.</li>
                    <li><strong>Day 14:</strong> Final friendly nudge with two specific time slots.</li>
                  </ul>
                </OutputCard>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <Sparkles className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">Fill in the form and generate your first message.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function OutputCard({ icon: Icon, title, badge, children }: { icon: React.ElementType; title: string; badge: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" /><h3 className="font-semibold text-sm">{title}</h3></div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost"><Pencil className="h-3.5 w-3.5" />Edit</Button>
          <Button size="sm" variant="ghost"><Copy className="h-3.5 w-3.5" />Copy</Button>
          <Button size="sm"><Send className="h-3.5 w-3.5" />Send</Button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mb-3 italic">{badge}</div>
      <div className="text-sm leading-relaxed space-y-3 text-foreground/90">{children}</div>
    </div>
  );
}
