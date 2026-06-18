import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell, Avatar, StatusBadge, ScoreRing } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase, avatarColor, initials, daysSince, capitalize } from "@/lib/supabase";
import { ArrowLeft, Mail, MessageSquare, Calendar, TrendingUp, Phone, Linkedin, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contacts/$id")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("contacts")
      .select("*, companies(id, name, domain, industry)")
      .eq("id", params.id)
      .single();
    if (error || !data) throw notFound();
    return { contact: data };
  },
  component: ContactProfile,
  notFoundComponent: () => (
    <AppShell><div className="text-center py-20"><p>Contact not found.</p></div></AppShell>
  ),
});

const tabs = ["Overview", "Timeline", "Notes", "Emails", "Meetings"] as const;

function ContactProfile() {
  const { contact: c } = Route.useLoaderData();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const qc = useQueryClient();

  const { data: interactions = [] } = useQuery({
    queryKey: ["interactions", c.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("interactions")
        .select("*")
        .eq("contact_id", c.id)
        .order("occurred_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: journal = [] } = useQuery({
    queryKey: ["journal", c.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("contact_id", c.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const saveNote = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        contact_id: c.id,
        type: "note",
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal", c.id] }),
  });

  const [noteText, setNoteText] = useState(c.notes ?? "");
  const [noteSaved, setNoteSaved] = useState(false);

  const fullName = `${c.first_name} ${c.last_name}`;
  const color = avatarColor(c.id);
  const ini = initials(c.first_name, c.last_name);
  const days = daysSince(c.last_contact_at);
  const statusCap = capitalize(c.status);

  return (
    <AppShell>
      <div className="space-y-6">
        <Link to="/contacts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to contacts
        </Link>

        <header className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-start gap-6">
            <Avatar initials={ini} color={color} size={80} />
            <div className="flex-1 min-w-[200px]">
              <h1 className="text-2xl font-semibold tracking-tight">{fullName}</h1>
              <p className="text-muted-foreground">{c.role}{c.companies?.name ? ` · ${c.companies.name}` : ""}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <StatusBadge status={statusCap} />
                {c.companies?.industry && <span className="text-xs text-muted-foreground">{c.companies.industry}</span>}
                {days !== null && <span className="text-xs text-muted-foreground">Last contact: {days}d ago</span>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Relationship Score</div>
                <div className="mt-1 flex items-center justify-end gap-2">
                  <span className="text-3xl font-semibold tabular-nums">{c.relationship_score ?? 0}</span>
                  <span className="text-xs text-emerald-600 font-medium">/ 100</span>
                </div>
                <ScoreRing score={c.relationship_score ?? 0} />
              </div>
              <div className="flex gap-2">
                {c.work_email && (
                  <a href={`mailto:${c.work_email}`}>
                    <Button size="sm" variant="outline"><Mail className="h-4 w-4" />Email</Button>
                  </a>
                )}
                {c.linkedin_url && (
                  <a href={c.linkedin_url} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline"><Linkedin className="h-4 w-4" />LinkedIn</Button>
                  </a>
                )}
                <Link to="/meetings"><Button size="sm"><Calendar className="h-4 w-4" />Schedule</Button></Link>
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
            <h3 className="text-sm font-semibold">Contact Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {c.work_email && <Field label="Work Email" value={c.work_email} icon={Mail} />}
              {c.personal_email && <Field label="Personal Email" value={c.personal_email} icon={Mail} />}
              {c.phone && <Field label="Phone" value={c.phone} icon={Phone} />}
              {c.linkedin_url && <Field label="LinkedIn" value={c.linkedin_url} icon={Linkedin} />}
              {c.companies?.industry && <Field label="Industry" value={c.companies.industry} icon={TrendingUp} />}
              {c.companies?.domain && <Field label="Company Domain" value={c.companies.domain} icon={MessageSquare} />}
            </div>
          </div>
        )}

        {tab === "Timeline" && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold mb-6">Activity Timeline</h3>
            {interactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No interactions logged yet. Emails and meetings will appear here automatically.</p>
            ) : (
              <ol className="relative border-l border-border ml-3 space-y-6">
                {interactions.map((e: any) => (
                  <li key={e.id} className="ml-6">
                    <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                    <div className="text-xs text-muted-foreground">{new Date(e.occurred_at).toLocaleDateString()}</div>
                    <div className="font-medium text-sm mt-0.5">{e.summary ?? e.type}</div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {tab === "Notes" && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-semibold">Notes</h3>
            <textarea
              className="w-full min-h-[180px] rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              value={noteText}
              onChange={e => { setNoteText(e.target.value); setNoteSaved(false); }}
              placeholder="Add notes about this contact…"
            />
            <div className="flex items-center justify-between">
              {noteSaved && <span className="text-xs text-emerald-600">Saved!</span>}
              <Button
                size="sm"
                className="ml-auto"
                disabled={saveNote.isPending}
                onClick={() => saveNote.mutate(noteText, { onSuccess: () => setNoteSaved(true) })}
              >
                {saveNote.isPending ? "Saving…" : "Save note"}
              </Button>
            </div>
            {journal.length > 0 && (
              <div className="pt-4 border-t border-border space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Previous journal entries</p>
                {journal.map((j: any) => (
                  <div key={j.id} className="rounded-lg bg-muted/40 p-3 text-sm">
                    <div className="text-xs text-muted-foreground mb-1">{new Date(j.created_at).toLocaleDateString()}</div>
                    <p>{j.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "Emails" && (
          <EmptyTab icon={Mail} title="Email thread" desc="Connect Gmail or Outlook in Settings to sync conversations." />
        )}
        {tab === "Meetings" && (
          <EmptyTab icon={Calendar} title="No meetings yet" desc="Schedule a call and it will appear here automatically." />
        )}
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
