import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Avatar } from "@/components/app-shell";
import { contacts, timeline, getContact } from "@/lib/mock-data";
import { Mail, MessageCircle, Calendar, TrendingUp, FileText } from "lucide-react";

export const Route = createFileRoute("/activity")({
  head: () => ({ meta: [{ title: "Activity Feed · NetworkOS" }] }),
  component: ActivityPage,
});

const iconFor = { outreach: MessageCircle, meeting: Calendar, email: Mail, signal: TrendingUp, note: FileText } as const;

const allEvents = [
  ...timeline,
  ...contacts.slice(0, 8).map((c, i) => ({
    id: `g${i}`, contactId: c.id,
    date: `${["Today", "Yesterday", "2d ago", "3d ago", "4d ago", "5d ago", "1w ago", "1w ago"][i]}`,
    type: (["email", "meeting", "outreach", "signal", "note", "email", "signal", "meeting"][i]) as keyof typeof iconFor,
    title: [
      `Reply received from ${c.name}`,
      `Coffee chat scheduled with ${c.name}`,
      `Outreach sent to ${c.name}`,
      `${c.name} was mentioned in TechCrunch`,
      `Added a note on ${c.name}`,
      `Email opened by ${c.name}`,
      `${c.name} changed roles`,
      `Meeting completed with ${c.name}`,
    ][i],
    detail: [
      "Suggested availability next Thursday morning.",
      "30 min · Dineen Coffee, Toronto",
      "Coffee chat — career path",
      `${c.company} highlighted in funding round announcement`,
      "Met at alumni mixer; interested in mentorship",
      "First open at 9:42 AM",
      `Now ${c.role} at ${c.company}`,
      "Sent thank-you and follow-up resources",
    ][i],
  })),
];

function ActivityPage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Activity Feed</h1>
          <p className="text-muted-foreground text-sm mt-1">Everything happening across your relationships.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <ol className="space-y-5">
            {allEvents.map((e) => {
              const Icon = iconFor[e.type];
              const c = getContact(e.contactId);
              return (
                <li key={e.id} className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0 pb-5 border-b border-border last:border-0">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="font-medium text-sm">{e.title}</div>
                      <div className="text-xs text-muted-foreground tabular-nums">{e.date}</div>
                    </div>
                    {e.detail && <div className="text-sm text-muted-foreground mt-0.5">{e.detail}</div>}
                    {c && (
                      <div className="mt-2 flex items-center gap-2">
                        <Avatar initials={c.initials} color={c.avatarColor} size={20} />
                        <span className="text-xs text-muted-foreground">{c.name} · {c.company}</span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </AppShell>
  );
}
