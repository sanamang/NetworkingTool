import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Avatar, StatusBadge, ScoreRing } from "@/components/app-shell";
import { contacts } from "@/lib/mock-data";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/contacts/")({
  head: () => ({ meta: [{ title: "Contacts · NetworkOS" }] }),
  component: ContactsPage,
});

const filters = ["Company", "Industry", "University", "Location", "Relationship Strength"];

function ContactsPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return contacts;
    return contacts.filter(c =>
      [c.name, c.company, c.role, c.industry, c.university, c.location].join(" ").toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground text-sm mt-1">{contacts.length} people across your network</p>
          </div>
          <Button><Plus className="h-4 w-4" /> Add contact</Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search people, companies, schools, industries…"
              className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          {filters.map(f => (
            <button key={f} className="h-10 px-3 inline-flex items-center gap-1.5 rounded-md border border-input bg-card text-sm hover:bg-accent transition">
              <SlidersHorizontal className="h-3.5 w-3.5" /> {f}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-[var(--shadow-soft)]">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Name</th>
                <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Company</th>
                <th className="text-left font-medium px-4 py-3 hidden lg:table-cell">Role</th>
                <th className="text-left font-medium px-4 py-3">Relationship</th>
                <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Last Contact</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
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
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground tabular-nums">{c.lastContactDays}d ago</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
