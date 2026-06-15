import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Send, Calendar, Activity, Settings, Search,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/outreach", label: "Outreach", icon: Send },
  { to: "/meetings", label: "Meetings", icon: Calendar },
  { to: "/activity", label: "Activity Feed", icon: Activity },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="px-5 h-16 flex items-center gap-2 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-sm font-semibold">N</div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">NetworkOS</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Relationship OS</span>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {nav.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-medium">AY</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Alex Yang</div>
              <div className="text-xs text-muted-foreground truncate">alex@networkos.app</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10 flex items-center px-4 md:px-8 gap-4">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">N</div>
            <span className="text-sm font-semibold">NetworkOS</span>
          </div>
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search people, companies, schools, industries…"
              className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:bg-background transition"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <kbd className="hidden md:inline-flex h-6 px-1.5 items-center gap-1 rounded border border-border bg-muted/40 text-[10px] text-muted-foreground">⌘K</kbd>
          </div>
        </header>
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export function Avatar({ initials, color, size = 40 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-medium shrink-0"
      style={{ background: color, width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Cold: "bg-muted text-muted-foreground",
    Networking: "bg-blue-50 text-blue-700",
    Warm: "bg-amber-50 text-amber-700",
    Mentor: "bg-violet-50 text-violet-700",
    Advocate: "bg-emerald-50 text-emerald-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? "bg-muted"}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {status}
    </span>
  );
}

export function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-muted-foreground";
  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="w-8 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-muted-foreground/40"}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-medium tabular-nums ${color}`}>{score}</span>
    </div>
  );
}
