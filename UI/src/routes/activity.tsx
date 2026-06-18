import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, Avatar } from "@/components/app-shell";
import { supabase, avatarColor, initials } from "@/lib/supabase";
import { Mail, MessageCircle, Calendar, TrendingUp, FileText } from "lucide-react";

export const Route = createFileRoute("/activity")({
  component: ActivityPage,
});

const iconFor: Record<string, React.ElementType> = {
  email_sent: Mail,
  email_received: Mail,
  meeting: Calendar,
  call: MessageCircle,
  note: FileText,
  reminder: TrendingUp,
};

function useActivity() {
  return useQuery({
    queryKey: ["activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interactions")
        .select("*, contacts(id, first_name, last_name, companies(name))")
        .order("occurred_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function ActivityPage() {
  const { data: events = [], isLoading } = useActivity();

  return (
    <AppShell>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Activity Feed</h1>
          <p className="text-muted-foreground text-sm mt-1">Everything happening across your relationships.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          {isLoading ? (
            <div className="space-y-5">
              {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-lg bg-muted/40 animate-pulse" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto" />
              <h3 className="mt-3 font-medium">No activity yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Activity is logged automatically when you send emails, schedule meetings, and add journal notes.
              </p>
            </div>
          ) : (
            <ol className="space-y-5">
              {events.map((e: any) => {
                const Icon = iconFor[e.type] ?? FileText;
                const contact = e.contacts;
                return (
                  <li key={e.id} className="flex gap-4">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 pb-5 border-b border-border last:border-0">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="font-medium text-sm">{e.summary ?? e.type.replace(/_/g, " ")}</div>
                        <div className="text-xs text-muted-foreground tabular-nums shrink-0">{timeAgo(e.occurred_at)}</div>
                      </div>
                      {contact && (
                        <div className="mt-2 flex items-center gap-2">
                          <Avatar
                            initials={initials(contact.first_name, contact.last_name)}
                            color={avatarColor(contact.id)}
                            size={20}
                          />
                          <span className="text-xs text-muted-foreground">
                            {contact.first_name} {contact.last_name}
                            {contact.companies?.name ? ` · ${contact.companies.name}` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </AppShell>
  );
}
