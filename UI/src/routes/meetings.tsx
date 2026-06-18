import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell, Avatar } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase, avatarColor, initials, capitalize } from "@/lib/supabase";
import { Calendar, MapPin, Sparkles, BookOpen, MessageCircle, X, Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/meetings")({
  component: MeetingsPage,
});

function useMeetings() {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*, contacts(id, first_name, last_name, role, companies(name))")
        .order("scheduled_start_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useContacts() {
  return useQuery({
    queryKey: ["contacts-list"],
    queryFn: async () => {
      const { data } = await supabase.from("contacts").select("id, first_name, last_name, role, companies(name)").order("first_name");
      return data ?? [];
    },
  });
}

function AddMeetingModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { data: contacts = [] } = useContacts();
  const [form, setForm] = useState({ contact_id: "", title: "", scheduled_start_at: "", duration_minutes: 30, location: "", meeting_link: "", description: "" });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const start = new Date(form.scheduled_start_at);
      const end = new Date(start.getTime() + form.duration_minutes * 60000);
      const { error } = await supabase.from("meetings").insert({
        user_id: user.id,
        contact_id: form.contact_id,
        title: form.title,
        scheduled_start_at: start.toISOString(),
        scheduled_end_at: end.toISOString(),
        duration_minutes: form.duration_minutes,
        location: form.location || null,
        meeting_link: form.meeting_link || null,
        description: form.description || null,
        status: "scheduled",
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["meetings"] }); onClose(); },
    onError: (e: any) => setError(e.message),
  });

  const inputClass = "w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition";

  return (
    <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-elevated)] w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold">Schedule Meeting</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="p-5 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Contact *</label>
            <select required value={form.contact_id} onChange={e => setForm(p => ({ ...p, contact_id: e.target.value }))} className={inputClass + " cursor-pointer"}>
              <option value="">Select a contact</option>
              {contacts.map((c: any) => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}{c.companies?.name ? ` — ${c.companies.name}` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Meeting title *</label>
            <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inputClass} placeholder="Coffee chat / Informational interview" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Date & time *</label>
              <input required type="datetime-local" value={form.scheduled_start_at} onChange={e => setForm(p => ({ ...p, scheduled_start_at: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Duration (min)</label>
              <input type="number" min={5} max={480} value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: Number(e.target.value) }))} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Location</label>
            <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className={inputClass} placeholder="Dineen Coffee, Toronto / Zoom" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Meeting link</label>
            <input type="url" value={form.meeting_link} onChange={e => setForm(p => ({ ...p, meeting_link: e.target.value }))} className={inputClass} placeholder="https://zoom.us/j/…" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending} style={{ background: "var(--gradient-accent)" }}>
              {mutation.isPending ? "Saving…" : "Schedule"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MeetingsPage() {
  const { data: meetings = [], isLoading } = useMeetings();
  const [addOpen, setAddOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Meetings</h1>
            <p className="text-muted-foreground text-sm mt-1">Scheduled conversations & AI prep briefs.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setJournalOpen(true)}>Log meeting</Button>
            <Button onClick={() => setAddOpen(true)} style={{ background: "var(--gradient-accent)" }}>
              <Plus className="h-4 w-4" /> Schedule meeting
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2].map(i => <div key={i} className="rounded-xl border border-border bg-card p-5 h-48 animate-pulse" />)}
          </div>
        ) : meetings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="mt-3 font-medium">No meetings scheduled</h3>
            <p className="mt-1 text-sm text-muted-foreground">Schedule your first meeting with a contact.</p>
            <Button size="sm" className="mt-4" onClick={() => setAddOpen(true)}>Schedule meeting</Button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold tracking-tight">Upcoming Meetings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {meetings.map((m: any) => {
                const contact = m.contacts;
                if (!contact) return null;
                const color = avatarColor(contact.id);
                const ini = initials(contact.first_name, contact.last_name);
                const fullName = `${contact.first_name} ${contact.last_name}`;
                const start = m.scheduled_start_at ? new Date(m.scheduled_start_at) : null;
                return (
                  <div key={m.id} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                    <div className="flex items-start gap-4">
                      <Avatar initials={ini} color={color} size={48} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{fullName}</div>
                        <div className="text-sm text-muted-foreground">{contact.role}{contact.companies?.name ? ` · ${contact.companies.name}` : ""}</div>
                        {start && (
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {start.toLocaleDateString()} · {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {m.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{m.location}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 text-sm font-medium">{m.title}</div>

                    <div className="mt-4 rounded-lg border border-border bg-gradient-to-br from-violet-50/60 to-accent/30 p-4 space-y-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-violet-700">
                        <Sparkles className="h-3.5 w-3.5" /> Meeting Prep Brief
                      </div>
                      <BriefSection icon={BookOpen} title="About this person">
                        {fullName} is {contact.role ? `a ${contact.role}` : "a contact"}{contact.companies?.name ? ` at ${contact.companies.name}` : ""}.
                      </BriefSection>
                      <BriefSection icon={MessageCircle} title="Suggested topics">
                        Career trajectory · current projects · industry trends · how you can help each other.
                      </BriefSection>
                      {m.description && (
                        <BriefSection icon={MessageCircle} title="Meeting notes">{m.description}</BriefSection>
                      )}
                      {m.meeting_link && (
                        <a href={m.meeting_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary underline">
                          Join meeting
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {addOpen && <AddMeetingModal onClose={() => setAddOpen(false)} />}
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
  const qc = useQueryClient();
  const { data: contacts = [] } = useContacts();
  const [contactId, setContactId] = useState("");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        contact_id: contactId || null,
        type: "meeting_summary",
        content,
        call_date: new Date().toISOString(),
      });
      if (error) throw error;
      await supabase.from("interactions").insert({
        user_id: user.id,
        contact_id: contactId || null,
        type: "meeting",
        reference_type: "journal_entry",
        summary: content.slice(0, 100),
        occurred_at: new Date().toISOString(),
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["interactions"] }); setSaved(true); },
  });

  return (
    <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-elevated)] w-full max-w-xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold">Post-Meeting Journal</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {saved ? (
            <div className="text-center py-4">
              <p className="font-medium text-emerald-600">Saved to journal!</p>
              <Button className="mt-4" onClick={onClose}>Done</Button>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium block mb-1.5">Contact</label>
                <select value={contactId} onChange={e => setContactId(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition">
                  <option value="">Select contact (optional)</option>
                  {contacts.map((c: any) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">How did the conversation go?</label>
                <textarea rows={5} value={content} onChange={e => setContent(e.target.value)} className="w-full rounded-md border border-input p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none" placeholder="Key takeaways, action items, things to follow up on…" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button disabled={mutation.isPending || !content.trim()} onClick={() => mutation.mutate()} style={{ background: "var(--gradient-accent)" }}>
                  {mutation.isPending ? "Saving…" : "Save journal entry"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
