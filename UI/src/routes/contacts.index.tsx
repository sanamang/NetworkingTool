import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell, Avatar, StatusBadge, ScoreRing } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase, avatarColor, initials, daysSince, capitalize } from "@/lib/supabase";
import { Search, Plus, X } from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/contacts/")({
  component: ContactsPage,
});

function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*, companies(id, name, industry)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

const STATUS_OPTIONS = ["cold", "networking", "warm", "mentor", "advocate"];

function AddContactModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    first_name: "", last_name: "", role: "",
    work_email: "", company_name: "", notes: "",
    status: "cold", relationship_score: 50,
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let company_id: string | null = null;
      if (form.company_name.trim()) {
        const { data: existing } = await supabase
          .from("companies")
          .select("id")
          .ilike("name", form.company_name.trim())
          .single();
        if (existing) {
          company_id = existing.id;
        } else {
          const { data: created } = await supabase
            .from("companies")
            .insert({ name: form.company_name.trim(), created_by: user.id })
            .select("id")
            .single();
          company_id = created?.id ?? null;
        }
      }

      const { error } = await supabase.from("contacts").insert({
        user_id: user.id,
        company_id,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        role: form.role.trim() || null,
        work_email: form.work_email.trim() || null,
        notes: form.notes.trim() || null,
        status: form.status,
        relationship_score: form.relationship_score,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onClose();
    },
    onError: (e: any) => setError(e.message),
  });

  const inputClass = "w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition";

  return (
    <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-elevated)] w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold">Add Contact</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">First name *</label>
              <input required value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} className={inputClass} placeholder="Jane" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Last name *</label>
              <input required value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} className={inputClass} placeholder="Smith" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Company</label>
            <input value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} className={inputClass} placeholder="Brookfield Infrastructure" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Role / Title</label>
            <input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className={inputClass} placeholder="VP, Infrastructure" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Work email</label>
            <input type="email" value={form.work_email} onChange={e => setForm(p => ({ ...p, work_email: e.target.value }))} className={inputClass} placeholder="jane@company.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className={inputClass + " cursor-pointer"}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{capitalize(s)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Relationship score (0–100)</label>
              <input type="number" min={0} max={100} value={form.relationship_score} onChange={e => setForm(p => ({ ...p, relationship_score: Number(e.target.value) }))} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition resize-none" placeholder="How you met, mutual interests…" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending} style={{ background: "var(--gradient-accent)" }}>
              {mutation.isPending ? "Saving…" : "Add contact"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ContactsPage() {
  const { data: rawContacts = [], isLoading } = useContacts();
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const contacts = useMemo(() => {
    const s = q.toLowerCase().trim();
    return rawContacts
      .map((c: any) => ({
        id: c.id,
        name: `${c.first_name} ${c.last_name}`,
        role: c.role ?? "",
        company: c.companies?.name ?? "",
        industry: c.companies?.industry ?? "",
        email: c.work_email ?? "",
        avatarColor: avatarColor(c.id),
        initials: initials(c.first_name, c.last_name),
        score: c.relationship_score ?? 0,
        status: capitalize(c.status),
        lastContactDays: daysSince(c.last_contact_at),
      }))
      .filter(c => !s || [c.name, c.company, c.role, c.industry, c.email].join(" ").toLowerCase().includes(s));
  }, [rawContacts, q]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground text-sm mt-1">{rawContacts.length} people across your network</p>
          </div>
          <Button onClick={() => setAddOpen(true)} style={{ background: "var(--gradient-accent)" }}>
            <Plus className="h-4 w-4" /> Add contact
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people, companies, roles…"
            className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground animate-pulse">Loading contacts…</div>
        ) : contacts.length === 0 && !q ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="mt-3 font-medium">No contacts yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add your first contact to get started.</p>
            <Button size="sm" className="mt-4" onClick={() => setAddOpen(true)}>Add contact</Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-[var(--shadow-soft)]">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Name</th>
                  <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Company</th>
                  <th className="text-left font-medium px-4 py-3 hidden lg:table-cell">Role</th>
                  <th className="text-left font-medium px-4 py-3">Score</th>
                  <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Last Contact</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-accent/30 transition">
                    <td className="px-4 py-3">
                      <Link to="/contacts/$id" params={{ id: c.id }} className="flex items-center gap-3 group">
                        <Avatar initials={c.initials} color={c.avatarColor} size={32} />
                        <span className="font-medium group-hover:underline">{c.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-foreground/80">{c.company}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{c.role}</td>
                    <td className="px-4 py-3"><ScoreRing score={c.score} /></td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground tabular-nums">
                      {c.lastContactDays === null ? "Never" : `${c.lastContactDays}d ago`}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {addOpen && <AddContactModal onClose={() => setAddOpen(false)} />}
    </AppShell>
  );
}

// local import for empty state icon
import { Users } from "lucide-react";
